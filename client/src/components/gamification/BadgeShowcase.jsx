import React from 'react';
import { Award, Star, Zap, Shield, Trophy, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
    'award': Award,
    'star': Star,
    'zap': Zap,
    'shield': Shield,
    'trophy': Trophy
};

const rarityColors = {
    'BRONZE': 'bg-orange-100 text-orange-700 border-orange-200',
    'SILVER': 'bg-gray-100 text-gray-700 border-gray-200',
    'GOLD': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'PLATINUM': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'DIAMOND': 'bg-purple-100 text-purple-700 border-purple-200'
};

const BadgeCard = ({ badge, unlockedAt }) => {
    const Icon = iconMap[badge.icon] || Award;
    const isLocked = !unlockedAt;

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative p-4 rounded-xl border-2 flex flex-col items-center text-center gap-2 transition-all
                ${isLocked ? 'bg-gray-50 border-gray-200 opacity-60 grayscale' : rarityColors[badge.rarity] || 'bg-white border-gray-200'}
            `}
        >
            <div className={`p-3 rounded-full ${isLocked ? 'bg-gray-200' : 'bg-white/50'}`}>
                <Icon size={32} />
            </div>

            <div>
                <h3 className="font-bold text-sm">{badge.name}</h3>
                <p className="text-xs opacity-80 line-clamp-2">{badge.description}</p>
            </div>

            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-xl">
                    <Lock size={24} className="text-gray-400" />
                </div>
            )}

            {!isLocked && (
                <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60 uppercase tracking-wider">
                        {badge.rarity}
                    </span>
                </div>
            )}
        </motion.div>
    );
};

const BadgeShowcase = ({ badges, allBadges }) => {
    // Merge user badges with all badges to show locked ones too
    const displayBadges = allBadges.map(badge => {
        const userBadge = badges.find(ub => ub._id === badge._id);
        return {
            ...badge,
            unlockedAt: userBadge ? userBadge.unlockedAt : null
        };
    });

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayBadges.map(badge => (
                <BadgeCard key={badge._id} badge={badge} unlockedAt={badge.unlockedAt} />
            ))}
        </div>
    );
};

export default BadgeShowcase;
