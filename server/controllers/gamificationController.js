import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';
import UserProgress from '../models/UserProgress.js';
import Credential from '../models/Credential.js';
import { v4 as uuidv4 } from 'uuid';

// --- Helper Functions ---

const calculateLevel = (xp) => {
    // Simple leveling formula: Level = floor(sqrt(XP / 100)) + 1
    // 0 XP = Lvl 1, 100 XP = Lvl 2, 400 XP = Lvl 3, etc.
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const checkAndAwardBadges = async (userId, eventType, data) => {
    // This is a simplified rules engine. In a real app, you might fetch rules from DB.
    // Triggers: 'JOB_APPLY', 'PROFILE_UPDATE', 'STREAK_UPDATE', 'XP_GAIN'

    const badges = await Badge.find({ 'criteria.type': eventType });
    const userProgress = await UserProgress.findOne({ userId });

    const newBadges = [];

    for (const badge of badges) {
        let qualified = false;
        const criteria = badge.criteria;

        // Example Logic
        if (eventType === 'JOB_APPLY') {
            if (criteria.count && userProgress.stats.jobsApplied >= criteria.count) {
                qualified = true;
            }
        } else if (eventType === 'STREAK_UPDATE') {
            if (criteria.days && userProgress.currentStreak >= criteria.days) {
                qualified = true;
            }
        } else if (eventType === 'XP_GAIN') {
            if (criteria.level && userProgress.level >= criteria.level) {
                qualified = true;
            }
        }

        if (qualified) {
            // Check if already owned
            const exists = await UserBadge.findOne({ userId, badgeId: badge._id });
            if (!exists) {
                await UserBadge.create({ userId, badgeId: badge._id });
                newBadges.push(badge);
                // Award XP for badge
                await addXP(userId, badge.xpValue || 10);
            }
        }
    }

    return newBadges;
};

export const addXP = async (userId, amount) => {
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
        progress = await UserProgress.create({ userId });
    }

    progress.xp += amount;
    const newLevel = calculateLevel(progress.xp);

    if (newLevel > progress.level) {
        progress.level = newLevel;
        // Trigger Level Up Badge Check
        await checkAndAwardBadges(userId, 'XP_GAIN', { level: newLevel });
    }

    await progress.save();
    return progress;
};

// --- Controllers ---

// Get User Gamification Profile (Badges, XP, Level)
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.auth.userId; // From Clerk

        // Ensure progress exists
        let progress = await UserProgress.findOne({ userId });
        if (!progress) progress = await UserProgress.create({ userId });

        const badges = await UserBadge.find({ userId }).populate('badgeId');

        res.json({
            success: true,
            progress,
            badges: badges.map(b => ({
                ...b.badgeId.toObject(),
                unlockedAt: b.unlockedAt,
                isNew: b.isNew
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark badges as seen (clear isNew flag)
export const markBadgesSeen = async (req, res) => {
    try {
        const userId = req.auth.userId;
        await UserBadge.updateMany({ userId, isNew: true }, { isNew: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Available Badges (Showcase)
export const getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find({});
        res.json({ success: true, badges });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, period = 'all' } = req.query;
        // Note: For period filtering (weekly/monthly), we'd need a separate XP history table.
        // For now, we return all-time top XP users.

        const leaderboard = await UserProgress.find({})
            .sort({ xp: -1 })
            .limit(Number(limit))
            .populate('userId', 'name image'); // Assuming User model has name/image

        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a Credential (Admin or System triggered)
export const issueCredential = async (req, res) => {
    try {
        const { userId, title, description, skills, expiryDate } = req.body;

        const verificationId = uuidv4();

        const credential = await Credential.create({
            userId,
            title,
            description,
            skills,
            expiryDate,
            verificationId
        });

        res.json({ success: true, credential });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Credential
export const verifyCredential = async (req, res) => {
    try {
        const { verificationId } = req.params;
        const credential = await Credential.findOne({ verificationId }).populate('userId', 'name image');

        if (!credential) {
            return res.status(404).json({ success: false, message: 'Credential not found' });
        }

        res.json({ success: true, credential });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Admin: Create Badge ---
export const createBadge = async (req, res) => {
    try {
        const badge = await Badge.create(req.body);
        res.json({ success: true, badge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Internal: Trigger Event (to be called by other controllers) ---
export const triggerGamificationEvent = async (userId, eventType, data = {}) => {
    try {
        // Update stats based on event
        if (eventType === 'JOB_APPLY') {
            await UserProgress.findOneAndUpdate({ userId }, { $inc: { 'stats.jobsApplied': 1, xp: 10 } });
        }

        // Check for badges
        const newBadges = await checkAndAwardBadges(userId, eventType, data);
        return newBadges;
    } catch (error) {
        console.error('Gamification Error:', error);
    }
};
