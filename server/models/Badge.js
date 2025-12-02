import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // URL or lucide-react icon name
    type: {
        type: String,
        enum: ['SKILL', 'CONTRIBUTION', 'RANKING', 'STREAK', 'SOCIAL', 'CAREER', 'SPECIAL'],
        required: true
    },
    rarity: {
        type: String,
        enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'],
        default: 'BRONZE'
    },
    criteria: { type: Object }, // JSON object defining trigger conditions
    xpValue: { type: Number, default: 10 },
    createdAt: { type: Date, default: Date.now }
});

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
