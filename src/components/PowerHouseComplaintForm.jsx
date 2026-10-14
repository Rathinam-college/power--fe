import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE from '../apiConfig'
import {
    Calendar, Clock, Trash2, AlertCircle, Loader2,
    MessageSquare, CheckCircle2, Pencil, X as CloseIcon,
    ToggleLeft, ToggleRight, Building2, UserCircle
} from 'lucide-react'

export default function PowerHouseComplaintForm() {
    const [entries, setEntries] = useState([])
    const [blocks, setBlocks] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [editingId, setEditingId] = useState(null)

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        is_block_location: true,
        block: '',
        manual_location: '',
        complaint_request: '',
        is_closed: false,
        start_time: '',
        end_time: '',
        duration: ''
    })

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        calculateDuration()
    }, [form.start_time, form.end_time, form.is_closed])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            const [complaintsRes, blocksRes] = await Promise.all([
                axios.get(`${API_BASE}/complaints/`),
                axios.get(`${API_BASE}/blocks/`)
            ])
            setEntries(complaintsRes.data)
            setBlocks(blocksRes.data)
        } catch (e) {
            setError('Failed to fetch initial data.')
        } finally {
            setLoading(false)
        }
    }

    const calculateDuration = () => {
        if (!form.is_closed || !form.start_time || !form.end_time) {
            setForm(prev => ({ ...prev, duration: '' }))
            return
        }

        const startParts = form.start_time.split(':')
        const endParts = form.end_time.split(':')

        const start = new Date(0, 0, 0, startParts[0], startParts[1])
        const end = new Date(0, 0, 0, endParts[0], endParts[1])

        let diff = end - start
        if (diff < 0) diff += 24 * 60 * 60 * 1000 // handle overnight

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        const durationStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        setForm(prev => ({ ...prev, duration: durationStr }))
    }

    const resetForm = () => {
        setForm({
            date: new Date().toISOString().split('T')[0],
            is_block_location: true,
            block: '',
            manual_location: '',
            complaint_request: '',
            is_closed: false,
            start_time: '',
            end_time: '',
            duration: ''
        })
        setEditingId(null)
        setError(null)
    }

    const handleEdit = (entry) => {
        setForm({
            date: entry.date,
            is_block_location: entry.is_block_location,
            block: entry.block || '',
            manual_location: entry.manual_location || '',
            complaint_request: entry.complaint_request,
            is_closed: entry.is_closed,
            start_time: entry.start_time.slice(0, 5),
            end_time: entry.end_time ? entry.end_time.slice(0, 5) : '',
            duration: entry.duration
        })
        setEditingId(entry.id)
        setError(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            setError(null)

            // Clean up payload based on toggle
            const payload = { ...form }
            if (payload.is_block_location) {
                payload.manual_location = ''
            } else {
                payload.block = null
            }
            if (!payload.is_closed || payload.end_time === '') {
                payload.end_time = null
                payload.duration = null
            }

            if (editingId) {
                await axios.put(`${API_BASE}/complaints/${editingId}/`, payload)
                setSuccess('Complaint updated successfully!')
            } else {
                await axios.post(`${API_BASE}/complaints/`, payload)
                setSuccess('Complaint recorded successfully!')
            }
            resetForm()
            fetchInitialData()
            setTimeout(() => setSuccess(null), 3000)
        } catch (e) {
            setError('Failed to save complaint. Please check inputs.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this entry?')) return
        try {
            setError(null)
            await axios.delete(`${API_BASE}/complaints/${id}/`)
            fetchInitialData()
            setSuccess('Entry deleted')
            setTimeout(() => setSuccess(null), 3000)
        } catch (e) {
            setError('Failed to delete entry.')
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                        <MessageSquare size={28} className="text-amber-400" />
                    </div>
                    {editingId ? 'Edit Power House Complaint' : 'Power House Complaints'}
                </h1>
                <p className="text-slate-400 mt-2">Manage electrical service requests and powerhouse issues</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageSquare size={120} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-400">Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-400">Location Type</label>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, is_block_location: !form.is_block_location })}
                                    className="w-full flex items-center justify-between bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white hover:border-slate-500 transition-all"
                                >
                                    <span className="flex items-center gap-2">
                                        {form.is_block_location ? <Building2 size={18} className="text-blue-400" /> : <UserCircle size={18} className="text-amber-400" />}
                                        {form.is_block_location ? 'Block Selection' : 'Manual Entry'}
                                    </span>
                                    {form.is_block_location ? <ToggleRight className="text-blue-500" size={28} /> : <ToggleLeft className="text-slate-600" size={28} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-400">
                                {form.is_block_location ? 'Select Block' : 'Enter Location Manually'}
                            </label>
                            {form.is_block_location ? (
                                <select
                                    required={form.is_block_location}
                                    value={form.block}
                                    onChange={e => setForm({ ...form, block: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                >
                                    <option value="">-- Choose Block --</option>
                                    {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    required={!form.is_block_location}
                                    placeholder="Enter specific location..."
                                    value={form.manual_location}
                                    onChange={e => setForm({ ...form, manual_location: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-400 flex justify-between">
                                Complaints / Service Requests
                                <span className={form.complaint_request.length > 280 ? 'text-rose-400' : 'text-slate-500'}>
                                    {form.complaint_request.length}/300
                                </span>
                            </label>
                            <textarea
                                required
                                maxLength={300}
                                rows={3}
                                value={form.complaint_request}
                                onChange={e => setForm({ ...form, complaint_request: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-all"
                                placeholder="Describe the issue here..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-400">Status</label>
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, is_closed: false, end_time: '', duration: '' })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!form.is_closed ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Open
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, is_closed: true })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.is_closed ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Closed
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-400">Start Time</label>
                                <input
                                    type="time"
                                    required
                                    value={form.start_time}
                                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>
                            <div className={`space-y-4 transition-all duration-300 ${form.is_closed ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                                <label className="block text-sm font-medium text-slate-400">End Time</label>
                                <input
                                    type="time"
                                    required={form.is_closed}
                                    value={form.end_time}
                                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                                />
                            </div>
                        </div>

                        {form.duration && (
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-blue-400" />
                                    <span className="text-slate-300 font-medium">Auto-calculated Duration</span>
                                </div>
                                <span className="text-2xl font-bold text-blue-400 font-mono tracking-tighter">{form.duration} HH:MM</span>
                            </div>
                        )}

                        {error && <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-2 border border-rose-500/20"><AlertCircle size={18} />{error}</div>}
                        {success && <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2 border border-emerald-500/20"><CheckCircle2 size={18} />{success}</div>}

                        <div className="flex gap-4">
                            {editingId && (
                                <button type="button" onClick={resetForm} className="flex-1 bg-slate-800 text-slate-300 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                    <CloseIcon size={20} /> Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-[2] ${editingId ? 'bg-emerald-600' : 'bg-blue-600'} text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2`}
                            >
                                {submitting ? <Loader2 size={24} className="animate-spin" /> : (editingId ? 'Update Complaint' : 'Record Complaint')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* History Section */}
                <div className="space-y-6 overflow-hidden flex flex-col">
                    <h2 className="text-xl font-semibold text-slate-300 flex items-center gap-3 px-2">
                        Recent Complaints
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{entries.length}</span>
                    </h2>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[700px]">
                        {loading ? (
                            <div className="text-center py-20 opacity-20"><Loader2 size={40} className="animate-spin mx-auto" /></div>
                        ) : entries.length === 0 ? (
                            <div className="bg-slate-900/30 border border-dashed border-slate-800 p-12 rounded-3xl text-center text-slate-500">No complaints recorded yet.</div>
                        ) : entries.map(entry => (
                            <div key={entry.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
                                            {entry.is_block_location ? <Building2 size={20} /> : <UserCircle size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{entry.is_block_location ? entry.block_name : entry.manual_location}</div>
                                            <div className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString('en-GB')}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEdit(entry)} className="p-2 text-slate-500 hover:text-blue-400"><Pencil size={18} /></button>
                                        <button onClick={() => handleDelete(entry.id)} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm italic mb-4 line-clamp-2">"{entry.complaint_request}"</p>
                                <div className="flex items-center gap-4 text-xs font-mono">
                                    <span className="text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded">{entry.start_time.slice(0, 5)}</span>
                                    {entry.is_closed ? (
                                        <>
                                            <span className="text-slate-600">→</span>
                                            <span className="text-rose-500 bg-rose-500/5 px-2 py-1 rounded">{entry.end_time?.slice(0, 5)}</span>
                                            <span className="text-blue-400 ml-auto font-bold border-l border-slate-800 pl-4">{entry.duration}</span>
                                        </>
                                    ) : (
                                        <span className="text-amber-500 ml-auto font-bold border-l border-slate-800 pl-4">OPEN</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
