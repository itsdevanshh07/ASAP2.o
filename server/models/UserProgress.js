import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now },
    stats: {
        jobsApplied: { type: Number, default: 0 },
        profileCompleted: { type: Boolean, default: false },
        resumeUploaded: { type: Boolean, default: false },
        assessmentsPassed: { type: Number, default: 0 }
    }
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
