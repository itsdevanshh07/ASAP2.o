import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
    unlockedAt: { type: Date, default: Date.now },
    isNew: { type: Boolean, default: true } // Used to show "New Badge Unlocked" notification
});

// Prevent duplicate badges for the same user
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

export default UserBadge;
