import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getAdminAnalytics } from '../services/adminApi';

const AdminDashboard = () => {
    const { getToken } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await getToken();
                const data = await getAdminAnalytics(token);
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [getToken]);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats?.totalUsers} color="bg-blue-500" />
                <StatCard title="Total Recruiters" value={stats?.totalRecruiters} color="bg-green-500" />
                <StatCard title="Active Jobs" value={stats?.activeJobs} subValue={`Total: ${stats?.totalJobs}`} color="bg-purple-500" />
                <StatCard title="Total Applications" value={stats?.totalApplications} color="bg-orange-500" />
            </div>

            {/* Placeholder for charts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
                <div className="h-64 bg-gray-50 flex items-center justify-center text-gray-400">
                    Chart Placeholder (Signups/Jobs per week)
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subValue, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
            </div>
            <div className={`w-10 h-10 rounded-full ${color} opacity-20`}></div>
        </div>
    </div>
);

export default AdminDashboard;
