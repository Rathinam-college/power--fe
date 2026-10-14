import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap, Calendar, Building2, Tag, AlertCircle, CheckCircle2, Edit2, Trash2, Building } from 'lucide-react'
import API_BASE from '../apiConfig';

const fmt = (v, dec = 2) => (v !== null && v !== undefined) ? Number(v).toFixed(dec) : '—'
const INR = (v) => v !== null && v !== undefined ? `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v))}` : '—'
const INRR = (v) => v !== null && v !== undefined ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.ceil(Number(v)))}` : '—'

export default function MeterReadingForm() {
    const [companies, setCompanies] = useState([])
    const [taxes, setTaxes] = useState([])
    const [readings, setReadings] = useState([])
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [previousReading, setPreviousReading] = useState(null)
    const [form, setForm] = useState({
        company: '',
        reading_date: new Date().toISOString().split('T')[0],
        current_reading: '',
        previous_reading_manual_override: false,
        manual_previous_reading: '',
        peak_hour_enabled: false,
        peak_hour_manual_override: false,
        peak_hour_manual_value: '',
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedReading, setSelectedReading] = useState(null)
    const [editForm, setEditForm] = useState({ reading_date: '', current_reading: '', peak_hour_enabled: false, peak_hour_manual_override: false, peak_hour_manual_value: '' })

    useEffect(() => {
        fetchCompanies()
        fetchTaxes()
        fetchReadings()
    }, [])

    const fetchCompanies = async () => {
        try {
            const res = await axios.get(`${API_BASE}/companies/`)
            setCompanies(res.data)
        } catch (e) { console.error(e) }
    }

    const fetchTaxes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/taxes/`)
            setTaxes(res.data)
        } catch (e) { console.error(e) }
    }

    const fetchReadings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/readings/`)
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
            const res = await axios.get(`${API_BASE}/readings/?company=${companyId}`)
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

    const activeConfig = selectedCompany?.meter_configs
        ?.filter(c => c.effective_date <= form.reading_date)
        ?.sort((a, b) => b.effective_date.localeCompare(a.effective_date))?.[0]

    const unitsConsumed = form.current_reading !== ''
        ? Math.max(0, parseFloat(form.current_reading) - currentPreviousReading)
        : null

    const fixedDemandAmount = activeConfig && activeConfig.fixed_demand !== null && activeConfig.kw_kva !== null
        ? parseFloat(activeConfig.fixed_demand) * parseFloat(activeConfig.kw_kva)
        : null

    let peakHourPreview = null
    if (activeConfig && form.peak_hour_enabled) {
        if (form.peak_hour_manual_override && form.peak_hour_manual_value !== '') {
            peakHourPreview = parseFloat(form.peak_hour_manual_value)
        } else if (unitsConsumed !== null && activeConfig.unit_cost) {
            peakHourPreview = (unitsConsumed * 0.25) * (parseFloat(activeConfig.unit_cost) * 0.20)
        }
    }

    let stotalPreview = null
    let taxPreview = null
    let netAmountPreview = null
    let amountPreview = null

    let activeTaxPercentage = 5.0
    if (taxes.length > 0) {
        const activeTax = taxes.filter(t => t.effective_date <= form.reading_date).sort((a, b) => b.effective_date.localeCompare(a.effective_date))[0]
        if (activeTax) activeTaxPercentage = parseFloat(activeTax.percentage)
    }

    if (activeConfig && unitsConsumed !== null && activeConfig.unit_cost) {
        amountPreview = unitsConsumed * parseFloat(activeConfig.unit_cost)
        stotalPreview = amountPreview + (fixedDemandAmount || 0) + (peakHourPreview || 0)
        taxPreview = stotalPreview * (activeTaxPercentage / 100)
        netAmountPreview = stotalPreview + taxPreview
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.company || !form.current_reading) return
        const payload = {
            company: form.company,
            reading_date: form.reading_date,
            previous_reading: currentPreviousReading,
            current_reading: parseFloat(form.current_reading),
            reading_value: unitsConsumed ?? 0,
            peak_hour_enabled: form.peak_hour_enabled,
            peak_hour_manual_override: form.peak_hour_enabled && form.peak_hour_manual_override,
            peak_hour_manual_value: form.peak_hour_enabled && form.peak_hour_manual_override && form.peak_hour_manual_value !== ''
                ? parseFloat(form.peak_hour_manual_value) : null,
        }
        try {
            await axios.post(`${API_BASE}/readings/`, payload)
            setStatus({ type: 'success', message: 'Meter reading recorded successfully!' })
            setForm(f => ({ ...f, company: '', current_reading: '', previous_reading_manual_override: false, manual_previous_reading: '', peak_hour_enabled: false, peak_hour_manual_override: false, peak_hour_manual_value: '' }))
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
            peak_hour_enabled: r.peak_hour_enabled,
            peak_hour_manual_override: r.peak_hour_manual_override,
            peak_hour_manual_value: r.peak_hour_manual_value ?? ''
        })
        setIsEditModalOpen(true)
    }

    const editUnitsConsumed = editForm.current_reading && selectedReading
        ? Math.max(0, parseFloat(editForm.current_reading) - parseFloat(selectedReading.previous_reading))
        : null

    const handleEditReading = async (e) => {
        e.preventDefault()
        try {
            await axios.patch(`${API_BASE}/readings/${selectedReading.id}/`, {
                reading_date: editForm.reading_date,
                current_reading: parseFloat(editForm.current_reading),
                reading_value: editUnitsConsumed ?? 0,
                peak_hour_enabled: editForm.peak_hour_enabled,
                peak_hour_manual_override: editForm.peak_hour_enabled && editForm.peak_hour_manual_override,
                peak_hour_manual_value: editForm.peak_hour_enabled && editForm.peak_hour_manual_override && editForm.peak_hour_manual_value !== ''
                    ? parseFloat(editForm.peak_hour_manual_value) : null,
            })
            setIsEditModalOpen(false)
            setStatus({ type: 'success', message: 'Reading updated successfully!' })
            fetchReadings()
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to update reading.' })
        }
    }

    const handleDeleteReading = async (r) => {
        if (!window.confirm(`Delete reading for ${r.company_name} on ${r.reading_date}?`)) return
        try {
            await axios.delete(`${API_BASE}/readings/${r.id}/`)
            setStatus({ type: 'success', message: 'Reading deleted.' })
            fetchReadings()
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to delete reading.' })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-xl"><Zap size={28} className="text-blue-400" /></div>
                    EB Meter Reading Entry
                </h1>
                <p className="text-slate-400 mt-2">Record energy consumption readings per company</p>
            </header>

            {/* Status */}
            {status.message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-in zoom-in-95 ${status.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    {status.message}
                </div>
            )}

            {/* Entry Form */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-5">New Reading</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Company */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm text-slate-400 mb-2">Company *</label>
                            <select
                                required
                                value={form.company}
                                onChange={e => handleCompanyChange(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                            >
                                <option value="">— Select Company —</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {selectedCompany && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedCompany.category_name && (
                                        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Tag size={10} /> {selectedCompany.category_name}
                                        </span>
                                    )}
                                    {selectedCompany.block_name && (
                                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Building size={10} /> {selectedCompany.block_name}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Reading Date *</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="date"
                                    required
                                    value={form.reading_date}
                                    onChange={e => setForm(f => ({ ...f, reading_date: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Previous Reading */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm text-slate-400">Previous Reading</label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                        checked={form.previous_reading_manual_override}
                                        onChange={e => setForm(f => ({ ...f, previous_reading_manual_override: e.target.checked, manual_previous_reading: e.target.checked ? (previousReading || 0).toString() : '' }))}
                                    />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Override</span>
                                </label>
                            </div>
                            {form.previous_reading_manual_override ? (
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.manual_previous_reading}
                                    onChange={e => setForm(f => ({ ...f, manual_previous_reading: e.target.value }))}
                                    className="w-full bg-slate-950 border border-blue-500/50 rounded-xl px-4 py-2.5 text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="Enter previous reading..."
                                />
                            ) : (
                                <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-emerald-400 font-mono font-semibold">
                                    {previousReading !== null ? fmt(previousReading) : '—'}
                                </div>
                            )}
                        </div>

                        {/* Current Reading */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Current Reading *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.current_reading}
                                onChange={e => setForm(f => ({ ...f, current_reading: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Units consumed preview */}
                        {unitsConsumed !== null && (
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Units Consumed</label>
                                <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl px-4 py-2.5 text-blue-400 font-mono font-bold">
                                    {fmt(unitsConsumed)} kWh
                                </div>
                            </div>
                        )}

                        {/* Active Config Preview */}
                        {activeConfig && (
                            <div className="md:col-span-2 lg:col-span-3 bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 mt-2">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Zap size={12} className="text-yellow-500" /> Applicable Tariff Configuration
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-4 gap-x-6">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">Tariff</p>
                                        <p className="text-sm font-semibold text-slate-300">{activeConfig.tariff || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">Unit Cost</p>
                                        <p className="text-sm font-mono text-emerald-400 font-semibold">{INR(activeConfig.unit_cost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">KW / KVA</p>
                                        <p className="text-sm font-semibold text-slate-300">{fmt(activeConfig.kw_kva)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">Fixed Demand</p>
                                        <p className="text-sm font-mono text-yellow-400 font-semibold">{activeConfig.fixed_demand !== null ? INR(activeConfig.fixed_demand) : '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">FD Amount</p>
                                        <p className="text-sm font-mono text-blue-400 font-semibold">{fixedDemandAmount !== null ? INR(fixedDemandAmount) : '—'}</p>
                                    </div>
                                    {peakHourPreview !== null && (
                                        <div>
                                            <p className="text-[10px] text-amber-500 uppercase tracking-tight font-bold">Peak Charges</p>
                                            <p className="text-sm font-mono text-amber-400 font-bold">{INR(peakHourPreview)}</p>
                                        </div>
                                    )}
                                    {amountPreview !== null && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Amount (Units×Rate)</p>
                                            <p className="text-sm font-mono text-slate-300">{INR(amountPreview)}</p>
                                        </div>
                                    )}
                                    {stotalPreview !== null && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">STotal</p>
                                            <p className="text-sm font-mono text-emerald-400 font-semibold">{INR(stotalPreview)}</p>
                                        </div>
                                    )}
                                    {taxPreview !== null && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">{activeTaxPercentage}% Tax</p>
                                            <p className="text-sm font-mono text-slate-400">{INR(taxPreview)}</p>
                                        </div>
                                    )}
                                    {netAmountPreview !== null && (
                                        <div>
                                            <p className="text-[10px] text-yellow-500 uppercase tracking-tight font-bold">Net Amount</p>
                                            <p className="text-sm font-mono text-yellow-400 font-bold">{INRR(netAmountPreview)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Peak Hour Charges section */}
                    <div className="mb-5 space-y-3">
                        {/* Main toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={form.peak_hour_enabled}
                                    onChange={e => setForm(f => ({ ...f, peak_hour_enabled: e.target.checked, peak_hour_manual_override: false, peak_hour_manual_value: '' }))}
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${form.peak_hour_enabled ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.peak_hour_enabled ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white">Peak Hour Charges</span>
                                <p className="text-xs text-slate-500">Auto: (Units × 25%) × (Rate × 20%)</p>
                            </div>
                        </label>

                        {/* Manual override — only shown when peak hour is ON */}
                        {form.peak_hour_enabled && (
                            <div className="ml-4 pl-4 border-l-2 border-amber-500/30 space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={form.peak_hour_manual_override}
                                            onChange={e => setForm(f => ({ ...f, peak_hour_manual_override: e.target.checked, peak_hour_manual_value: '' }))}
                                        />
                                        <div className={`w-8 h-5 rounded-full transition-colors ${form.peak_hour_manual_override ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.peak_hour_manual_override ? 'translate-x-3' : ''}`}></div>
                                    </div>
                                    <span className="text-xs text-slate-400">Manual Override</span>
                                </label>
                                {form.peak_hour_manual_override && (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.peak_hour_manual_value}
                                        onChange={e => setForm(f => ({ ...f, peak_hour_manual_value: e.target.value }))}
                                        className="w-48 bg-slate-950 border border-orange-500/40 rounded-xl px-4 py-2 text-orange-300 font-mono focus:outline-none focus:border-orange-400 transition-all"
                                        placeholder="Enter amount (₹)"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-950"
                    >
                        <Zap size={16} /> Record Reading
                    </button>
                </form>
            </div>

            {/* Recent Entries Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Recent Entries</h2>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{readings.length} records</span>
                </div>
                <div className="overflow-x-auto">
                    {readings.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No readings recorded yet.</div>
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
                                    <th className="px-3 py-3 text-right">Units</th>
                                    <th className="px-3 py-3 text-right">Rate(₹)</th>
                                    <th className="px-3 py-3 text-right">Amount(₹)</th>
                                    <th className="px-3 py-3 text-right">FD(₹)</th>
                                    <th className="px-3 py-3 text-right">KW/KVA</th>
                                    <th className="px-3 py-3 text-right">FD×KVA(₹)</th>
                                    <th className="px-3 py-3 text-right">Peak Hr(₹)</th>
                                    <th className="px-3 py-3 text-right">Subtotal(₹)</th>
                                    <th className="px-3 py-3 text-right">Tax %</th>
                                    <th className="px-3 py-3 text-right">Tax(₹)</th>
                                    <th className="px-3 py-3 text-right font-bold text-amber-400">Net Amt(₹)</th>
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
                                        <td className="px-3 py-3 text-right font-mono text-cyan-400 font-semibold">{fmt(r.reading_value)}</td>
                                        <td className="px-3 py-3 text-right font-mono">{r.unit_rate != null ? r.unit_rate : '—'}</td>
                                        <td className="px-3 py-3 text-right font-mono text-blue-400">{INR(r.amount)}</td>
                                        <td className="px-3 py-3 text-right font-mono text-purple-400">{INR(r.fixed_demand)}</td>
                                        <td className="px-3 py-3 text-right font-mono text-slate-400">{r.per_kva != null ? r.per_kva : '—'}</td>
                                        <td className="px-3 py-3 text-right font-mono text-purple-300">{INR(r.fd_price)}</td>
                                        <td className="px-3 py-3 text-right font-mono">
                                            {r.peak_hour_enabled
                                                ? <span className="text-amber-400">{INR(r.peak_hour_charges)}</span>
                                                : <span className="text-slate-600 text-xs">—</span>
                                            }
                                        </td>
                                        <td className="px-3 py-3 text-right font-mono text-emerald-400 font-semibold">{INR(r.stotal)}</td>
                                        <td className="px-3 py-3 text-right font-mono text-slate-500">{r.tax_percentage}%</td>
                                        <td className="px-3 py-3 text-right font-mono text-slate-400">{INR(r.tax_amount)}</td>
                                        <td className="px-3 py-3 text-right font-mono text-yellow-400 font-bold text-base">{INRR(r.net_amount)}</td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleEditClick(r)}
                                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Edit">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button onClick={() => handleDeleteReading(r)}
                                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
                                                    <Trash2 size={13} />
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

            {/* Edit Reading Modal */}
            {isEditModalOpen && selectedReading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-1">Edit Reading</h2>
                        <p className="text-slate-400 text-sm mb-5">
                            {selectedReading.company_name}
                            {selectedReading.block_name && <span className="ml-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">{selectedReading.block_name}</span>}
                            {selectedReading.category_name && <span className="ml-2 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{selectedReading.category_name}</span>}
                        </p>
                        <form onSubmit={handleEditReading} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Reading Date</label>
                                <input type="date" required value={editForm.reading_date}
                                    onChange={e => setEditForm(f => ({ ...f, reading_date: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Previous Reading (locked)</label>
                                <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-emerald-400 font-mono font-semibold">
                                    {fmt(selectedReading.previous_reading)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Current Reading</label>
                                <input type="number" step="0.01" required value={editForm.current_reading}
                                    onChange={e => setEditForm(f => ({ ...f, current_reading: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            {editUnitsConsumed !== null && (
                                <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <span className="text-sm text-slate-400">Units Consumed</span>
                                    <span className="text-xl font-bold text-emerald-400">{fmt(editUnitsConsumed)}</span>
                                </div>
                            )}
                            {/* Peak Hour toggle */}
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only"
                                        checked={editForm.peak_hour_enabled}
                                        onChange={e => setEditForm(f => ({ ...f, peak_hour_enabled: e.target.checked, peak_hour_manual_override: false, peak_hour_manual_value: '' }))} />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${editForm.peak_hour_enabled ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.peak_hour_enabled ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-sm text-white">Peak Hour Charges</span>
                            </label>
                            {editForm.peak_hour_enabled && (
                                <div className="ml-4 pl-4 border-l-2 border-amber-500/30 space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only"
                                                checked={editForm.peak_hour_manual_override}
                                                onChange={e => setEditForm(f => ({ ...f, peak_hour_manual_override: e.target.checked, peak_hour_manual_value: '' }))} />
                                            <div className={`w-8 h-5 rounded-full transition-colors ${editForm.peak_hour_manual_override ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.peak_hour_manual_override ? 'translate-x-3' : ''}`}></div>
                                        </div>
                                        <span className="text-xs text-slate-400">Manual Override</span>
                                    </label>
                                    {editForm.peak_hour_manual_override && (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.peak_hour_manual_value}
                                            onChange={e => setEditForm(f => ({ ...f, peak_hour_manual_value: e.target.value }))}
                                            className="w-48 bg-slate-950 border border-orange-500/40 rounded-xl px-4 py-2 text-orange-300 font-mono focus:outline-none focus:border-orange-400 transition-all"
                                            placeholder="Enter amount (₹)"
                                        />
                                    )}
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
