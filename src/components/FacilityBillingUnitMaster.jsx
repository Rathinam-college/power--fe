import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Building2, Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle2, Tag } from 'lucide-react'

import API_BASE from '../apiConfig'

export default function FacilityBillingUnitMaster() {
    const [units, setUnits] = useState([])
    const [categories, setCategories] = useState([])
    const [status, setStatus] = useState({ type: '', message: '' })
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState({ category: '', unit_count: '', unit_type: '', effective_date: '' })

    useEffect(() => {
        fetchUnits()
        fetchCategories()
    }, [])

    const fetchUnits = async () => {
        try {
            const res = await axios.get(`${API_BASE}/facility-billing-units/`)
            setUnits(res.data)
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to load billing units' })
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories/`)
            setCategories(res.data)
        } catch (e) {
            console.error('Failed to load categories', e)
        }
    }

    const resetForm = () => {
        setForm({ category: '', unit_count: '', unit_type: '', effective_date: '' })
        setEditId(null)
        setShowForm(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                category: parseInt(form.category),
                unit_count: parseInt(form.unit_count),
                unit_type: form.unit_type.trim(),
                effective_date: form.effective_date
            }

            if (editId) {
                await axios.put(`${API_BASE}/facility-billing-units/${editId}/`, payload)
                setStatus({ type: 'success', message: 'Billing unit updated' })
            } else {
                await axios.post(`${API_BASE}/facility-billing-units/`, payload)
                setStatus({ type: 'success', message: 'Billing unit added' })
            }
            resetForm()
            fetchUnits()
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            const msg = e.response?.data?.non_field_errors?.[0] || 'Operation failed'
            setStatus({ type: 'error', message: msg })
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this billing unit entry?')) return
        try {
            await axios.delete(`${API_BASE}/facility-billing-units/${id}/`)
            setStatus({ type: 'success', message: 'Entry deleted' })
            fetchUnits()
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (e) {
            setStatus({ type: 'error', message: 'Delete failed' })
        }
    }

    // Group units by category
    const groupedUnits = units.reduce((acc, u) => {
        const cat = u.category_name || 'Uncategorized'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(u)
        return acc
    }, {})

    // Sort entries within each group by date (recent first)
    Object.keys(groupedUnits).forEach(cat => {
        groupedUnits[cat].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date))
    })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl"><Building2 size={28} className="text-indigo-400" /></div>
                        Billing Units
                    </h1>
                    <p className="text-slate-400 mt-2">Manage unit counts and sharing models per category</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true) }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Add Billing Unit
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
                    <h2 className="text-lg font-semibold text-white mb-4">{editId ? 'Edit' : 'New'} Billing Unit</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm text-slate-400 mb-2">Category *</label>
                            <select
                                required
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">— Select Category —</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-sm text-slate-400 mb-2">Unit Count *</label>
                            <input
                                type="number"
                                required
                                value={form.unit_count}
                                onChange={e => setForm({ ...form, unit_count: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. 50"
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-sm text-slate-400 mb-2">Unit Type *</label>
                            <input
                                type="text"
                                required
                                value={form.unit_type}
                                onChange={e => setForm({ ...form, unit_type: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. People, Shops"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm text-slate-400 mb-2">Effective Date *</label>
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
                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
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

            <div className="space-y-8">
                {Object.keys(groupedUnits).sort().map(categoryName => (
                    <section key={categoryName} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-800"></div>
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} /> {categoryName}
                            </h2>
                            <div className="h-px flex-1 bg-slate-800"></div>
                        </div>

                        <div className="grid gap-3">
                            {groupedUnits[categoryName].map(u => (
                                <div key={u.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex justify-between items-center group hover:bg-slate-900/60 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-slate-800 group-hover:border-slate-700 transition-colors">
                                            <span className="text-xl font-bold text-white leading-none">{u.unit_count}</span>
                                            <span className="text-[10px] text-slate-500 mt-1 uppercase font-medium tracking-tight whitespace-nowrap px-2 overflow-hidden text-ellipsis w-full text-center">{u.unit_type}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium text-lg">
                                                Effective for {categoryName}
                                            </h3>
                                            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                                                <Calendar size={14} /> Effective from: {u.effective_date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setForm({
                                                    category: u.category,
                                                    unit_count: u.unit_count,
                                                    unit_type: u.unit_type,
                                                    effective_date: u.effective_date
                                                });
                                                setEditId(u.id);
                                                setShowForm(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {units.length === 0 && (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        No billing unit records found. Add one above.
                    </div>
                )}
            </div>
        </div>
    )
}
