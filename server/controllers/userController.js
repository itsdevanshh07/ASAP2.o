import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"
import { triggerGamificationEvent } from "./gamificationController.js"

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        let user = await User.findById(userId)

        if (!user) {
            // Attempt to sync from Clerk
            try {
                const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const clerkUser = await response.json();
                    const userData = {
                        _id: clerkUser.id,
                        name: `${clerkUser.first_name} ${clerkUser.last_name}`,
                        email: clerkUser.email_addresses[0].email_address,
                        image: clerkUser.image_url,
                        role: 'candidate' // Default role
                    };
                    user = await User.create(userData);
                    console.log(`User synced from Clerk: ${user.email}`);
                } else {
                    return res.json({ success: false, message: 'User Not Found and Sync Failed' });
                }
            } catch (syncError) {
                console.error("Sync Error:", syncError);
                return res.json({ success: false, message: 'User Not Found' });
            }
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Apply For Job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body

    try {
        const userId = req.auth.userId

        const isAlreadyApplied = await JobApplication.find({ jobId, userId })

        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: 'Already Applied' })
        }

        const jobData = await Job.findById(jobId)

        if (!jobData) {
            return res.json({ success: false, message: 'Job Not Found' })
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })

        // Trigger Gamification Event
        triggerGamificationEvent(userId, 'JOB_APPLY', { jobId });

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {

        const userId = req.auth.userId

        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary')
            .exec()

        if (!applications) {
            return res.json({ success: false, message: 'No job applications found for this user.' })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.auth.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        // Trigger Gamification Event
        triggerGamificationEvent(userId, 'PROFILE_UPDATE', { resume: true });

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}