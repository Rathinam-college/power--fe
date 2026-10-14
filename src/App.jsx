import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import API_BASE from './apiConfig'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity, ChevronDown, Settings, Database, FileText, Menu, X } from 'lucide-react'
import logo from './assets/logo.png'

import CompanyMaster from './components/CompanyMaster'
import CategoryMaster from './components/CategoryMaster'
import BlockMaster from './components/BlockMaster'
import GensetMaster from './components/GensetMaster'
import TaxMaster from './components/TaxMaster'
import DieselMaster from './components/DieselMaster'
import FacilityBillingUnitMaster from './components/FacilityBillingUnitMaster'
import MeterReadingForm from './components/MeterReadingForm'
import GensetReadingForm from './components/GensetReadingForm'
import DieselEntryForm from './components/DieselEntryForm'
import DGBillReport from './components/reports/DGBillReport'
import EBBillReport from './components/reports/EBBillReport'
import CategoryBillReport from './components/reports/CategoryBillReport'
import PowerCutReport from './components/reports/PowerCutReport'
import PowerHouseComplaintReport from './components/reports/PowerHouseComplaintReport'
import MonthWiseSummary from './components/MonthWiseSummary'
import PowerCutEntryForm from './components/PowerCutEntryForm'
import PowerHouseComplaintForm from './components/PowerHouseComplaintForm'
import UserManagement from './components/UserManagement'

import Sidebar from './components/Sidebar'
import Login from './pages/Login'

const data = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 200 },
    { name: 'Thu', value: 278 },
    { name: 'Fri', value: 189 },
];

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('pt_token'));
    const [view, setView] = useState('Dashboard');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCurrentUser();
        }
    }, [isAuthenticated]);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('pt_token');
            const response = await axios.get(`${API_BASE}/users/me/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user permissions:', error);
            // Optionally log out if token is invalid
        }
    };

    const hasPermission = (item) => {
        if (item === 'Dashboard') return true;
        if (!currentUser) return false;
        if (currentUser.is_superuser) return true;
        
        const viewPerms = currentUser.accessible_views?.[item];
        return viewPerms && viewPerms.includes('view');
    };

    const handleNavigate = (item) => {
        if (!hasPermission(item)) {
            alert("You do not have permission to access this view.");
            return;
        }

        if (item === 'Company') setView('CompanyMaster');
        else if (item === 'Categories') setView('CategoryMaster');
        else if (item === 'Blocks') setView('BlockMaster');
        else if (item === 'Gensets') setView('GensetMaster');
        else if (item === 'Tax Rates') setView('TaxMaster');
        else if (item === 'Diesel Prices') setView('DieselMaster');
        else if (item === 'Billing Units') setView('FacilityBillingUnitMaster');
        else if (item === 'EB Meter Reading') setView('MeterReadingForm');
        else if (item === 'Genset Reading') setView('GensetReadingForm');
        else if (item === 'Diesel Entry') setView('DieselEntryForm');
        else if (item === 'DG Bill') setView('DGBillReport');
        else if (item === 'EB Bill Block-wise') setView('EBBillReport');
        else if (item === 'EB Bill Category-wise') setView('CategoryBillReport');
        else if (item === 'Month-wise Summary') setView('MonthWiseSummary');
        else if (item === 'Power Cut Details') setView('PowerCutReport');
        else if (item === 'Power House Complaints Report') setView('PowerHouseComplaintReport');
        else if (item === 'Power Cut Entry') setView('PowerCutEntryForm');
        else if (item === 'Power House Complaints') setView('PowerHouseComplaintForm');
        else if (item === 'User Management') setView('UserManagement');
        else if (item === 'Dashboard') setView('Dashboard');
    };

    const renderView = () => {
        switch (view) {
            case 'CompanyMaster':
                return <CompanyMaster />;
            case 'CategoryMaster':
                return <CategoryMaster />;
            case 'BlockMaster':
                return <BlockMaster />;
            case 'GensetMaster':
                return <GensetMaster />;
            case 'TaxMaster':
                return <TaxMaster />;
            case 'DieselMaster':
                return <DieselMaster />;
            case 'FacilityBillingUnitMaster':
                return <FacilityBillingUnitMaster />;
            case 'MeterReadingForm':
                return <MeterReadingForm />;
            case 'GensetReadingForm':
                return <GensetReadingForm />;
            case 'DieselEntryForm':
                return <DieselEntryForm />;
            case 'DGBillReport':
                return <DGBillReport />;
            case 'EBBillReport':
                return <EBBillReport />;
            case 'CategoryBillReport':
                return <CategoryBillReport />;
            case 'PowerCutReport':
                return <PowerCutReport />;
            case 'PowerHouseComplaintReport':
                return <PowerHouseComplaintReport />;
            case 'MonthWiseSummary':
                return <MonthWiseSummary onBack={() => setView('Dashboard')} />;
            case 'PowerCutEntryForm':
                return <PowerCutEntryForm />;
            case 'PowerHouseComplaintForm':
                return <PowerHouseComplaintForm />;
            case 'UserManagement':
                return <UserManagement />;
            default:
                return (
                    <div className="grid gap-8">
                        {/* Top Chart Section */}
                        <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Consumption Overview</h2>
                                    <p className="text-sm text-slate-500">Weekly breakdown of energy usage (kWh)</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                                        <Activity size={12} /> Live
                                    </span>
                                </div>
                            </div>

                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.5} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#475569"
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#475569"
                                            axisLine={false}
                                            tickLine={false}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: '1px solid #1e293b',
                                                borderRadius: '12px',
                                                padding: '12px'
                                            }}
                                            itemStyle={{ color: '#60a5fa' }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="value"
                                            fill="url(#barGradient)"
                                            radius={[8, 8, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                                        <Activity size={24} />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-300">System Status</h3>
                                </div>
                                <p className="text-2xl font-bold text-emerald-400">99.8% Online</p>
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                                        <Database size={24} />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-300">Storage Usage</h3>
                                </div>
                                <p className="text-2xl font-bold text-blue-400">12.4 TB Syncing</p>
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-purple-600/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                                        <FileText size={24} />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-300">New Alerts</h3>
                                </div>
                                <p className="text-2xl font-bold text-rose-400">3 Critical</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 flex">
            {/* Navigation Sidebar */}
            <Sidebar currentView={view} onNavigate={handleNavigate} userPermissions={currentUser?.is_superuser ? 'ALL' : (currentUser?.accessible_views || [])} />

            {/* Main Content */}
            <main className="main-container p-6 lg:px-10 lg:pb-10 lg:pt-[22px] relative w-full">
                {renderView()}
            </main>
        </div>
    )
}

export default App
