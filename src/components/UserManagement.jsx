import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Shield, Key } from 'lucide-react';
import API_BASE from '../apiConfig';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', accessible_views: {} });
    const [loading, setLoading] = useState(false);

    const availableViews = [
        'Company', 'Categories', 'Blocks', 'Gensets', 'Tax Rates', 'Diesel Prices', 'Facility Billing Units',
        'EB Meter Reading', 'Genset Reading', 'Diesel Entry', 'Power Cut Entry', 'Power House Complaints',
        'DG Bill', 'EB Bill Block-wise', 'EB Bill Category-wise', 'Month-wise Summary', 'Power Cut Details', 'Power House Complaints Report',
        'User Management'
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE}/users/`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users');
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({ username: user.username, password: '', accessible_views: user.accessible_views || {} });
        } else {
            setCurrentUser(null);
            setFormData({ username: '', password: '', accessible_views: {} });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setFormData({ username: '', password: '', accessible_views: {} });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (view, action) => {
        setFormData(prev => {
            const currentViews = { ...prev.accessible_views };
            const viewActions = currentViews[view] ? [...currentViews[view]] : [];
            
            if (viewActions.includes(action)) {
                // Remove action
                const newActions = viewActions.filter(a => a !== action);
                // If removing 'view', we should arguably remove all, but let's just let them uncheck view.
                // Wait, if they uncheck view, let's remove everything.
                if (action === 'view') {
                    delete currentViews[view];
                } else {
                    if (newActions.length === 0) {
                        delete currentViews[view];
                    } else {
                        currentViews[view] = newActions;
                    }
                }
            } else {
                // Add action
                // Automatically add 'view' if adding any other action
                if (!viewActions.includes('view')) {
                    viewActions.push('view');
                }
                if (!viewActions.includes(action)) {
                    viewActions.push(action);
                }
                currentViews[view] = viewActions;
            }
            
            return { ...prev, accessible_views: currentViews };
        });
    };

    const selectAllPermissions = () => {
        const allPerms = {};
        availableViews.forEach(view => {
            allPerms[view] = ['view', 'create', 'edit', 'delete'];
        });
        setFormData(prev => ({ ...prev, accessible_views: allPerms }));
    };

    const clearAllPermissions = () => {
        setFormData(prev => ({ ...prev, accessible_views: {} }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = { username: formData.username };
        if (formData.password) {
            payload.password = formData.password;
        }

        try {
            if (currentUser) {
                await axios.patch(`${API_BASE}/users/${currentUser.id}/`, payload);
            } else {
                if (!formData.password) {
                    alert("Password is required for new users");
                    setLoading(false);
                    return;
                }
                await axios.post(`${API_BASE}/users/`, payload);
            }
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user. Username may already exist.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_BASE}/users/${id}/`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl"><Shield size={28} className="text-indigo-400" /></div>
                        User Management
                    </h1>
                    <p className="text-slate-400 mt-2">Manage system administrators and reset passwords</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                    <Plus size={20} /> Add User
                </button>
            </header>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Username</th>
                                <th className="px-6 py-4 font-semibold">Date Joined</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(user.date_joined).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-400/10 rounded-lg transition-colors mr-2"
                                            title="Edit User & Reset Password"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/20">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {currentUser ? <><Key size={20} className="text-indigo-400" /> Edit User</> : <><Shield size={20} className="text-indigo-400" /> Add New User</>}
                            </h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 p-1.5 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Password {currentUser && <span className="text-slate-500 text-xs font-normal ml-1">(Leave blank to keep existing password)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder={currentUser ? "Enter new password to reset" : "Enter password"}
                                        required={!currentUser}
                                    />
                                </div>
                                <div className="pt-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Access Permissions</label>
                                    <div className="bg-slate-950 border border-slate-700 rounded-xl overflow-hidden h-64 overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-900 sticky top-0 z-10 border-b border-slate-700 shadow-sm">
                                                <tr>
                                                    <th className="px-3 py-2 font-medium text-slate-300">View Name</th>
                                                    <th className="px-2 py-2 text-center text-xs font-medium text-slate-400">View</th>
                                                    <th className="px-2 py-2 text-center text-xs font-medium text-slate-400">Create</th>
                                                    <th className="px-2 py-2 text-center text-xs font-medium text-slate-400">Edit</th>
                                                    <th className="px-2 py-2 text-center text-xs font-medium text-slate-400">Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {availableViews.map(view => {
                                                    const perms = formData.accessible_views[view] || [];
                                                    return (
                                                        <tr key={view} className="hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-3 py-2 text-slate-300">{view}</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <input type="checkbox" checked={perms.includes('view')} onChange={() => handleCheckboxChange(view, 'view')} className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50" />
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                <input type="checkbox" checked={perms.includes('create')} onChange={() => handleCheckboxChange(view, 'create')} className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50" />
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                <input type="checkbox" checked={perms.includes('edit')} onChange={() => handleCheckboxChange(view, 'edit')} className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50" />
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                <input type="checkbox" checked={perms.includes('delete')} onChange={() => handleCheckboxChange(view, 'delete')} className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50" />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button type="button" onClick={selectAllPermissions} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-indigo-500/20">Select All</button>
                                        <button type="button" onClick={clearAllPermissions} className="px-3 py-1.5 rounded-lg bg-slate-800/50 text-xs font-medium text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 transition-colors border border-slate-700">Clear All</button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
