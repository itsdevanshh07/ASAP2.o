import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getAdminAnalytics } from '../services/adminApi';
import { Users, Briefcase, FileText, CheckCircle, Building } from 'lucide-react';

const AdminAnalytics = () => {
    const { getToken } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = await getToken();
                const data = await getAdminAnalytics(token);
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [getToken]);

    if (loading) {
        return <div className="p-6">Loading analytics...</div>;
    }

    if (!stats) {
        return <div className="p-6">Failed to load analytics data.</div>;
    }

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Platform Analytics</h2>
                <p className="text-gray-500 mt-1">Overview of current platform performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Recruiters"
                    value={stats.totalRecruiters}
                    icon={Building}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Jobs"
                    value={stats.totalJobs}
                    icon={Briefcase}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Active Jobs"
                    value={stats.activeJobs}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={FileText}
                    color="bg-indigo-500"
                />
            </div>

            {/* Placeholder for future charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <Users size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">User Growth</h3>
                    <p className="text-gray-400 text-sm">Chart visualization coming soon</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <Briefcase size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Job Activity</h3>
                    <p className="text-gray-400 text-sm">Chart visualization coming soon</p>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
