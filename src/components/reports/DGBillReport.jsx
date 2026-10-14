import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, RefreshCw, FileText } from 'lucide-react';

import API_BASE from '../../apiConfig';

const INR = (num) => num != null ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) : '—';

const DGBillReport = () => {
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
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // range from 2 years ago to 2 years future

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE}/reports/dg-bill/`, {
                params: { month, year }
            });
            setReportData(response.data);
        } catch (err) {
            console.error('Error fetching DG Bill report:', err);
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
                        <FileText className="text-blue-500" />
                        DG Bill Report
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">View Genset-wise Diesel billing calculations</p>
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
                        <RefreshCw size={18} className={loading ? 'animate-spin text-blue-400' : 'text-blue-400'} />
                        Refresh
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
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
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : reportData.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <Calendar className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                    <h3 className="text-lg font-medium text-slate-300">No Data Available</h3>
                    <p className="text-slate-500">There are no genset readings for the selected month.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {reportData.map((data) => {
                        return (
                            <div key={data.genset_id} className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                                {/* Genset Header */}
                                <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        {data.genset_name}
                                    </h3>
                                    <div className="flex gap-6 text-sm">
                                        <div className="flex flex-col items-end">
                                            <span className="text-slate-500">Total Units</span>
                                            <span className="font-mono text-emerald-400">{data.total_genset_units}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-slate-500">Total Diesel Cons.</span>
                                            <span className="font-mono text-amber-400">{data.total_diesel_consumed} L</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-slate-500">Diesel Price</span>
                                            <span className="font-mono text-blue-400">₹{data.active_diesel_price}/L</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Calculate total amount for this genset */}
                                {(() => {
                                    const totalAmount = data.companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
                                    return (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-900 text-slate-400 text-sm border-b border-slate-800">
                                                        <th className="p-4 font-medium">Company Name</th>
                                                        <th className="p-4 font-medium text-right">Prev Reading</th>
                                                        <th className="p-4 font-medium text-right">Curr Reading</th>
                                                        <th className="p-4 font-medium text-right text-emerald-400">Units</th>
                                                        <th className="p-4 font-medium text-right text-purple-400">Per Unit Rate (₹)</th>
                                                        <th className="p-4 font-medium text-right text-white">Amount (₹)</th>
                                                        <th className="p-4 font-medium text-right text-amber-400">Liters (L)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-slate-300">
                                                    {data.companies.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="p-8 text-center text-slate-500">
                                                                No readings recorded for companies under this Genset this month.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.companies.map((company) => (
                                                            <tr key={company.company_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                                <td className="p-4 font-medium text-white">{company.company_name}</td>
                                                                <td className="p-4 text-right font-mono">{company.previous_reading}</td>
                                                                <td className="p-4 text-right font-mono">{company.current_reading}</td>
                                                                <td className="p-4 text-right font-mono text-emerald-400 font-bold">{company.units}</td>
                                                                <td className="p-4 text-right font-mono text-purple-400">{company.per_unit_rate}</td>
                                                                <td className="p-4 text-right font-mono text-white font-bold">{company.amount}</td>
                                                                <td className="p-4 text-right font-mono text-amber-400">{company.liters}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                                {data.companies.length > 0 && (
                                                    <tfoot className="bg-slate-900 border-t-2 border-slate-700 text-slate-300">
                                                        <tr>
                                                            <td colSpan="5" className="p-4 text-right font-bold text-slate-400">Genset Total</td>
                                                            <td className="p-4 text-right font-mono text-white text-lg font-bold">₹{INR(totalAmount)}</td>
                                                            <td className="p-4"></td>
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })}

                    {/* Overall Grand Total Summary */}
                    <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                        <div className="relative">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Grand Total Summary</h3>
                            <p className="text-slate-500 text-sm">Consolidated DG report totals across all Gensets</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end gap-10 relative">
                            <div className="flex flex-col items-center md:items-end">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Overall Units</span>
                                <span className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                                    {reportData.reduce((sum, g) => sum + (parseFloat(g.total_genset_units) || 0), 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="w-px h-16 bg-slate-800 hidden md:block"></div>
                            <div className="flex flex-col items-center md:items-end p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                <span className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-1">Total Amount (₹)</span>
                                <span className="text-4xl font-black text-white font-mono tracking-tighter">
                                    ₹{INR(reportData.reduce((sum, g) => sum + g.companies.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0), 0))}
                                </span>
                            </div>
                            <div className="w-px h-16 bg-slate-800 hidden md:block"></div>
                            <div className="flex flex-col items-center md:items-end">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Diesel (L)</span>
                                <span className="text-3xl font-black text-amber-500 font-mono tracking-tighter">
                                    {reportData.reduce((sum, g) => sum + (parseFloat(g.total_diesel_consumed) || 0), 0).toFixed(2)} L
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DGBillReport;
