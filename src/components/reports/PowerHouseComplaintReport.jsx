import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE from '../../apiConfig'
import { Calendar, Clock, Download, FileText, Loader2, AlertCircle, MessageSquare } from 'lucide-react'

export default function PowerHouseComplaintReport() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [reportData, setReportData] = useState(null)
    const [activeTab, setActiveTab] = useState('open') // 'open' or 'closed'

    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    })

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ]

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

    useEffect(() => {
        fetchReport()
    }, [filters])

    const fetchReport = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await axios.get(`${API_BASE}/reports/complaints/`, { params: filters })
            setReportData(res.data)
        } catch (e) {
            setError('Failed to fetch powerhouse complaints report data.')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-xl"><MessageSquare size={28} className="text-amber-400" /></div>
                        Power House Complaints Report
                    </h1>
                    <p className="text-slate-400 mt-2">Monthly log of electrical service requests and powerhouse issues</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <div className="flex items-center gap-2 px-3">
                        <Calendar size={18} className="text-slate-500" />
                        <select
                            value={filters.month}
                            onChange={e => setFilters({ ...filters, month: parseInt(e.target.value) })}
                            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                        >
                            {months.map(m => <option key={m.value} value={m.value} className="bg-slate-900">{m.label}</option>)}
                        </select>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex items-center gap-2 px-3">
                        <select
                            value={filters.year}
                            onChange={e => setFilters({ ...filters, year: parseInt(e.target.value) })}
                            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                        >
                            {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl text-rose-400 flex items-center gap-3 animate-in zoom-in-95">
                    <AlertCircle size={24} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit">
                <button
                    onClick={() => setActiveTab('open')}
                    className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'open' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Open Complaints
                </button>
                <button
                    onClick={() => setActiveTab('closed')}
                    className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'closed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Closed Complaints
                </button>
            </div>

            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-300">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 size={48} className="animate-spin mb-4 opacity-20 text-blue-500" />
                        <p className="text-lg font-medium animate-pulse">Generating Report...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50">
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50 text-center">S.No</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">Date</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">Location</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">Complaint / Request</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">Start</th>
                                    {activeTab === 'closed' && <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">End</th>}
                                    {activeTab === 'closed' && <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50 text-right">Duration</th>}
                                    {activeTab === 'open' && <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">Status</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {((reportData?.complaints || []).filter(c => activeTab === 'closed' ? c.is_closed : !c.is_closed)).length === 0 ? (
                                    <tr>
                                        <td colSpan={activeTab === 'closed' ? 7 : 6} className="px-8 py-12 text-center text-slate-500 italic">
                                            No {activeTab} complaints records found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData?.complaints
                                        .filter(c => activeTab === 'closed' ? c.is_closed : !c.is_closed)
                                        .map((comp, index) => (
                                            <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-4 py-5 text-slate-400 font-mono text-center text-sm">{index + 1}</td>
                                                <td className="px-6 py-5 text-white font-medium text-sm whitespace-nowrap">{formatDate(comp.date)}</td>
                                                <td className="px-6 py-5">
                                                    <span className="text-slate-200 font-bold text-sm">{comp.location}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-slate-400 text-sm italic max-w-xs truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                                        "{comp.complaint}"
                                                    </p>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className="text-emerald-500 font-mono text-xs">{comp.start_time}</span>
                                                </td>
                                                {activeTab === 'closed' && (
                                                    <td className="px-4 py-5">
                                                        <span className="text-rose-500 font-mono text-xs">{comp.end_time}</span>
                                                    </td>
                                                )}
                                                {activeTab === 'closed' && (
                                                    <td className="px-6 py-5 text-right">
                                                        <span className="text-blue-400 font-bold font-mono bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 text-xs">
                                                            {comp.duration}
                                                        </span>
                                                    </td>
                                                )}
                                                {activeTab === 'open' && (
                                                    <td className="px-6 py-5">
                                                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20 text-xs font-bold">
                                                            ACTIVE
                                                        </span>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                )}
                            </tbody>
                            {activeTab === 'closed' && reportData?.complaints.filter(c => c.is_closed).length > 0 && (
                                <tfoot>
                                    <tr className="bg-blue-500/5 border-t border-blue-500/20">
                                        <td colSpan="6" className="px-8 py-6 text-xl font-bold text-white text-right">Grand Total Duration</td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="text-2xl font-black text-blue-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
                                                {reportData.total_duration} <span className="text-sm font-medium uppercase text-blue-500/60 ml-1">Hrs</span>
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 p-2">
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 shadow-xl">
                    <Download size={18} /> Export PDF
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-900/20">
                    <Download size={18} /> Download Excel
                </button>
            </div>
        </div>
    )
}
