import express from 'express';
import {
    getUsers,
    blockUser,
    updateUserRole,
    getRecruiters,
    verifyRecruiter,
    getJobs,
    updateJobStatus,
    getApplications,
    getAnalytics
} from '../controllers/adminController.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Apply isAdmin middleware to all routes in this router
router.use(isAdmin);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/role', updateUserRole);

// Recruiter Management
router.get('/recruiters', getRecruiters);
router.patch('/recruiters/:id/verify', verifyRecruiter);

// Job Management
router.get('/jobs', getJobs);
router.patch('/jobs/:id/status', updateJobStatus);

// Application Management
router.get('/applications', getApplications);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
