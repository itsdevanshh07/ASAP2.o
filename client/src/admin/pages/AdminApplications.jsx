import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getAdminApplications } from '../services/adminApi';
import { toast } from 'react-toastify';

const AdminApplications = () => {
    const { getToken } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getAdminApplications(token);
            if (data.success) {
                setApplications(data.applications);
            }
        } catch (error) {
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Applications</h2>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-600">Candidate</th>
                            <th className="p-4 font-medium text-gray-600">Job Title</th>
                            <th className="p-4 font-medium text-gray-600">Company</th>
                            <th className="p-4 font-medium text-gray-600">Applied At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
                        ) : applications.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center">No applications found</td></tr>
                        ) : (
                            applications.map(app => (
                                <tr key={app._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4">{app.userId?.name || 'Unknown'}</td>
                                    <td className="p-4">{app.jobId?.title || 'Unknown'}</td>
                                    <td className="p-4">{app.companyId?.name || 'Unknown'}</td>
                                    <td className="p-4">{new Date(app.date).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminApplications;
