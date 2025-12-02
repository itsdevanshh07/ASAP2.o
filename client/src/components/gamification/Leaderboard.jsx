import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Crown } from 'lucide-react';

const Leaderboard = ({ apiBase }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await axios.get(`${apiBase}/api/gamification/leaderboard`);
                if (data.success) {
                    setLeaders(data.leaderboard);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [apiBase]);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-500" size={24} />;
        if (index === 1) return <Medal className="text-gray-400" size={24} />;
        if (index === 2) return <Medal className="text-orange-600" size={24} />;
        return <span className="font-bold text-gray-500">#{index + 1}</span>;
    };

    if (loading) return <div className="p-8 text-center">Loading Leaderboard...</div>;

    return (
        <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <Trophy className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Achievers</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium w-20">Rank</th>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium text-center">Level</th>
                            <th className="px-6 py-4 font-medium text-right">XP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {leaders.map((user, index) => (
                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 flex justify-center">
                                    {getRankIcon(index)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user.userId?.image || 'https://via.placeholder.com/40'}
                                            alt={user.userId?.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{user.userId?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.stats?.jobsApplied || 0} Jobs Applied</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                        Lvl {user.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-medium text-gray-700 dark:text-gray-300">
                                    {user.xp.toLocaleString()} XP
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
