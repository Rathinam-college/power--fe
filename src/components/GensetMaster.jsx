import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Zap, Plus, Trash2, Edit2, Save, X,
    Settings, Search, MapPin, Gauge
} from 'lucide-react';
import API_BASE from '../apiConfig';

const GensetMaster = () => {
    const [gensets, setGensets] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGenset, setSelectedGenset] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [form, setForm] = useState({
        name: '',
        location: '',
        isMultiple: false,
        tempCapacityList: [],
        singleCapacity: ''
    });

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        location: '',
        kva_capacity_text: '',
        total_kva: 0
    });

    useEffect(() => {
        fetchGensets();
    }, []);

    const fetchGensets = async () => {
        try {
            const response = await axios.get(`${API_BASE}/gensets/`);
            setGensets(response.data);
        } catch (error) {
            console.error('Error fetching gensets:', error);
        }
    };

    const handleAddCapacity = () => {
        if (!form.singleCapacity || isNaN(form.singleCapacity)) return;
        setForm(prev => ({
            ...prev,
            tempCapacityList: [...prev.tempCapacityList, parseFloat(prev.singleCapacity)],
            singleCapacity: ''
        }));
    };

    const removeTempCapacity = (index) => {
        setForm(prev => ({
            ...prev,
            tempCapacityList: prev.tempCapacityList.filter((_, i) => i !== index)
        }));
    };

    const handleAddGenset = async (e) => {
        e.preventDefault();

        let capacityText = '';
        let totalKva = 0;

        if (form.isMultiple) {
            if (form.tempCapacityList.length === 0) {
                alert('Please add at least one capacity value');
                return;
            }
            capacityText = form.tempCapacityList.join(' + ');
            totalKva = form.tempCapacityList.reduce((a, b) => a + b, 0);
        } else {
            if (!form.singleCapacity || isNaN(form.singleCapacity)) {
                alert('Please enter a valid capacity');
                return;
            }
            capacityText = form.singleCapacity;
            totalKva = parseFloat(form.singleCapacity);
        }

        try {
            await axios.post(`${API_BASE}/gensets/`, {
                name: form.name,
                location: form.location,
                kva_capacity_text: capacityText,
                total_kva: totalKva
            });
            setIsAddModalOpen(false);
            resetForm();
            fetchGensets();
        } catch (error) {
            alert('Error adding genset');
        }
    };

    const handleDeleteGenset = async (id) => {
        if (!window.confirm('Are you sure you want to delete this genset?')) return;
        try {
            await axios.delete(`${API_BASE}/gensets/${id}/`);
            fetchGensets();
        } catch (error) {
            alert('Error deleting genset');
        }
    };

    const handleEditClick = (genset) => {
        setSelectedGenset(genset);
        setEditForm({
            name: genset.name,
            location: genset.location,
            kva_capacity_text: genset.kva_capacity_text,
            total_kva: genset.total_kva
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateGenset = async (e) => {
        e.preventDefault();
        try {
            // Recalculate total_kva from text if it's a sum
            let total = 0;
            if (editForm.kva_capacity_text.includes('+')) {
                total = editForm.kva_capacity_text.split('+').reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            } else {
                total = parseFloat(editForm.kva_capacity_text) || 0;
            }

            await axios.put(`${API_BASE}/gensets/${selectedGenset.id}/`, {
                ...editForm,
                total_kva: total
            });
            setIsEditModalOpen(false);
            fetchGensets();
        } catch (error) {
            alert('Error updating genset');
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            location: '',
            isMultiple: false,
            tempCapacityList: [],
            singleCapacity: ''
        });
    };

    const filteredGensets = gensets.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.location && g.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Zap className="text-yellow-500" fill="currentColor" />
                        Genset Master
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage power backup infrastructure</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search gensets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={18} /> Add Genset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGensets.map(genset => (
                    <div key={genset.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                                <Zap className="text-blue-400" size={20} />
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditClick(genset)}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteGenset(genset.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{genset.name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                            <MapPin size={14} className="text-slate-500" />
                            {genset.location || 'Nil'}
                        </div>

                        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">KVA Capacity</span>
                                <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                                    {genset.total_kva} KVA
                                </span>
                            </div>
                            <p className="text-white font-mono text-sm">
                                {genset.kva_capacity_text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Add New Genset</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddGenset} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Genset Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Kings hostel 250 KVA Genset"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Near Hostel Block"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none group w-fit">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={form.isMultiple}
                                            onChange={e => setForm({ ...form, isMultiple: e.target.checked })}
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${form.isMultiple ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isMultiple ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Multiple Units / Capacities</span>
                                </label>
                            </div>

                            {!form.isMultiple ? (
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2 font-medium">KVA Capacity *</label>
                                    <div className="relative">
                                        <Gauge size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="number"
                                            required
                                            placeholder="0"
                                            value={form.singleCapacity}
                                            onChange={e => setForm({ ...form, singleCapacity: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="block text-sm text-slate-400 font-medium">KVA Capacities List</label>

                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Gauge size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="number"
                                                placeholder="Enter KVA"
                                                value={form.singleCapacity}
                                                onChange={e => setForm({ ...form, singleCapacity: e.target.value })}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCapacity(); } }}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddCapacity}
                                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white p-2.5 rounded-xl border border-blue-500/30 transition-all"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {form.tempCapacityList.map((cap, idx) => (
                                            <div key={idx} className="bg-slate-800 text-white pl-3 pr-1 py-1 rounded-lg flex items-center gap-1 text-sm font-mono border border-slate-700">
                                                {cap} KVA
                                                <button
                                                    type="button"
                                                    onClick={() => removeTempCapacity(idx)}
                                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {form.tempCapacityList.length === 0 && (
                                            <p className="text-xs text-slate-600 italic py-2">No units added yet</p>
                                        )}
                                    </div>

                                    {form.tempCapacityList.length > 0 && (
                                        <div className="bg-blue-500/5 text-blue-400 px-3 py-2 rounded-lg text-xs font-bold border border-blue-500/10 flex justify-between items-center">
                                            <span>TOTAL KVA:</span>
                                            <span>{form.tempCapacityList.reduce((a, b) => a + b, 0)} KVA</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/40"
                                >
                                    Save Genset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Edit Genset</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateGenset} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Genset Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Location</label>
                                <input
                                    type="text"
                                    value={editForm.location || ''}
                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">KVA Capacity (Text) *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 250 + 250"
                                    value={editForm.kva_capacity_text}
                                    onChange={e => setEditForm({ ...editForm, kva_capacity_text: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 transition-all"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Use + for multiple units (e.g. 250+250+250)</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/40"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GensetMaster;
