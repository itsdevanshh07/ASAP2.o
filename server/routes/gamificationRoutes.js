import express from 'express';
import {
    getUserProfile,
    getAllBadges,
    getLeaderboard,
    markBadgesSeen,
    verifyCredential,
    createBadge,
    issueCredential
} from '../controllers/gamificationController.js';
// Assuming you have a clerk auth middleware similar to protectCompany but for users
// For now, I'll assume a generic 'protectUser' middleware exists or I'll use a placeholder
import { protectCompany } from '../middleware/authMiddleware.js';

// Placeholder for user auth middleware - replace with actual Clerk middleware
const protectUser = (req, res, next) => {
    // This should verify Clerk token and set req.auth.userId
    // For now, passing through if not implemented elsewhere
    // In a real scenario, import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
    next();
};

const router = express.Router();

// Public
router.get('/badges', getAllBadges);
router.get('/leaderboard', getLeaderboard);
router.get('/credential/verify/:verificationId', verifyCredential);

// Protected (User)
router.get('/profile', protectUser, getUserProfile);
router.post('/badges/seen', protectUser, markBadgesSeen);

// Admin (Protected) - reusing protectCompany for now as "Admin" check, or add specific admin middleware
router.post('/admin/badges', protectCompany, createBadge);
router.post('/admin/issue-credential', protectCompany, issueCredential);

export default router;
