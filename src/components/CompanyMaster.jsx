import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar, DollarSign, Zap, Building } from 'lucide-react';

import API_BASE from '../apiConfig';

const CompanyMaster = () => {
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [gensets, setGensets] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyCategory, setNewCompanyCategory] = useState('');
    const [newCompanyBlock, setNewCompanyBlock] = useState('');
    const [editForm, setEditForm] = useState({ name: '', category: '', block: '' });
    const [isEditConfigModalOpen, setIsEditConfigModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [editConfigForm, setEditConfigForm] = useState({
        service_no: '', tariff: '', unit_cost: '', kw_kva: '', fixed_demand: '', effective_date: '',
        ctr_enabled: false, ctr_value: '',
        genset: ''
    });

    // Config form state
    const [configForm, setConfigForm] = useState({
        service_no: '',
        tariff: '',
        unit_cost: '',
        kw_kva: '',
        fixed_demand: '',
        effective_date: new Date().toISOString().split('T')[0],
        ctr_enabled: false,
        ctr_value: '',
        genset: ''
    });

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(`${API_BASE}/companies/`);
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE}/categories/`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchGensets = async () => {
        try {
            const response = await axios.get(`${API_BASE}/gensets/`);
            setGensets(response.data);
        } catch (error) {
            console.error('Error fetching gensets:', error);
        }
    };

    const fetchBlocks = async () => {
        try {
            const response = await axios.get(`${API_BASE}/blocks/`);
            setBlocks(response.data);
        } catch (error) {
            console.error('Error fetching blocks:', error);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchCategories();
        fetchBlocks();
        fetchGensets();
    }, []);

    const handleAddCompany = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/companies/`, {
                name: newCompanyName,
                category: newCompanyCategory || null,
                block: newCompanyBlock || null
            });
            setNewCompanyName('');
            setNewCompanyCategory('');
            setNewCompanyBlock('');
            setIsAddModalOpen(false);
            fetchCompanies();
        } catch (error) {
            alert('Error adding company');
        }
    };

    const handleAddConfig = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/configs/`, {
                company: selectedCompany.id,
                ...configForm,
                genset: configForm.genset || null
            });
            setIsConfigModalOpen(false);
            fetchCompanies();
        } catch (error) {
            alert('Error adding configuration');
        }
    };

    const handleEditClick = (company) => {
        setSelectedCompany(company);
        setEditForm({ name: company.name, category: company.category || '', block: company.block || '' });
        setIsEditModalOpen(true);
    };

    const handleEditCompany = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${API_BASE}/companies/${selectedCompany.id}/`, {
                name: editForm.name,
                category: editForm.category || null,
                block: editForm.block || null
            });
            setIsEditModalOpen(false);
            fetchCompanies();
        } catch (error) {
            alert('Error updating company');
        }
    };

    const handleDeleteCompany = async (company) => {
        if (!window.confirm(`Are you sure you want to delete "${company.name}"? This will also remove all meter configs and readings.`)) return;
        try {
            await axios.delete(`${API_BASE}/companies/${company.id}/`);
            fetchCompanies();
        } catch (error) {
            alert('Error deleting company');
        }
    };

    const handleEditConfigClick = (config) => {
        setSelectedConfig(config);
        setEditConfigForm({
            service_no: config.service_no,
            tariff: config.tariff,
            unit_cost: config.unit_cost,
            kw_kva: config.kw_kva,
            fixed_demand: config.fixed_demand || '',
            effective_date: config.effective_date,
            ctr_enabled: config.ctr_enabled,
            ctr_value: config.ctr_value || '',
            genset: config.genset || ''
        });
        setIsEditConfigModalOpen(true);
    };

    const handleEditConfig = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${API_BASE}/configs/${selectedConfig.id}/`, {
                ...editConfigForm,
                genset: editConfigForm.genset || null
            });
            setIsEditConfigModalOpen(false);
            fetchCompanies();
        } catch (error) {
            alert('Error updating configuration');
        }
    };

    const handleDeleteConfig = async (config) => {
        if (!window.confirm('Delete this meter configuration?')) return;
        try {
            await axios.delete(`${API_BASE}/configs/${config.id}/`);
            fetchCompanies();
        } catch (error) {
            alert('Error deleting configuration');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Company Master Data</h1>
                    <p className="text-slate-400">Manage companies and their meter configurations</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg"
                >
                    <Plus size={18} /> Add Company
                </button>
            </div>

            <div className="grid gap-6">
                {companies.map((company) => (
                    <div key={company.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white">{company.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Company ID: {company.id}</p>
                                    {company.category_name && (
                                        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                                            {company.category_name}
                                        </span>
                                    )}
                                    {company.block_name && (
                                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            <Building size={10} /> {company.block_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEditClick(company)}
                                    className="text-sm text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
                                    title="Edit Company"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedCompany(company);
                                        // Pre-fill with the most recent config values
                                        const latestConfig = (company.meter_configs || [])
                                            .slice()
                                            .sort((a, b) => b.effective_date.localeCompare(a.effective_date))[0];
                                        if (latestConfig) {
                                            setConfigForm({
                                                service_no: latestConfig.service_no,
                                                tariff: latestConfig.tariff,
                                                unit_cost: latestConfig.unit_cost,
                                                kw_kva: latestConfig.kw_kva,
                                                fixed_demand: latestConfig.fixed_demand ?? '',
                                                effective_date: new Date().toISOString().split('T')[0],
                                                ctr_enabled: latestConfig.ctr_enabled,
                                                ctr_value: latestConfig.ctr_value ?? '',
                                                genset: latestConfig.genset ?? ''
                                            });
                                        } else {
                                            setConfigForm({
                                                service_no: '', tariff: '', unit_cost: '', kw_kva: '',
                                                fixed_demand: '', effective_date: new Date().toISOString().split('T')[0],
                                                ctr_enabled: false, ctr_value: '',
                                                genset: ''
                                            });
                                        }
                                        setIsConfigModalOpen(true);
                                    }}
                                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20 transition-all"
                                    title="Add Meter Configuration"
                                >
                                    <Plus size={14} /> Update Config
                                </button>
                                <button
                                    onClick={() => handleDeleteCompany(company)}
                                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20 transition-all"
                                    title="Delete Company"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {company.meter_configs && company.meter_configs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                                            <th className="pb-3 font-medium">Service No</th>
                                            <th className="pb-3 font-medium">Tariff</th>
                                            <th className="pb-3 font-medium">Unit Cost</th>
                                            <th className="pb-3 font-medium">KW/KVA</th>
                                            <th className="pb-3 font-medium">Fixed Demand</th>
                                            <th className="pb-3 font-medium">Effective Date</th>
                                            <th className="pb-3 font-medium">CTR</th>
                                            <th className="pb-3 font-medium">Genset</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300 text-sm">
                                        {company.meter_configs.map((config) => (
                                            <tr key={config.id} className="border-b border-slate-800/50 last:border-0">
                                                <td className="py-4 font-mono text-blue-400">{config.service_no}</td>
                                                <td className="py-4">{config.tariff}</td>
                                                <td className="py-4">₹{config.unit_cost}</td>
                                                <td className="py-4">{config.kw_kva}</td>
                                                <td className="py-4">
                                                    {config.fixed_demand != null
                                                        ? <span className="font-mono text-purple-400">₹{config.fixed_demand}</span>
                                                        : <span className="text-slate-600 text-xs">—</span>
                                                    }
                                                </td>
                                                <td className="py-4 flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-500" />
                                                    {config.effective_date}
                                                </td>
                                                <td className="py-4">
                                                    {config.ctr_enabled
                                                        ? <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">×{config.ctr_value}</span>
                                                        : <span className="text-slate-600 text-xs">—</span>
                                                    }
                                                </td>
                                                <td className="py-4">
                                                    {config.genset_name ? (
                                                        <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                                            <Zap size={10} fill="currentColor" /> {config.genset_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEditConfigClick(config)}
                                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                                                            title="Edit Config"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteConfig(config)}
                                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                            title="Delete Config"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                                <p className="text-slate-500 text-sm italic">No configurations found. Add one to get started.</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Edit Company Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Edit Company</h2>
                        <form onSubmit={handleEditCompany}>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-2">Category</label>
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">-- None --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm text-slate-400 mb-2">Block <span className="text-slate-600 text-xs">(optional)</span></label>
                                <select
                                    value={editForm.block}
                                    onChange={(e) => setEditForm({ ...editForm, block: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">-- None --</option>
                                    {blocks.map(bl => (
                                        <option key={bl.id} value={bl.id}>{bl.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Company Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Register New Company</h2>
                        <form onSubmit={handleAddCompany}>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newCompanyName}
                                    onChange={(e) => setNewCompanyName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="Enter company name..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-2">Category</label>
                                <select
                                    value={newCompanyCategory}
                                    onChange={(e) => setNewCompanyCategory(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">-- Select a category (optional) --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm text-slate-400 mb-2">Block <span className="text-slate-600 text-xs">(optional)</span></label>
                                <select
                                    value={newCompanyBlock}
                                    onChange={(e) => setNewCompanyBlock(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">-- Select a block (optional) --</option>
                                    {blocks.map(bl => (
                                        <option key={bl.id} value={bl.id}>{bl.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                                >
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Config Modal */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-2">Update Configuration</h2>
                        <p className="text-slate-400 text-sm mb-6">Updating for <span className="text-blue-400 font-semibold">{selectedCompany?.name}</span></p>

                        <form onSubmit={handleAddConfig} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm text-slate-400 mb-1.5">TNEB Service No</label>
                                <input
                                    type="text"
                                    required
                                    value={configForm.service_no}
                                    onChange={(e) => setConfigForm({ ...configForm, service_no: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                    placeholder="e.g. 09-123-456-789"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Tariff Type</label>
                                <input
                                    type="text"
                                    required
                                    value={configForm.tariff}
                                    onChange={(e) => setConfigForm({ ...configForm, tariff: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="e.g. III-B"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Unit Cost (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={configForm.unit_cost}
                                    onChange={(e) => setConfigForm({ ...configForm, unit_cost: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">KW/KVA</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={configForm.kw_kva}
                                    onChange={(e) => setConfigForm({ ...configForm, kw_kva: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Fixed Demand (₹) <span className="text-slate-600 text-xs">(optional)</span></label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={configForm.fixed_demand}
                                    onChange={(e) => setConfigForm({ ...configForm, fixed_demand: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Effective Date</label>
                                <input
                                    type="date"
                                    required
                                    value={configForm.effective_date}
                                    onChange={(e) => setConfigForm({ ...configForm, effective_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            {/* CTR Toggle */}
                            <div className="col-span-2 mt-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={configForm.ctr_enabled}
                                            onChange={(e) => setConfigForm({ ...configForm, ctr_enabled: e.target.checked, ctr_value: e.target.checked ? configForm.ctr_value : '' })}
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${configForm.ctr_enabled ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${configForm.ctr_enabled ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white">Enable CTR (Current Transfer Ratio)</span>
                                        <p className="text-xs text-slate-500">Amount = Units × CTR × Rate</p>
                                    </div>
                                </label>
                            </div>
                            {configForm.ctr_enabled && (
                                <div className="col-span-2">
                                    <label className="block text-sm text-slate-400 mb-1.5">CTR Value</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        required
                                        value={configForm.ctr_value}
                                        onChange={(e) => setConfigForm({ ...configForm, ctr_value: e.target.value })}
                                        className="w-full bg-slate-950 border border-blue-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                                        placeholder="e.g. 5 or 10"
                                    />
                                </div>
                            )}

                            {/* Genset Selection */}
                            <div className="col-span-2 mt-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={!!configForm.genset}
                                            onChange={(e) => setConfigForm({ ...configForm, genset: e.target.checked ? (gensets[0]?.id || '') : '' })}
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${configForm.genset ? 'bg-yellow-600' : 'bg-slate-700'}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${configForm.genset ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white">Link Genset</span>
                                        <p className="text-xs text-slate-500">Associate a power backup unit</p>
                                    </div>
                                </label>
                            </div>

                            {!!configForm.genset && (
                                <div className="col-span-2">
                                    <label className="block text-sm text-slate-400 mb-1.5">Select Genset</label>
                                    <select
                                        value={configForm.genset}
                                        onChange={(e) => setConfigForm({ ...configForm, genset: e.target.value })}
                                        className="w-full bg-slate-950 border border-yellow-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-all shadow-sm"
                                    >
                                        <option value="">-- Choose a Genset --</option>
                                        {gensets.map(g => (
                                            <option key={g.id} value={g.id}>{g.name} ({g.total_kva} KVA)</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="col-span-2 flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsConfigModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-950"
                                >
                                    Save Config
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Config Modal */}
            {isEditConfigModalOpen && selectedConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-1">Edit Configuration</h2>
                        <p className="text-slate-400 text-sm mb-6">Service No: <span className="font-mono text-blue-400">{selectedConfig.service_no}</span></p>
                        <form onSubmit={handleEditConfig} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm text-slate-400 mb-1.5">TNEB Service No</label>
                                <input type="text" required value={editConfigForm.service_no}
                                    onChange={e => setEditConfigForm({ ...editConfigForm, service_no: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Tariff Type</label>
                                <input type="text" required value={editConfigForm.tariff}
                                    onChange={e => setEditConfigForm({ ...editConfigForm, tariff: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Unit Cost (₹)</label>
                                <input type="number" step="0.01" required value={editConfigForm.unit_cost}
                                    onChange={e => setEditConfigForm({ ...editConfigForm, unit_cost: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">KW/KVA</label>
                                <input type="number" step="0.01" required value={editConfigForm.kw_kva}
                                    onChange={e => setEditConfigForm({ ...editConfigForm, kw_kva: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Fixed Demand (₹) <span className="text-slate-600 text-xs">(optional)</span></label>
                                <input type="number" step="0.01" value={editConfigForm.fixed_demand}
                                    onChange={e => setEditConfigForm({ ...editConfigForm, fixed_demand: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Effective Date</label>
                                <input type="date" required value={editConfigForm.effective_date}
                                    onChange={e => setEditConfigForm({ ...editConfigForm, effective_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div className="col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only"
                                            checked={editConfigForm.ctr_enabled}
                                            onChange={e => setEditConfigForm({ ...editConfigForm, ctr_enabled: e.target.checked, ctr_value: e.target.checked ? editConfigForm.ctr_value : '' })} />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${editConfigForm.ctr_enabled ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editConfigForm.ctr_enabled ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white">Enable CTR</span>
                                        <p className="text-xs text-slate-500">Amount = Units × CTR × Rate</p>
                                    </div>
                                </label>
                            </div>
                            {editConfigForm.ctr_enabled && (
                                <div className="col-span-2">
                                    <label className="block text-sm text-slate-400 mb-1.5">CTR Value</label>
                                    <input type="number" step="0.0001" required value={editConfigForm.ctr_value}
                                        onChange={e => setEditConfigForm({ ...editConfigForm, ctr_value: e.target.value })}
                                        className="w-full bg-slate-950 border border-blue-500/50 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-blue-500 transition-all" />
                                </div>
                            )}

                            {/* Edit Genset Selection */}
                            <div className="col-span-2 mt-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={!!editConfigForm.genset}
                                            onChange={(e) => setEditConfigForm({ ...editConfigForm, genset: e.target.checked ? (gensets[0]?.id || '') : '' })}
                                        />
                                        <div className={`w-10 h-6 rounded-full transition-colors ${editConfigForm.genset ? 'bg-yellow-600' : 'bg-slate-700'}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editConfigForm.genset ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white">Link Genset</span>
                                        <p className="text-xs text-slate-500">Associate a power backup unit</p>
                                    </div>
                                </label>
                            </div>

                            {!!editConfigForm.genset && (
                                <div className="col-span-2">
                                    <label className="block text-sm text-slate-400 mb-1.5">Select Genset</label>
                                    <select
                                        value={editConfigForm.genset}
                                        onChange={(e) => setEditConfigForm({ ...editConfigForm, genset: e.target.value })}
                                        className="w-full bg-slate-950 border border-yellow-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-all shadow-sm"
                                    >
                                        <option value="">-- Choose a Genset --</option>
                                        {gensets.map(g => (
                                            <option key={g.id} value={g.id}>{g.name} ({g.total_kva} KVA)</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="col-span-2 flex gap-3 mt-2">
                                <button type="button" onClick={() => setIsEditConfigModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">Cancel</button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyMaster;
