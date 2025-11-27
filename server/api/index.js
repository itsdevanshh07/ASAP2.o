// api/index.js - Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database + Cloudinary
import connectDB from '../config/db.js';
import connectCloudinary from '../config/cloudinary.js';

// Clerk
import { clerkMiddleware, requireAuth } from '@clerk/express';

// Routes
import chatRouter from '../routes/chatRoutes.js';
import companyRoutes from '../routes/companyRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import jobRoutes from '../routes/jobRoutes.js';
import { clerkWebhooks } from '../controllers/webhooks.js';

const app = express();

// CORS Configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://client-rbim26nsm-devansh-dhyanis-projects.vercel.app",
];

if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                console.log(`❌ CORS blocked origin: ${origin}`);
                return callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use((req, res, next) => {
    console.log(`✅ Request from origin: ${req.headers.origin || 'no-origin'}`);
    next();
});

app.options("*", cors());

// Initialize services (cached for serverless)
let dbInitialized = false;
let cloudinaryInitialized = false;

async function initializeServices() {
    if (!dbInitialized) {
        try {
            await connectDB();
            dbInitialized = true;
            console.log("✅ MongoDB connected");
        } catch (error) {
            console.error("❌ MongoDB connection error:", error.message);
        }
    }

    if (!cloudinaryInitialized) {
        try {
            await connectCloudinary();
            cloudinaryInitialized = true;
            console.log("✅ Cloudinary connected");
        } catch (error) {
            console.error("❌ Cloudinary connection error:", error.message);
        }
    }
}

// Initialize on first request
app.use(async (req, res, next) => {
    await initializeServices();
    next();
});

// Middleware
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use("/api", chatRouter);
app.post("/webhooks", clerkWebhooks);

// Clerk middleware
app.use(clerkMiddleware());

// Protected routes
app.use("/api/company", companyRoutes);
app.use("/api/users", requireAuth(), userRoutes);
app.use("/api/jobs", jobRoutes);

// Root endpoint
app.get("/", (req, res) => {
    res.send("ASAP Backend running successfully 🚀");
});

// Health check
app.get("/api/health", (req, res) => {
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
    const hasMongoDB = !!process.env.MONGODB_URI;

    res.json({
        status: "ok",
        services: {
            groq: hasGroqKey ? "configured" : "missing",
            cloudinary: hasCloudinary ? "configured" : "missing",
            mongodb: hasMongoDB ? "configured" : "missing"
        },
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
});

export default app;
