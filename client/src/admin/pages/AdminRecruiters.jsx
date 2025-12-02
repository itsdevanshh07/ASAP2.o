import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getAdminRecruiters, verifyRecruiter } from '../services/adminApi';
import { toast } from 'react-toastify';

const AdminRecruiters = () => {
    const { getToken } = useAuth();
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecruiters = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getAdminRecruiters(token);
            if (data.success) {
                setRecruiters(data.recruiters);
            }
        } catch (error) {
            toast.error("Failed to fetch recruiters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruiters();
    }, []);

    const handleVerify = async (id) => {
        try {
            const token = await getToken();
            const data = await verifyRecruiter(token, id);
            if (data.success) {
                toast.success(data.message);
                fetchRecruiters();
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Recruiter Management</h2>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-600">Company</th>
                            <th className="p-4 font-medium text-gray-600">Email</th>
                            <th className="p-4 font-medium text-gray-600">Status</th>
                            <th className="p-4 font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
                        ) : recruiters.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center">No recruiters found</td></tr>
                        ) : (
                            recruiters.map(recruiter => (
                                <tr key={recruiter._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={recruiter.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        {recruiter.name}
                                    </td>
                                    <td className="p-4">{recruiter.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${recruiter.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {recruiter.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleVerify(recruiter._id)}
                                            className={`text-xs px-3 py-1 rounded border ${recruiter.isVerified ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}`}
                                        >
                                            {recruiter.isVerified ? 'Unverify' : 'Verify'}
                                        </button>
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

export default AdminRecruiters;
