import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Percent, Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import API_BASE from '../apiConfig';

export default function TaxMaster() {
    const [taxes, setTaxes] = useState([])
    const [status, setStatus] = useState({ type: '', message: '' })
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState({ percentage: '', effective_date: '' })

    useEffect(() => { fetchTaxes() }, [])

    const fetchTaxes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/taxes/`)
            setTaxes(res.data)
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to load taxes' })
        }
    }

    const resetForm = () => {
        setForm({ percentage: '', effective_date: '' })
        setEditId(null)
        setShowForm(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editId) {
                await axios.put(`${API_BASE}/taxes/${editId}/`, form)
                setStatus({ type: 'success', message: 'Tax rate updated' })
            } else {
                await axios.post(`${API_BASE}/taxes/`, form)
                setStatus({ type: 'success', message: 'Tax rate added' })
            }
            resetForm()
            fetchTaxes()
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Operation failed' })
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this tax rate?')) return
        try {
            await axios.delete(`${API_BASE}/taxes/${id}/`)
            setStatus({ type: 'success', message: 'Tax rate deleted' })
            fetchTaxes()
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Delete failed' })
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 rounded-xl"><Percent size={28} className="text-rose-400" /></div>
                        Tax Rates
                    </h1>
                    <p className="text-slate-400 mt-2">Manage dynamic tax percentages and effective dates</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true) }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Add Tax Rate
                </button>
            </header>

            {status.message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-in zoom-in-95 ${status.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    {status.message}
                </div>
            )}

            {showForm && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <h2 className="text-lg font-semibold text-white mb-4">{editId ? 'Edit' : 'New'} Tax Rate</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm text-slate-400 mb-2">Percentage (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.percentage}
                                onChange={e => setForm({ ...form, percentage: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                placeholder="5.00"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm text-slate-400 mb-2">Effective Date</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="date"
                                    required
                                    value={form.effective_date}
                                    onChange={e => setForm({ ...form, effective_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button type="submit" className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                                Save
                            </button>
                            <button type="button" onClick={resetForm} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {taxes.map(t => (
                    <div key={t.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex justify-between items-center group hover:bg-slate-900/60 transition-colors">
                        <div>
                            <h3 className="text-white font-medium flex items-center gap-2 text-lg">
                                {Number(t.percentage)}% Tax
                            </h3>
                            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                                <Calendar size={14} /> Effective from: {t.effective_date}
                            </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setForm({ percentage: t.percentage, effective_date: t.effective_date }); setEditId(t.id); setShowForm(true); }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {taxes.length === 0 && (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        No tax rates configured. Add one above.
                    </div>
                )}
            </div>
        </div>
    )
}
