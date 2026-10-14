import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, Calendar, Download, Loader2, AlertCircle, ChevronLeft } from 'lucide-react'
import API_BASE from '../apiConfig';

export default function MonthWiseSummary({ onBack }) {
    const getCurrentMonthString = () => {
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${yyyy}-${mm}`;
    };

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [monthsCount, setMonthsCount] = useState(6)
    const [endDate, setEndDate] = useState(getCurrentMonthString())

    useEffect(() => {
        fetchSummary(monthsCount, endDate)
    }, [])

    const fetchSummary = async (mCount = monthsCount, eDate = endDate) => {
        try {
            setLoading(true)
            const [year, month] = eDate.split('-')
            const res = await axios.get(`${API_BASE}/reports/month-wise-summary/`, {
                params: {
                    months: mCount,
                    end_month: month,
                    end_year: year
                }
            })
            setData(res.data)
            setError(null)
        } catch (e) {
            setError('Failed to fetch summary data. Please ensure the backend is running.')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = (e) => {
        e.preventDefault();
        fetchSummary(monthsCount, endDate);
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                <Loader2 size={40} className="animate-spin text-blue-500" />
                <p className="animate-pulse">Generating summary report...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                <p className="text-red-400 mb-6">{error}</p>
                <button onClick={() => fetchSummary(monthsCount, endDate)} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors">
                    Try Again
                </button>
            </div>
        )
    }

    const months = data[0]?.data.map(m => m.month_name) || []

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl"><FileText size={28} className="text-emerald-400" /></div>
                        Month-wise Summary Report
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Detailed consumption & cost analytics across categories</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 border border-slate-700 transition-all font-medium no-print h-fit"
                >
                    <Download size={18} /> Print PDF
                </button>
            </header>

            <form onSubmit={handleGenerate} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-wrap items-end gap-4 no-print shadow-lg">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</label>
                    <select 
                        value={monthsCount} 
                        onChange={(e) => setMonthsCount(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                    >
                        <option value={3}>Last 3 Months</option>
                        <option value={6}>Last 6 Months</option>
                        <option value={9}>Last 9 Months</option>
                        <option value={12}>Last 12 Months</option>
                    </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ending Month</label>
                    <input 
                        type="month" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg outline-none focus:border-emerald-500 transition-colors [color-scheme:dark]"
                    />
                </div>

                <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
                >
                    <Calendar size={18} />
                    Generate Report
                </button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/20 backdrop-blur-sm">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800">
                            <th className="px-6 py-4 font-bold text-slate-300 uppercase tracking-wider border-r border-slate-800">Category</th>
                            <th className="px-6 py-4 font-bold text-slate-300 uppercase tracking-wider border-r border-slate-800">Description</th>
                            {months.map(m => (
                                <th key={m} className="px-6 py-4 font-bold text-slate-300 text-center uppercase tracking-wider min-w-[140px] truncate">{m}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((category) => {
                            const lastSnapshot = category.data[category.data.length - 1];
                            const isMultiUnit = lastSnapshot?.unit_count > 1;
                            const rowSpanCount = isMultiUnit ? 5 : 2;

                            return (
                                <React.Fragment key={category.category_id}>
                                    {/* Row 1: Total Units */}
                                    <tr className="border-b border-slate-800 hover:bg-white/5 transition-colors group">
                                        <td rowSpan={rowSpanCount} className="px-6 py-4 font-bold text-white bg-slate-900/40 border-r border-slate-800 text-base align-middle">
                                            {category.category_name}
                                        </td>
                                        <td className="px-6 py-3 font-medium text-slate-300 border-r border-slate-800 bg-slate-800/10">Total Units</td>
                                        {category.data.map((m, idx) => (
                                            <td key={idx} className="px-6 py-3 text-center text-slate-400 font-mono tracking-tighter tabular-nums group-hover:text-white transition-colors border-r border-slate-800/10 last:border-r-0">
                                                {m.total_units.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Row 2: Total Cost */}
                                    <tr className="border-b border-slate-800 hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-3 font-medium text-slate-300 border-r border-slate-800 bg-slate-800/10">Total Cost (₹)</td>
                                        {category.data.map((m, idx) => (
                                            <td key={idx} className="px-6 py-3 text-center text-emerald-400 font-mono font-bold tracking-tighter tabular-nums border-r border-slate-800/10 last:border-r-0">
                                                ₹ {m.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        ))}
                                    </tr>
                                    {isMultiUnit && (
                                        <>
                                            {/* Row 3: Billing Units Count */}
                                            <tr className="border-b border-slate-800 hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-3 font-medium text-slate-300 border-r border-slate-800 bg-slate-800/10 whitespace-nowrap">No. of {lastSnapshot?.unit_type || 'Units'}</td>
                                                {category.data.map((m, idx) => (
                                                    <td key={idx} className="px-6 py-3 text-center text-blue-400 font-medium border-r border-slate-800/10 last:border-r-0">
                                                        {m.unit_count}
                                                    </td>
                                                ))}
                                            </tr>
                                            {/* Row 4: Units per Billing Unit */}
                                            <tr className="border-b border-slate-800 hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-3 font-medium text-slate-300 border-r border-slate-800 bg-slate-800/10 whitespace-nowrap">Units / {lastSnapshot?.unit_type.slice(0, -1) || 'Unit'}</td>
                                                {category.data.map((m, idx) => (
                                                    <td key={idx} className="px-6 py-3 text-center text-slate-300 font-mono tracking-tighter tabular-nums border-r border-slate-800/10 last:border-r-0 group-hover:text-white transition-colors">
                                                        {m.units_per_billing.toFixed(2)}
                                                    </td>
                                                ))}
                                            </tr>
                                            {/* Row 5: Cost per Billing Unit */}
                                            <tr className="border-b border-slate-700/50 hover:bg-white/5 transition-colors group bg-slate-400/5">
                                                <td className="px-6 py-3 font-bold text-slate-100 border-r border-slate-800 bg-indigo-500/10 whitespace-nowrap">Cost / {lastSnapshot?.unit_type.slice(0, -1) || 'Unit'} (₹)</td>
                                                {category.data.map((m, idx) => (
                                                    <td key={idx} className="px-6 py-3 text-center text-indigo-400 font-bold font-mono tracking-tighter tabular-nums border-r border-slate-800/10 last:border-r-0">
                                                        ₹ {m.cost_per_billing.toFixed(2)}
                                                    </td>
                                                ))}
                                            </tr>
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* Grand Totals Section */}
                        {data.length > 0 && (
                            <>
                                <tr className="bg-slate-900 border-t-2 border-slate-700 text-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
                                    <td colSpan={2} className="px-6 py-4 font-black uppercase text-slate-300 tracking-widest text-right border-r border-slate-800">Grand Total Units</td>
                                    {months.map((mName, idx) => {
                                        const sum = data.reduce((acc, cat) => acc + (cat.data[idx]?.total_units || 0), 0);
                                        return (
                                            <td key={idx} className="px-6 py-4 text-center font-mono font-bold text-cyan-400 text-lg border-r border-slate-800/30 last:border-r-0">
                                                {sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr className="bg-slate-900 border-b border-slate-700 text-white">
                                    <td colSpan={2} className="px-6 py-4 font-black uppercase text-slate-300 tracking-widest text-right border-r border-slate-800">Grand Total Cost (₹)</td>
                                    {months.map((mName, idx) => {
                                        const sum = data.reduce((acc, cat) => acc + (cat.data[idx]?.total_cost || 0), 0);
                                        return (
                                            <td key={idx} className="px-6 py-4 text-center font-mono font-bold text-emerald-400 text-xl border-r border-slate-800/30 last:border-r-0">
                                                ₹ {sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No category data found for the summary report.</p>
                    </div>
                )}
            </div>

            <footer className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400 leading-relaxed no-print shadow-lg">
                <div className="flex gap-3">
                    <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-slate-200 mb-1">Report Methodology:</p>
                        <p>This summary aggregates all meter readings across categories for each calendar month. The "Cost per Unit" is derived based on the net EB bill amount (including fixed demand and taxes) divided by the active billing units (e.g. Students or IT Tenants) recorded for that facility in the respective month.</p>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .bg-slate-900\\/20 { background: white !important; border-color: #e2e8f0 !important; }
                    table { border-color: #cbd5e1 !important; color: black !important; }
                    th { background: #f1f5f9 !important; color: black !important; border-color: #cbd5e1 !important; }
                    td { background: white !important; color: black !important; border-color: #e2e8f0 !important; }
                    .text-emerald-400, .text-blue-400, .text-indigo-400 { color: black !important; font-weight: bold !important; }
                    .bg-emerald-500\\/20, .bg-indigo-500\\/10, .bg-slate-900\\/40 { background: #f8fafc !important; }
                }
            `}} />
        </div>
    )
}
