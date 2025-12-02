import mongoose from 'mongoose';
import Badge from './models/Badge.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config({ path: './server/.env' });

const seedBadges = async () => {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI ? 'URI Found' : 'URI Missing');
    await connectDB();

    const badges = [
        // Skill Badges
        {
            name: 'JavaScript Master',
            description: 'Demonstrated advanced proficiency in JavaScript.',
            icon: 'zap',
            type: 'SKILL',
            rarity: 'GOLD',
            xpValue: 50,
            criteria: { type: 'SKILL_ASSESSMENT', skill: 'JavaScript', score: 90 }
        },
        {
            name: 'React Developer',
            description: 'Built complex applications using React.',
            icon: 'award',
            type: 'SKILL',
            rarity: 'SILVER',
            xpValue: 30,
            criteria: { type: 'SKILL_ASSESSMENT', skill: 'React', score: 80 }
        },
        // Contribution Badges
        {
            name: 'First Task Completed',
            description: 'Completed your first task on the platform.',
            icon: 'star',
            type: 'CONTRIBUTION',
            rarity: 'BRONZE',
            xpValue: 10,
            criteria: { type: 'TASK_COMPLETE', count: 1 }
        },
        {
            name: '10 Tasks Completed',
            description: 'A dedicated contributor!',
            icon: 'star',
            type: 'CONTRIBUTION',
            rarity: 'SILVER',
            xpValue: 50,
            criteria: { type: 'TASK_COMPLETE', count: 10 }
        },
        // Streak Badges
        {
            name: '7-Day Streak',
            description: 'Logged in for 7 consecutive days.',
            icon: 'flame',
            type: 'STREAK',
            rarity: 'SILVER',
            xpValue: 20,
            criteria: { type: 'STREAK_UPDATE', days: 7 }
        },
        {
            name: '30-Day Streak',
            description: 'A month of consistent learning!',
            icon: 'flame',
            type: 'STREAK',
            rarity: 'GOLD',
            xpValue: 100,
            criteria: { type: 'STREAK_UPDATE', days: 30 }
        },
        // Ranking Badges
        {
            name: 'Top 10 Rank',
            description: 'Reached the top 10 on the weekly leaderboard.',
            icon: 'trophy',
            type: 'RANKING',
            rarity: 'PLATINUM',
            xpValue: 200,
            criteria: { type: 'LEADERBOARD_RANK', rank: 10 }
        },
        // Social Badges
        {
            name: 'Profile Completed',
            description: 'Filled out all profile details.',
            icon: 'shield',
            type: 'SOCIAL',
            rarity: 'BRONZE',
            xpValue: 15,
            criteria: { type: 'PROFILE_UPDATE', complete: true }
        }
    ];

    try {
        await Badge.deleteMany({}); // Clear existing
        await Badge.insertMany(badges);
        console.log('✅ Badges seeded successfully');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding badges:', error);
        process.exit(1);
    }
};

seedBadges();
