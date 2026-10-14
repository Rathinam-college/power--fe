import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap, Calendar, Building2, Tag, AlertCircle, CheckCircle2, Edit2, Trash2, Building } from 'lucide-react'
import API_BASE from '../apiConfig';

const fmt = (v, dec = 2) => (v !== null && v !== undefined) ? Number(v).toFixed(dec) : '—'

export default function GensetReadingForm() {
    const [companies, setCompanies] = useState([])
    const [readings, setReadings] = useState([])
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [previousReading, setPreviousReading] = useState(null)
    const [form, setForm] = useState({
        company: '',
        reading_date: new Date().toISOString().split('T')[0],
        current_reading: '',
        previous_reading_manual_override: false,
        manual_previous_reading: '',
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedReading, setSelectedReading] = useState(null)
    const [editForm, setEditForm] = useState({
        reading_date: '',
        current_reading: '',
        previous_reading_manual_override: false,
        manual_previous_reading: ''
    })

    useEffect(() => {
        fetchCompanies()
        fetchReadings()
    }, [])

    const fetchCompanies = async () => {
        try {
            const res = await axios.get(`${API_BASE}/companies/`)
            setCompanies(res.data)
        } catch (e) { console.error(e) }
    }

    const fetchReadings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/genset-readings/`)
            setReadings(res.data.reverse())
        } catch (e) { console.error(e) }
    }

    const handleCompanyChange = async (companyId) => {
        setForm(f => ({ ...f, company: companyId, previous_reading_manual_override: false, manual_previous_reading: '' }))
        setPreviousReading(null)
        setSelectedCompany(null)
        if (!companyId) return
        const company = companies.find(c => c.id === parseInt(companyId))
        setSelectedCompany(company)
        try {
            const res = await axios.get(`${API_BASE}/genset-readings/?company=${companyId}`)
            const all = res.data
            if (all.length > 0) {
                const sorted = [...all].sort((a, b) => {
                    if (b.reading_date !== a.reading_date) return b.reading_date.localeCompare(a.reading_date)
                    return b.id - a.id
                })
                setPreviousReading(sorted[0].current_reading)
            } else {
                setPreviousReading(0)
            }
        } catch (e) { setPreviousReading(0) }
    }

    const currentPreviousReading = form.previous_reading_manual_override
        ? (form.manual_previous_reading !== '' ? parseFloat(form.manual_previous_reading) : 0)
        : (previousReading !== null ? parseFloat(previousReading) : 0)

    const unitsConsumed = form.current_reading !== ''
        ? Math.max(0, parseFloat(form.current_reading) - currentPreviousReading)
        : null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.company || !form.current_reading) return
        const payload = {
            company: form.company,
            reading_date: form.reading_date,
            previous_reading: currentPreviousReading,
            current_reading: parseFloat(form.current_reading),
            reading_value: unitsConsumed ?? 0,
        }
        try {
            await axios.post(`${API_BASE}/genset-readings/`, payload)
            setStatus({ type: 'success', message: 'Genset reading recorded successfully!' })
            setForm(f => ({ ...f, company: '', current_reading: '', previous_reading_manual_override: false, manual_previous_reading: '' }))
            setSelectedCompany(null)
            setPreviousReading(null)
            fetchReadings()
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to record reading. Please try again.' })
        }
    }

    const handleEditClick = (r) => {
        setSelectedReading(r)
        setEditForm({
            reading_date: r.reading_date,
            current_reading: r.current_reading,
            previous_reading_manual_override: false,
            manual_previous_reading: r.previous_reading
        })
        setIsEditModalOpen(true)
    }

    const editPreviousReading = editForm.previous_reading_manual_override
        ? (editForm.manual_previous_reading !== '' ? parseFloat(editForm.manual_previous_reading) : 0)
        : (selectedReading ? parseFloat(selectedReading.previous_reading) : 0)

    const editUnitsConsumed = editForm.current_reading && selectedReading
        ? Math.max(0, parseFloat(editForm.current_reading) - editPreviousReading)
        : null

    const handleEditReading = async (e) => {
        e.preventDefault()
        try {
            await axios.patch(`${API_BASE}/genset-readings/${selectedReading.id}/`, {
                reading_date: editForm.reading_date,
                previous_reading: editPreviousReading,
                current_reading: parseFloat(editForm.current_reading),
                reading_value: editUnitsConsumed ?? 0,
            })
            setStatus({ type: 'success', message: 'Reading updated successfully!' })
            setIsEditModalOpen(false)
            fetchReadings()
            if (form.company && parseInt(form.company) === selectedReading.company) {
                handleCompanyChange(form.company)
            }
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to update reading.' })
        }
    }

    const handleDeleteReading = async (r) => {
        if (!window.confirm("Are you sure you want to delete this reading?")) return
        try {
            await axios.delete(`${API_BASE}/genset-readings/${r.id}/`)
            setStatus({ type: 'success', message: 'Reading deleted.' })
            fetchReadings()
            if (form.company) handleCompanyChange(form.company)
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to delete reading.' })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-xl"><Zap size={28} className="text-purple-400" /></div>
                    Genset Reading Entry
                </h1>
                <p className="text-slate-400">Record Genset generated units consumed by each company.</p>
            </header>

            {status.message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-in zoom-in-95 ${status.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    {status.message}
                </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Selection & Form */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Company</label>
                                    <div className="relative">
                                        <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <select
                                            required
                                            value={form.company}
                                            onChange={e => handleCompanyChange(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        >
                                            <option value="">Select a company...</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Reading Date</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="date"
                                            required
                                            value={form.reading_date}
                                            onChange={e => setForm(f => ({ ...f, reading_date: e.target.value }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Selected Company Details & Prev Reading */}
                        <div className="space-y-6">
                            {selectedCompany ? (
                                <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50 flex flex-col justify-center min-h-[160px]">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Building2 className="text-purple-400" />
                                        {selectedCompany.name}
                                    </h3>
                                    <div className="flex gap-4">
                                        {selectedCompany.category_name && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                                                <Tag size={14} /> {selectedCompany.category_name}
                                            </div>
                                        )}
                                        {selectedCompany.block_name && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20">
                                                <Building2 size={14} /> {selectedCompany.block_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[160px] bg-slate-900/30 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                                    Select a company to view details
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-800 w-full" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left: Input Fields */}
                        <div className="bg-slate-950/40 rounded-2xl p-6 border border-slate-800 space-y-6">
                            <h3 className="text-lg font-medium text-white mb-2">Reading Entry</h3>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-slate-400">Previous Reading</label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <span className="text-xs text-slate-500">Manual Override</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={form.previous_reading_manual_override}
                                                onChange={e => setForm(f => ({ ...f, previous_reading_manual_override: e.target.checked }))}
                                            />
                                            <div className={`w-8 h-4 rounded-full transition-colors ${form.previous_reading_manual_override ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${form.previous_reading_manual_override ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                                {form.previous_reading_manual_override ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={form.manual_previous_reading}
                                        onChange={e => setForm(f => ({ ...f, manual_previous_reading: e.target.value }))}
                                        className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500"
                                        placeholder="Enter previous reading manually"
                                    />
                                ) : (
                                    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono flex items-center justify-between">
                                        {previousReading !== null ? previousReading : <span className="text-slate-600 animate-pulse">Select company...</span>}
                                        {previousReading !== null && <span className="text-[10px] uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Auto</span>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Current Reading</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.current_reading}
                                    onChange={e => setForm(f => ({ ...f, current_reading: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Right: Preview Panel */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 h-full flex flex-col justify-center">
                            <h3 className="text-sm font-medium text-purple-400 mb-6 uppercase tracking-wider">Preview</h3>
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <span className="text-sm text-slate-400 font-medium">Units Generated Generated</span>
                                <div className="text-5xl font-bold font-mono text-white tracking-tight drop-shadow-md">
                                    {unitsConsumed !== null ? unitsConsumed.toFixed(2) : '0.00'}
                                </div>
                                {form.current_reading && (currentPreviousReading > parseFloat(form.current_reading)) && (
                                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle size={14} /> Current reading is less than previous
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-950"
                    >
                        <Zap size={16} /> Record Genset Reading
                    </button>
                </form>
            </div>

            {/* Recent Entries Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Recent Genset Entries</h2>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{readings.length} records</span>
                </div>
                <div className="overflow-x-auto">
                    {readings.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No genset readings recorded yet.</div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800 bg-slate-950/30">
                                    <th className="px-3 py-3">Date</th>
                                    <th className="px-3 py-3">Company</th>
                                    <th className="px-3 py-3">Block</th>
                                    <th className="px-3 py-3">Category</th>
                                    <th className="px-3 py-3 text-right">Prev</th>
                                    <th className="px-3 py-3 text-right">Current</th>
                                    <th className="px-3 py-3 text-right font-bold text-purple-400">Units</th>
                                    <th className="px-3 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {readings.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-3 py-3 text-slate-400 font-mono text-xs">{r.reading_date}</td>
                                        <td className="px-3 py-3 font-semibold text-white">{r.company_name}</td>
                                        <td className="px-3 py-3">
                                            {r.block_name
                                                ? <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">{r.block_name}</span>
                                                : <span className="text-slate-600 text-xs">—</span>
                                            }
                                        </td>
                                        <td className="px-3 py-3">
                                            {r.category_name
                                                ? <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{r.category_name}</span>
                                                : <span className="text-slate-600 text-xs">—</span>
                                            }
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono text-slate-400">{fmt(r.previous_reading)}</td>
                                        <td className="px-3 py-3 text-right font-mono text-slate-300">{fmt(r.current_reading)}</td>
                                        <td className="px-3 py-3 text-right font-mono text-purple-400 font-semibold">{fmt(r.reading_value)}</td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button type="button" onClick={() => handleEditClick(r)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button type="button" onClick={() => handleDeleteReading(r)}
                                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedReading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Edit2 className="text-blue-400" />
                            Edit Genset Reading
                        </h2>

                        <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
                            <p className="text-sm text-slate-400 mb-1">Company: <span className="text-white font-medium">{selectedReading.company_name}</span></p>
                            <p className="text-sm text-slate-400">Previous Reading: <span className="text-white font-mono">{selectedReading.previous_reading}</span></p>
                        </div>

                        <form onSubmit={handleEditReading} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Reading Date</label>
                                <input
                                    type="date"
                                    required
                                    value={editForm.reading_date}
                                    onChange={e => setEditForm(f => ({ ...f, reading_date: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-slate-400">Previous Reading</label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <span className="text-xs text-slate-500">Manual Override</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={editForm.previous_reading_manual_override}
                                                onChange={e => setEditForm(f => ({ ...f, previous_reading_manual_override: e.target.checked }))}
                                            />
                                            <div className={`w-8 h-4 rounded-full transition-colors ${editForm.previous_reading_manual_override ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${editForm.previous_reading_manual_override ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                                {editForm.previous_reading_manual_override ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={editForm.manual_previous_reading}
                                        onChange={e => setEditForm(f => ({ ...f, manual_previous_reading: e.target.value }))}
                                        className="w-full bg-slate-950 border border-blue-500/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                                        placeholder="Enter previous reading manually"
                                    />
                                ) : (
                                    <div className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-400 font-mono flex items-center justify-between">
                                        {selectedReading.previous_reading}
                                        <span className="text-[10px] uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Locked</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Current Reading</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editForm.current_reading}
                                    onChange={e => setEditForm(f => ({ ...f, current_reading: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex justify-between items-center">
                                <span className="text-sm text-purple-200">New Calculated Units</span>
                                <span className="text-xl font-bold font-mono text-purple-400">
                                    {editUnitsConsumed !== null ? editUnitsConsumed.toFixed(2) : '0.00'}
                                </span>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold transition-colors">
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl font-semibold transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
