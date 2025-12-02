import Company from "../models/Company.js";
import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

// Register a new company
export const registerCompany = async (req, res) => {

    const { name, email, password } = req.body

    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Details" })
    }

    try {

        const companyExists = await Company.findOne({ email })

        if (companyExists) {
            return res.json({ success: false, message: 'Company already registered' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url
        })

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Login Company
export const loginCompany = async (req, res) => {

    const { email, password } = req.body

    try {

        const company = await Company.findOne({ email })

        if (await bcrypt.compare(password, company.password)) {

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })

        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Company Data
export const getCompanyData = async (req, res) => {

    try {

        const company = req.company

        res.json({ success: true, company })

    } catch (error) {
        res.json({
            success: false, message: error.message
        })
    }

}

// Post New Job
export const postJob = async (req, res) => {

    const { title, description, location, salary, level, category } = req.body

    const companyId = req.company._id

    try {

        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date: Date.now(),
            level,
            category
        })

        await newJob.save()

        res.json({ success: true, newJob })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }


}

// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
    try {

        const companyId = req.company._id

        // Find job applications for the user and populate related data
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image resume')
            .populate('jobId', 'title location category level salary')
            .exec()

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {

        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        // Adding No. of applicants info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id });
            return { ...job.toObject(), applicants: applicants.length }
        }))

        res.json({ success: true, jobsData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Application Status
export const ChangeJobApplicationsStatus = async (req, res) => {

    try {

        const { id, status } = req.body

        // Find Job application and update status
        await JobApplication.findOneAndUpdate({ _id: id }, { status })

        res.json({ success: true, message: 'Status Changed' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Change Job Visiblity
export const changeVisiblity = async (req, res) => {
    try {

        const { id } = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible
        }

        await job.save()

        res.json({ success: true, job })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Company Dashboard Stats
export const getCompanyDashboard = async (req, res) => {
    try {
        const companyId = req.company._id;
        const { limit = 20, jobId, minSalary, maxSalary } = req.query;

        // Build match stage
        const matchStage = {
            companyId: companyId // JobApplication has companyId as ObjectId
        };

        if (jobId) {
            matchStage.jobId = new mongoose.Types.ObjectId(jobId);
        }

        const pipeline = [
            { $match: matchStage },
            // Lookup Job
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            // Lookup User
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            // Apply salary filters (on job.salary)
            {
                $match: {
                    ...(minSalary ? { 'job.salary': { $gte: Number(minSalary) } } : {}),
                    ...(maxSalary ? { 'job.salary': { $lte: Number(maxSalary) } } : {})
                }
            },
            // Facet for Employees List and Summary Stats
            {
                $facet: {
                    employees: [
                        { $sort: { date: -1 } },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                employee_id: '$user._id',
                                employee_name: '$user.name',
                                employee_image: '$user.image',
                                job_title: '$job.title',
                                salary: '$job.salary',
                                status: '$status',
                                applied_at: '$date'
                            }
                        }
                    ],
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalEmployees: { $sum: 1 },
                                totalSalary: { $sum: '$job.salary' },
                                avgSalary: { $avg: '$job.salary' }
                            }
                        }
                    ]
                }
            }
        ];

        const results = await JobApplication.aggregate(pipeline);

        const data = results[0];
        const summary = data.summary[0] || { totalEmployees: 0, totalSalary: 0, avgSalary: 0 };

        res.json({
            success: true,
            employees: data.employees,
            summary: {
                totalEmployees: summary.totalEmployees,
                totalSalary: summary.totalSalary,
                avgSalary: Math.round(summary.avgSalary || 0)
            }
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
    }
};