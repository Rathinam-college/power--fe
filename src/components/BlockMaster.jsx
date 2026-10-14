import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Building, CheckCircle2, AlertCircle } from 'lucide-react';

import API_BASE from '../apiConfig';

const BlockMaster = () => {
    const [blocks, setBlocks] = useState([]);
    const [newBlock, setNewBlock] = useState({ name: '', description: '' });
    const [editBlock, setEditBlock] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    const fetchBlocks = async () => {
        try {
            const res = await axios.get(`${API_BASE}/blocks/`);
            setBlocks(res.data);
        } catch (e) {
            console.error('Error fetching blocks', e);
        }
    };

    useEffect(() => { fetchBlocks(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/blocks/`, newBlock);
            setNewBlock({ name: '', description: '' });
            fetchBlocks();
            showStatus('success', `Block "${newBlock.name}" added successfully.`);
        } catch (e) {
            showStatus('error', 'Failed to add block. Name may already exist.');
        }
    };

    const handleEditClick = (block) => {
        setEditBlock({ ...block });
        setIsEditModalOpen(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${API_BASE}/blocks/${editBlock.id}/`, {
                name: editBlock.name,
                description: editBlock.description
            });
            setIsEditModalOpen(false);
            fetchBlocks();
            showStatus('success', 'Block updated successfully.');
        } catch (e) {
            showStatus('error', 'Failed to update block.');
        }
    };

    const handleDelete = async (block) => {
        if (!window.confirm(`Delete block "${block.name}"? Companies assigned to this block will be unlinked.`)) return;
        try {
            await axios.delete(`${API_BASE}/blocks/${block.id}/`);
            fetchBlocks();
            showStatus('success', `Block "${block.name}" deleted.`);
        } catch (e) {
            showStatus('error', 'Failed to delete block.');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Building size={26} className="text-blue-500" /> Block Master Data
                </h1>
                <p className="text-slate-400 mt-1">Manage blocks / locations where companies are situated</p>
            </div>

            {status.message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-in zoom-in-95 ${status.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Add Block Form */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                            <Plus size={18} className="text-blue-500" /> Add New Block
                        </h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Block Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newBlock.name}
                                    onChange={e => setNewBlock(b => ({ ...b, name: e.target.value }))}
                                    placeholder="e.g. Block A, North Wing..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Description <span className="text-slate-600 text-xs">(optional)</span></label>
                                <textarea
                                    rows={2}
                                    value={newBlock.description}
                                    onChange={e => setNewBlock(b => ({ ...b, description: e.target.value }))}
                                    placeholder="e.g. Ground floor, east side..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add Block
                            </button>
                        </form>
                    </div>
                </div>

                {/* Blocks List */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">All Blocks</h2>
                            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{blocks.length} total</span>
                        </div>
                        {blocks.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">No blocks defined yet. Add one to get started.</div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {blocks.map(block => (
                                    <div key={block.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors group">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Building size={14} className="text-blue-400" />
                                                <span className="font-semibold text-white">{block.name}</span>
                                            </div>
                                            {block.description && (
                                                <p className="text-xs text-slate-500 mt-0.5 ml-5">{block.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(block)}
                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                                                title="Edit Block"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(block)}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Delete Block"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editBlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-5">Edit Block</h2>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Block Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editBlock.name}
                                    onChange={e => setEditBlock(b => ({ ...b, name: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Description</label>
                                <textarea
                                    rows={2}
                                    value={editBlock.description}
                                    onChange={e => setEditBlock(b => ({ ...b, description: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium"
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

export default BlockMaster;
