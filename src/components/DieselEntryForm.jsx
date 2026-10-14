import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Search, Edit2, Trash2, Fuel, RefreshCw, Calculator, History, AlertCircle, Database } from 'lucide-react';

import API_BASE from '../apiConfig';

const DieselEntryForm = () => {
    const [gensets, setGensets] = useState([]);
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenset, setSelectedGenset] = useState(null);
    const [systemOpeningStock, setSystemOpeningStock] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [form, setForm] = useState({
        entry_date: new Date().toISOString().split('T')[0],
        genset: '',
        opening_stock_manual_override: false,
        manual_opening_stock: '',
        purchased_liters: '',
        consumed_liters: ''
    });

    const [editForm, setEditForm] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);

    useEffect(() => {
        fetchGensets();
        fetchEntries();
    }, []);

    const fetchGensets = async () => {
        try {
            const res = await axios.get(`${API_BASE}/gensets/`);
            setGensets(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchEntries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/diesel-entries/`);
            setEntries(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleGensetChange = async (gensetId) => {
        setForm(f => ({ ...f, genset: gensetId, opening_stock_manual_override: false, manual_opening_stock: '' }));
        setSystemOpeningStock(null);
        setSelectedGenset(null);

        if (!gensetId) return;

        const genset = gensets.find(g => g.id === parseInt(gensetId));
        setSelectedGenset(genset);

        try {
            const res = await axios.get(`${API_BASE}/gensets/${gensetId}/`);
            setSystemOpeningStock(res.data.current_stock || 0);
        } catch (e) {
            setSystemOpeningStock(0);
        }
    };

    // Derived State Computations
    const currentOpeningStock = form.opening_stock_manual_override
        ? (form.manual_opening_stock !== '' ? parseFloat(form.manual_opening_stock) : 0)
        : (systemOpeningStock !== null ? parseFloat(systemOpeningStock) : 0);

    const purchasedNum = form.purchased_liters !== '' ? parseFloat(form.purchased_liters) : 0;
    const consumedNum = form.consumed_liters !== '' ? parseFloat(form.consumed_liters) : 0;

    const currentClosingStock = currentOpeningStock + purchasedNum - consumedNum;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!form.genset || !form.entry_date) return;

        const payload = {
            genset: form.genset,
            entry_date: form.entry_date,
            opening_stock: currentOpeningStock,
            purchased_liters: purchasedNum,
            consumed_liters: consumedNum,
            closing_stock: currentClosingStock
        };

        try {
            await axios.post(`${API_BASE}/diesel-entries/`, payload);
            setStatus({ type: 'success', message: 'Diesel entry logged successfully!' });

            // Re-fetch everything and reset local field input
            setForm(f => ({ ...f, purchased_liters: '', consumed_liters: '', opening_stock_manual_override: false, manual_opening_stock: '' }));
            fetchGensets(); // Ensures we pull the freshest global stock reading for the genset
            fetchEntries();

            // Re-trigger genset switch to grab new stock logically
            handleGensetChange(form.genset);

            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to record entry. Please try again.' });
        }
    };

    const handleEditClick = (entry) => {
        setSelectedEntry(entry);
        setEditForm({
            entry_date: entry.entry_date,
            opening_stock_manual_override: false,
            manual_opening_stock: entry.opening_stock,
            purchased_liters: entry.purchased_liters,
            consumed_liters: entry.consumed_liters
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        const editOpeningStock = editForm.opening_stock_manual_override
            ? (editForm.manual_opening_stock !== '' ? parseFloat(editForm.manual_opening_stock) : 0)
            : parseFloat(selectedEntry.opening_stock);
        const editPurchased = editForm.purchased_liters !== '' ? parseFloat(editForm.purchased_liters) : 0;
        const editConsumed = editForm.consumed_liters !== '' ? parseFloat(editForm.consumed_liters) : 0;
        const editClosingStock = editOpeningStock + editPurchased - editConsumed;

        const payload = {
            genset: selectedEntry.genset,
            entry_date: editForm.entry_date,
            opening_stock: editOpeningStock,
            purchased_liters: editPurchased,
            consumed_liters: editConsumed,
            closing_stock: editClosingStock
        };

        try {
            await axios.put(`${API_BASE}/diesel-entries/${selectedEntry.id}/`, payload);
            setStatus({ type: 'success', message: 'Entry updated successfully!' });
            setSelectedEntry(null);
            setEditForm(null);

            fetchGensets();
            fetchEntries();

            if (form.genset) handleGensetChange(form.genset);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to update entry.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await axios.delete(`${API_BASE}/diesel-entries/${id}/`);
            setStatus({ type: 'success', message: 'Entry deleted successfully!' });

            fetchGensets();
            fetchEntries();

            if (form.genset) handleGensetChange(form.genset);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to delete entry.' });
        }
    };

    const filteredEntries = entries.filter(e =>
        e.genset_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                            <Fuel size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Diesel Entry</h2>
                            <p className="text-sm text-slate-400">Log purchases and consumptions</p>
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Entry Date</label>
                                <input
                                    type="date"
                                    required
                                    value={form.entry_date}
                                    onChange={e => setForm({ ...form, entry_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Genset</label>
                                <select
                                    required
                                    value={form.genset}
                                    onChange={e => handleGensetChange(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Genset...</option>
                                    {gensets.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedGenset && (
                            <div className="space-y-5 pt-4 border-t border-slate-800">
                                {/* Opening Stock Section */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-300">Opening Stock (Liters)</label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={form.opening_stock_manual_override}
                                                onChange={e => setForm({ ...form, opening_stock_manual_override: e.target.checked })}
                                                className="hidden"
                                            />
                                            <div className="w-8 h-4 bg-slate-800 rounded-full relative transition-colors group-hover:bg-slate-700">
                                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-all duration-300 ${form.opening_stock_manual_override ? 'bg-amber-400 translate-x-4' : 'bg-slate-500'}`} />
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium group-hover:text-slate-400">Override Logic</span>
                                        </label>
                                    </div>

                                    {form.opening_stock_manual_override ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.manual_opening_stock}
                                            onChange={e => setForm({ ...form, manual_opening_stock: e.target.value })}
                                            placeholder="Enter initial physical stock..."
                                            className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-200 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                                            required
                                        />
                                    ) : (
                                        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono flex items-center gap-2">
                                            {systemOpeningStock === null ? (
                                                <RefreshCw size={16} className="animate-spin" />
                                            ) : (
                                                <Database size={16} className="text-emerald-500/50" />
                                            )}
                                            {systemOpeningStock !== null ? `${parseFloat(systemOpeningStock).toFixed(2)} Liters Loaded` : 'Loading...'}
                                        </div>
                                    )}
                                </div>

                                {/* Purchase / Consumed Fields */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-emerald-400">Purchased (+ Liters)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.purchased_liters}
                                            onChange={e => setForm({ ...form, purchased_liters: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-rose-400">Consumed (- Liters)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.consumed_liters}
                                            onChange={e => setForm({ ...form, consumed_liters: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!form.genset || !form.entry_date}
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Log Diesel Entry
                        </button>
                    </form>
                </section>
            </div>

            {/* Live Preview Panel */}
            <div className="space-y-6">
                <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                            <Calculator size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Live Stock Preview</h2>
                    </div>

                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800/50 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <span className="text-slate-400">Opening Stock</span>
                            <span className="font-mono text-slate-300">{currentOpeningStock.toFixed(2)} L</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <span className="text-emerald-400">Purchased</span>
                            <span className="font-mono text-emerald-400">+{purchasedNum.toFixed(2)} L</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                            <span className="text-rose-400">Consumed</span>
                            <span className="font-mono text-rose-400">-{consumedNum.toFixed(2)} L</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-medium text-slate-300">Calculated Closing</span>
                            <span className="text-2xl font-bold font-mono text-white">
                                {currentClosingStock.toFixed(2)} L
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* History Table */}
            <div className="lg:col-span-2 space-y-6">
                <section className="bg-slate-900/50 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
                                <History size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Recent Entries</h2>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search genset..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-sm">
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Genset</th>
                                    <th className="p-4 font-medium text-right">Opening</th>
                                    <th className="p-4 font-medium text-right text-emerald-500">Purchased</th>
                                    <th className="p-4 font-medium text-right text-rose-500">Consumed</th>
                                    <th className="p-4 font-medium text-right">Closing</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredEntries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="p-4 text-sm text-slate-300">{entry.entry_date}</td>
                                        <td className="p-4 text-sm text-slate-300 font-medium">{entry.genset_name}</td>
                                        <td className="p-4 text-sm text-slate-400 text-right font-mono">{parseFloat(entry.opening_stock).toFixed(2)}</td>
                                        <td className="p-4 text-sm text-emerald-400 text-right font-mono">+{parseFloat(entry.purchased_liters).toFixed(2)}</td>
                                        <td className="p-4 text-sm text-rose-400 text-right font-mono">-{parseFloat(entry.consumed_liters).toFixed(2)}</td>
                                        <td className="p-4 text-sm text-white text-right font-mono font-medium">{parseFloat(entry.closing_stock).toFixed(2)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(entry)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(entry.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEntries.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">No entries found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Edit Modal (Simulated Modal Overlay) */}
            {selectedEntry && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Edit Entry</h3>
                            <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-white transition-colors">
                                <AlertCircle size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={editForm.entry_date}
                                    onChange={e => setEditForm({ ...editForm, entry_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 outline-none"
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-300">Opening Stock</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.opening_stock_manual_override}
                                            onChange={e => setEditForm({ ...editForm, opening_stock_manual_override: e.target.checked })}
                                            className="hidden"
                                        />
                                        <div className="w-8 h-4 bg-slate-800 rounded-full relative">
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-all ${editForm.opening_stock_manual_override ? 'bg-amber-400 translate-x-4' : 'bg-slate-500'}`} />
                                        </div>
                                    </label>
                                </div>
                                {editForm.opening_stock_manual_override ? (
                                    <input
                                        type="number" step="0.01" required
                                        value={editForm.manual_opening_stock}
                                        onChange={e => setEditForm({ ...editForm, manual_opening_stock: e.target.value })}
                                        className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-amber-200 outline-none"
                                    />
                                ) : (
                                    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono">
                                        {parseFloat(selectedEntry.opening_stock).toFixed(2)} Liters Loaded
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-emerald-400">Purchased</label>
                                    <input
                                        type="number" step="0.01"
                                        value={editForm.purchased_liters}
                                        onChange={e => setEditForm({ ...editForm, purchased_liters: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-rose-400">Consumed</label>
                                    <input
                                        type="number" step="0.01"
                                        value={editForm.consumed_liters}
                                        onChange={e => setEditForm({ ...editForm, consumed_liters: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setSelectedEntry(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DieselEntryForm;
