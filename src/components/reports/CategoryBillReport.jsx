import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, RefreshCw, FileText } from 'lucide-react';

import API_BASE from '../../apiConfig';

const INR = (num) => num != null ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) : '—';
const INR_INT = (num) => num != null ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.ceil(num)) : '—';
const fmt = (num) => num != null ? new Intl.NumberFormat('en-IN').format(num) : '—';

const CategoryBillReport = () => {
    // Default to current month and year
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE}/reports/category-bill/`, {
                params: { month, year }
            });
            setReportData(response.data);
        } catch (err) {
            console.error('Error fetching Category Bill report:', err);
            setError('Failed to fetch report data. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-purple-500" />
                        EB Bill Category-wise
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">View Category-wise Electricity billing details</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-transparent text-slate-300 px-4 py-2 outline-none appearance-none cursor-pointer hover:text-white"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value} className="bg-slate-900">
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <div className="w-px bg-slate-800 my-2"></div>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-transparent text-slate-300 px-4 py-2 outline-none appearance-none cursor-pointer hover:text-white"
                        >
                            {years.map(y => (
                                <option key={y} value={y} className="bg-slate-900">
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={fetchReport}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-purple-400' : 'text-purple-400'} />
                        Refresh
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center gap-3">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            ) : reportData.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <Calendar className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                    <h3 className="text-lg font-medium text-slate-300">No Data Available</h3>
                    <p className="text-slate-500">There are no meter readings recorded for the selected month.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {reportData.map((data) => (
                        <div key={data.category_name} className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                            {/* Category Header */}
                            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono">C</div>
                                    {data.category_name}
                                </h3>
                                <div className="flex gap-8 text-sm items-center">
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Total Readings</span>
                                        <span className="font-mono text-white text-lg">{data.readings.length}</span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-700"></div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Total Units</span>
                                        <span className="font-mono text-cyan-400 text-lg font-bold">{fmt(data.readings.reduce((sum, r) => sum + (parseFloat(r.reading_value) || 0), 0))}</span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-700"></div>
                                    <div className="flex flex-col items-end bg-purple-500/10 px-4 py-1.5 rounded-xl border border-purple-500/20">
                                        <span className="text-purple-500/80 text-xs uppercase tracking-wider font-bold">Total Category Amount</span>
                                        <span className="font-mono text-purple-400 text-xl font-bold">₹{INR_INT(data.total_net_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Companies Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                                            <th className="px-4 py-4 font-medium sticky left-0 bg-slate-950/90 backdrop-blur z-10">Company Name</th>
                                            <th className="px-3 py-4 font-medium text-right">Prev Reading</th>
                                            <th className="px-3 py-4 font-medium text-right">Curr Reading</th>
                                            <th className="px-3 py-4 font-medium text-right text-cyan-400">Units</th>
                                            <th className="px-3 py-4 font-medium text-right">Rate(₹)</th>
                                            <th className="px-3 py-4 font-medium text-right text-blue-400">Amount(₹)</th>
                                            <th className="px-3 py-4 font-medium text-right">FD(₹)</th>
                                            <th className="px-3 py-4 font-medium text-right">KW/KVA</th>
                                            <th className="px-3 py-4 font-medium text-right text-indigo-300">FD×KVA(₹)</th>
                                            <th className="px-3 py-4 font-medium text-right text-amber-400">Peak Hr(₹)</th>
                                            <th className="px-3 py-4 font-medium text-right text-emerald-400">Subtotal(₹)</th>
                                            <th className="px-3 py-4 font-medium text-right">Tax %</th>
                                            <th className="px-3 py-4 font-medium text-right">Tax(₹)</th>
                                            <th className="px-4 py-4 font-medium text-right text-yellow-400 sticky right-0 bg-slate-950/90 backdrop-blur z-10 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.5)]">Net Amt(₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                                        {data.readings.length === 0 ? (
                                            <tr>
                                                <td colSpan="14" className="p-8 text-center text-slate-500">
                                                    No readings recorded for this Category.
                                                </td>
                                            </tr>
                                        ) : (
                                            data.readings.map((r) => (
                                                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-white sticky left-0 bg-slate-900 hover:bg-slate-800/80 transition-colors z-10">{r.company_name}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-slate-400">{fmt(r.previous_reading)}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-slate-300">{fmt(r.current_reading)}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-cyan-400 font-semibold">{fmt(r.reading_value)}</td>
                                                    <td className="px-3 py-3 text-right font-mono">{r.unit_rate != null ? r.unit_rate : '—'}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-blue-400">{INR(r.amount)}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-purple-400">{INR(r.fixed_demand)}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-slate-400">{r.per_kva != null ? r.per_kva : '—'}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-indigo-300">{INR(r.fd_price)}</td>
                                                    <td className="px-3 py-3 text-right font-mono">
                                                        {r.peak_hour_enabled
                                                            ? <span className="text-amber-400">{INR(r.peak_hour_charges)}</span>
                                                            : <span className="text-slate-600 text-xs">—</span>
                                                        }
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-mono text-emerald-400 font-semibold">{INR(r.stotal)}</td>
                                                    <td className="px-3 py-3 text-right font-mono text-slate-500">{r.tax_percentage}%</td>
                                                    <td className="px-3 py-3 text-right font-mono text-slate-400">{INR(r.tax_amount)}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-yellow-400 font-bold text-base sticky right-0 bg-slate-900 hover:bg-slate-800/80 transition-colors z-10 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.5)]">{INR_INT(r.net_amount)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {/* Overall Grand Total Summary */}
                    <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-purple-500/10 transition-colors duration-500"></div>
                        <div className="relative">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Grand Total Summary</h3>
                            <p className="text-slate-500 text-sm">Consolidated report totals across all Categories</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end gap-12 relative">
                            <div className="flex flex-col items-center md:items-end">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Units</span>
                                <span className="text-4xl font-black text-cyan-400 font-mono tracking-tighter">
                                    {fmt(reportData.reduce((sum, c) => sum + c.readings.reduce((s, r) => s + (parseFloat(r.reading_value) || 0), 0), 0))}
                                </span>
                            </div>
                            <div className="w-px h-16 bg-slate-800 hidden md:block"></div>
                            <div className="flex flex-col items-center md:items-end p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                                <span className="text-purple-500 text-xs font-bold uppercase tracking-widest mb-1">Total Net Amount (INR)</span>
                                <span className="text-4xl font-black text-purple-400 font-mono tracking-tighter">
                                    ₹{INR_INT(reportData.reduce((sum, c) => sum + (parseFloat(c.total_net_amount) || 0), 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryBillReport;
