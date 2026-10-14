import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE from '../apiConfig'
import { Calendar, Clock, Trash2, AlertCircle, Loader2, ZapOff, CheckCircle2, Pencil, X as CloseIcon } from 'lucide-react'


export default function PowerCutEntryForm() {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [editingId, setEditingId] = useState(null)

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: ''
    })

    const [previewDuration, setPreviewDuration] = useState(null)

    useEffect(() => {
        fetchEntries()
    }, [])

    useEffect(() => {
        calculateDuration()
    }, [form.start_time, form.end_time])

    const fetchEntries = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_BASE}/power-cuts/`)
            setEntries(res.data)
        } catch (e) {
            setError('Failed to fetch power cut entries.')
        } finally {
            setLoading(false)
        }
    }

    const calculateDuration = () => {
        if (!form.start_time || !form.end_time) {
            setPreviewDuration(null)
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

        setPreviewDuration(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    }

    const resetForm = () => {
        setForm({
            date: new Date().toISOString().split('T')[0],
            start_time: '',
            end_time: ''
        })
        setEditingId(null)
        setPreviewDuration(null)
    }

    const handleEdit = (entry) => {
        setForm({
            date: entry.date,
            start_time: entry.start_time.slice(0, 5),
            end_time: entry.end_time.slice(0, 5)
        })
        setEditingId(entry.id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            if (editingId) {
                await axios.put(`${API_BASE}/power-cuts/${editingId}/`, form)
                setSuccess('Power cut updated successfully!')
            } else {
                await axios.post(`${API_BASE}/power-cuts/`, form)
                setSuccess('Power cut recorded successfully!')
            }
            resetForm()
            fetchEntries()
            setTimeout(() => setSuccess(null), 3000)
        } catch (e) {
            setError('Failed to save power cut. Please check inputs.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this entry?')) return
        try {
            await axios.delete(`${API_BASE}/power-cuts/${id}/`)
            fetchEntries()
        } catch (e) {
            setError('Failed to delete entry.')
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-xl"><ZapOff size={28} className="text-rose-400" /></div>
                    {editingId ? 'Edit Power Cut' : 'Power Cut Entry'}
                </h1>
                <p className="text-slate-400 mt-2">{editingId ? 'Modify existing power interruption record' : 'Record grid failures and power interruptions'}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ZapOff size={120} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-400">Date of Power Cut</label>
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

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-400">Start Time</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="time"
                                        required
                                        value={form.start_time}
                                        onChange={e => setForm({ ...form, start_time: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-400">End Time</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="time"
                                        required
                                        value={form.end_time}
                                        onChange={e => setForm({ ...form, end_time: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {previewDuration && (
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg"><Clock size={18} className="text-blue-400" /></div>
                                    <span className="text-slate-300 font-medium">Auto-calculated Duration</span>
                                </div>
                                <span className="text-2xl font-bold text-blue-400 font-mono tracking-wider">{previewDuration} HH:MM</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
                                <CheckCircle2 size={18} /> {success}
                            </div>
                        )}

                        <div className="flex gap-4">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
                                >
                                    <CloseIcon size={20} /> Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-[2] ${editingId ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'} disabled:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2`}
                            >
                                {submitting ? <Loader2 size={24} className="animate-spin" /> : (editingId ? 'Update Power Cut' : 'Record Power Cut')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* History Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-300 flex items-center gap-3 px-2">
                        Recent Power Cuts
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{entries.length} Entries</span>
                    </h2>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading && (
                            <div className="text-center py-12 text-slate-500">
                                <Loader2 size={32} className="animate-spin mx-auto mb-4 opacity-20" />
                                <p>Loading history...</p>
                            </div>
                        )}
                        {!loading && entries.length === 0 && (
                            <div className="bg-slate-900/30 border border-dashed border-slate-800 p-12 rounded-3xl text-center text-slate-500">
                                <p>No power cut records found.</p>
                            </div>
                        )}
                        {entries.map(entry => {
                            // Duration calc for list items
                            const startParts = entry.start_time.split(':')
                            const endParts = entry.end_time.split(':')
                            const start = new Date(0, 0, 0, startParts[0], startParts[1])
                            const end = new Date(0, 0, 0, endParts[0], endParts[1])
                            let diff = end - start
                            if (diff < 0) diff += 24 * 60 * 60 * 1000
                            const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0')
                            const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')

                            return (
                                <div key={entry.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-colors">
                                            <ZapOff size={24} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-lg mb-1">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">
                                                    <Clock size={14} className="text-emerald-500" /> {entry.start_time.slice(0, 5)}
                                                </span>
                                                <span className="text-slate-600">→</span>
                                                <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">
                                                    <Clock size={14} className="text-rose-500" /> {entry.end_time.slice(0, 5)}
                                                </span>
                                                <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{h}:{m} hrs</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEdit(entry)} className="p-2.5 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all">
                                            <Pencil size={20} />
                                        </button>
                                        <button onClick={() => handleDelete(entry.id)} className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
