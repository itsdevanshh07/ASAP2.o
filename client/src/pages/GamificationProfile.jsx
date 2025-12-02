import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import BadgeShowcase from '../components/gamification/BadgeShowcase';
import Leaderboard from '../components/gamification/Leaderboard';
import { Zap, Target, Flame } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const GamificationProfile = () => {
    const { backendUrl } = useContext(AppContext);
    const { getToken } = useAuth();

    const [profile, setProfile] = useState(null);
    const [allBadges, setAllBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const headers = { Authorization: `Bearer ${token}` };

                const [profileRes, badgesRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/gamification/profile`, { headers }),
                    axios.get(`${backendUrl}/api/gamification/badges`)
                ]);

                if (profileRes.data.success) {
                    setProfile(profileRes.data);
                }
                if (badgesRes.data.success) {
                    setAllBadges(badgesRes.data.badges);
                }
            } catch (error) {
                console.error("Error fetching gamification data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [backendUrl]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const { progress, badges } = profile || {};

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Zap size={32} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Current Level</p>
                            <h2 className="text-3xl font-bold">Level {progress?.level || 1}</h2>
                            <p className="text-xs text-blue-100 mt-1">{progress?.xp || 0} Total XP</p>
                        </div>
                    </div>
                    {/* XP Bar */}
                    <div className="mt-4 bg-black/20 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-white h-full rounded-full"
                            style={{ width: `${(progress?.xp % 100)}%` }} // Simplified progress
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-card-bg rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
                        <Flame size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Current Streak</p>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{progress?.currentStreak || 0} Days</h2>
                        <p className="text-xs text-gray-400">Keep it up!</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-bg rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full">
                        <Target size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Badges Earned</p>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{badges?.length || 0}</h2>
                        <p className="text-xs text-gray-400">/{allBadges.length} Available</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Badges Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Badges</h2>
                        <BadgeShowcase badges={badges || []} allBadges={allBadges} />
                    </div>
                </div>

                {/* Leaderboard Sidebar */}
                <div>
                    <Leaderboard apiBase={backendUrl} />
                </div>
            </div>
        </div>
    );
};

export default GamificationProfile;
