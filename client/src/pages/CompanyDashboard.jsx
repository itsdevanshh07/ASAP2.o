import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Loader2, Users, DollarSign, Briefcase, Filter } from 'lucide-react';

const CompanyDashboard = () => {
    const { backendUrl, companyToken } = useContext(AppContext);

    const [employees, setEmployees] = useState([]);
    const [summary, setSummary] = useState({ totalEmployees: 0, totalSalary: 0, avgSalary: 0 });
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [jobId, setJobId] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (jobId) params.jobId = jobId;
            if (minSalary) params.minSalary = minSalary;
            if (maxSalary) params.maxSalary = maxSalary;

            const { data } = await axios.get(`${backendUrl}/api/company/dashboard`, {
                headers: { token: companyToken },
                params
            });

            if (data.success) {
                setEmployees(data.employees);
                setSummary(data.summary);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyJobs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/company/list-jobs`, {
                headers: { token: companyToken }
            });
            if (data.success) {
                setJobs(data.jobsData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (companyToken) {
            fetchCompanyJobs();
            fetchDashboardData();
        }
    }, [companyToken]);

    const handleFilter = (e) => {
        e.preventDefault();
        fetchDashboardData();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Company Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-card-bg p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                >
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Employees</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalEmployees}</h3>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-card-bg p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                >
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Salary Payout</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${summary.totalSalary.toLocaleString()}</h3>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-card-bg p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                >
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Average Salary</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${summary.avgSalary.toLocaleString()}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-card-bg p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Job</label>
                        <select
                            value={jobId}
                            onChange={(e) => setJobId(e.target.value)}
                            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Jobs</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Salary</label>
                        <input
                            type="number"
                            value={minSalary}
                            onChange={(e) => setMinSalary(e.target.value)}
                            placeholder="0"
                            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Salary</label>
                        <input
                            type="number"
                            value={maxSalary}
                            onChange={(e) => setMaxSalary(e.target.value)}
                            placeholder="Max"
                            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Filter size={18} /> Filter
                    </button>
                </form>
            </div>

            {/* Employees Table / Cards */}
            <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Employee List</h2>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : employees.length > 0 ? (
                    <>
                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Employee Name</th>
                                        <th className="px-6 py-4 font-medium">Job Title</th>
                                        <th className="px-6 py-4 font-medium">Salary</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Applied Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {employees.map((emp, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <img src={emp.employee_image} alt="" className="w-10 h-10 rounded-full object-cover border dark:border-gray-600" />
                                                <span className="font-medium text-gray-800 dark:text-white">{emp.employee_name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{emp.job_title}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">${emp.salary.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                    ${emp.status === 'hired' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        emp.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                    {emp.status || 'Applied'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                                {new Date(emp.applied_at).toLocaleDateString()}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View: Cards */}
                        <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
                            {employees.map((emp, index) => (
                                <div key={index} className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <img src={emp.employee_image} alt="" className="w-12 h-12 rounded-full object-cover border dark:border-gray-600" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{emp.employee_name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{emp.job_title}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Salary:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">${emp.salary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                                        <span className="text-gray-700 dark:text-gray-300">{new Date(emp.applied_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                            ${emp.status === 'hired' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                emp.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                            {emp.status || 'Applied'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        No employees found matching your filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDashboard;
