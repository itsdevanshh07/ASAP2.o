import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getAdminJobs, updateJobStatus } from '../services/adminApi';
import { toast } from 'react-toastify';

const AdminJobs = () => {
    const { getToken } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getAdminJobs(token);
            if (data.success) {
                setJobs(data.jobs);
            }
        } catch (error) {
            toast.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleStatusChange = async (jobId, status) => {
        try {
            const token = await getToken();
            const data = await updateJobStatus(token, jobId, status);
            if (data.success) {
                toast.success(data.message);
                fetchJobs();
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Job Management</h2>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-600">Job Title</th>
                            <th className="p-4 font-medium text-gray-600">Company</th>
                            <th className="p-4 font-medium text-gray-600">Location</th>
                            <th className="p-4 font-medium text-gray-600">Status</th>
                            <th className="p-4 font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                        ) : jobs.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center">No jobs found</td></tr>
                        ) : (
                            jobs.map(job => (
                                <tr key={job._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 font-medium">{job.title}</td>
                                    <td className="p-4">{job.companyId?.name || 'Unknown'}</td>
                                    <td className="p-4">{job.location}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs capitalize
                                            ${job.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                job.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    job.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {job.status !== 'approved' && (
                                            <button
                                                onClick={() => handleStatusChange(job._id, 'approved')}
                                                className="text-xs px-2 py-1 rounded border border-green-500 text-green-600 hover:bg-green-50"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {job.status !== 'rejected' && (
                                            <button
                                                onClick={() => handleStatusChange(job._id, 'rejected')}
                                                className="text-xs px-2 py-1 rounded border border-red-500 text-red-600 hover:bg-red-50"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        {job.status !== 'archived' && (
                                            <button
                                                onClick={() => handleStatusChange(job._id, 'archived')}
                                                className="text-xs px-2 py-1 rounded border border-gray-500 text-gray-600 hover:bg-gray-50"
                                            >
                                                Archive
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminJobs;
