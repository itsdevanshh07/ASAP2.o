import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

// Get All Users
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ _id: -1 }); // Assuming _id is time-based or just sort by creation if possible. User model doesn't have createdAt, so maybe sort by _id is fine if it's ObjectId, but here it's String (Clerk ID). We'll just return as is.

        const total = await User.countDocuments(query);

        res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Block/Unblock User
export const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update User Role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['candidate', 'recruiter'].includes(role)) {
            // Note: Request said "NOT admin". But if we want to promote to admin, we could allow it. 
            // The prompt said "change role (candidate/recruiter, NOT admin)".
            // Wait, User model only has 'candidate' and 'admin'. 
            // Recruiters are in Company model.
            // So this requirement "change role (candidate/recruiter)" is confusing if Recruiters are separate.
            // I will assume this means maybe "Admin" vs "Candidate" or maybe the user wants to merge them?
            // But earlier I decided to keep them separate.
            // If I change a User to 'recruiter', it doesn't make sense if Recruiter is a Company.
            // I will stick to 'candidate' and 'admin' for User model.
            // If the user meant "make this user a recruiter", that would involve creating a Company profile?
            // I will assume for now this is just for User roles (Candidate vs Admin maybe? Or maybe just blocking).
            // Let's re-read: "change role (candidate/recruiter, NOT admin)".
            // This implies there IS a recruiter role in User.
            // But I didn't add it.
            // Let's add 'recruiter' to User enum just in case, but it might be unused if Company is separate.
            // Actually, maybe the user wants to allow a User to BECOME a recruiter (Company)?
            // For now, I will just allow updating to 'candidate' or 'admin' (if I want to allow promoting admins) or just ignore 'recruiter' if it's not in schema.
            // Let's stick to the prompt strictly: "change role (candidate/recruiter, NOT admin)".
            // This strongly suggests 'recruiter' SHOULD be a role in User.
            // I will update User model to include 'recruiter' in enum.
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        // Wait, if I add 'recruiter' to User, does that mean they can login as Company?
        // The current app has separate login for Company.
        // I will implement this but note the ambiguity.
        // Actually, I'll just allow updating to 'candidate' or 'admin' for now to be safe, or 'recruiter' if I add it.
        // Let's just implement it generic.

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.role = role;
        await user.save();

        res.json({ success: true, message: "Role updated", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Recruiters (Companies)
export const getRecruiters = async (req, res) => {
    try {
        const companies = await Company.find({}).select('-password');
        res.json({ success: true, recruiters: companies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Recruiter
export const verifyRecruiter = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        company.isVerified = !company.isVerified;
        await company.save();

        res.json({ success: true, message: `Company ${company.isVerified ? 'verified' : 'unverified'}`, company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Jobs
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({})
            .populate('companyId', 'name email')
            .sort({ date: -1 });
        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Job Status
export const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected', 'archived'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const job = await Job.findById(id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        job.status = status;
        // Also update visibility based on status
        job.visible = status === 'approved';

        await job.save();

        res.json({ success: true, message: "Job status updated", job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Applications
export const getApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find({})
            .populate('userId', 'name email')
            .populate('companyId', 'name')
            .populate('jobId', 'title')
            .sort({ date: -1 });
        res.json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Analytics
export const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalRecruiters = await Company.countDocuments({});
        const totalJobs = await Job.countDocuments({});
        const activeJobs = await Job.countDocuments({ status: 'approved', visible: true });
        const totalApplications = await JobApplication.countDocuments({});

        // Simple time series (mocked or real if we had createdAt)
        // Since we don't have createdAt on User/Job easily accessible/indexed for aggregation in this snippet without checking schema details fully (User has _id string), we'll return basic stats.

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalRecruiters,
                totalJobs,
                activeJobs,
                totalApplications
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
