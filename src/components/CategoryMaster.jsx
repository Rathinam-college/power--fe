import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Edit2, Database, AlertCircle, CheckCircle2 } from 'lucide-react'

import API_BASE from '../apiConfig'

const API_BASE_URL = `${API_BASE}/categories/`

export default function CategoryMaster() {
    const [categories, setCategories] = useState([])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [status, setStatus] = useState({ type: '', message: '' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await axios.get(API_BASE_URL)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
            setStatus({ type: 'error', message: 'Failed to load categories' })
        } finally {
            setLoading(false)
        }
    }

    const handleAddCategory = async (e) => {
        e.preventDefault()
        if (!newCategoryName.trim()) return

        try {
            const response = await axios.post(API_BASE_URL, { name: newCategoryName })
            setCategories([...categories, response.data])
            setNewCategoryName('')
            setStatus({ type: 'success', message: 'Category added successfully!' })
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (error) {
            console.error('Error adding category:', error)
            setStatus({ type: 'error', message: error.response?.data?.name?.[0] || 'Failed to add category' })
        }
    }

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return

        try {
            await axios.delete(`${API_BASE_URL}${id}/`)
            setCategories(categories.filter(cat => cat.id !== id))
            setStatus({ type: 'success', message: 'Category deleted successfully' })
            setTimeout(() => setStatus({ type: '', message: '' }), 3000)
        } catch (error) {
            console.error('Error deleting category:', error)
            setStatus({ type: 'error', message: 'Failed to delete category' })
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Database className="text-blue-500" />
                        Company Categories
                    </h1>
                    <p className="text-slate-400 mt-1">Manage categories for companies</p>
                </div>
            </header>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                    }`}>
                    {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="md:col-span-1">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sticky top-24">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-blue-500" />
                            Add New Category
                        </h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Enter category name..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                Create Category
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Table */}
                <div className="md:col-span-2">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400">Loading categories...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                                    <Database size={32} />
                                </div>
                                <p className="text-slate-400">No categories found. Add your first category to get started.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-300">#</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-300">Category Name</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {categories.map((cat, index) => (
                                        <tr key={cat.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-white font-medium">{cat.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
