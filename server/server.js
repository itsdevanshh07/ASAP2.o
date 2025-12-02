// server.js

// --------------------------------------
// ENV + INSTRUMENTATION
// --------------------------------------
import "dotenv/config";
import "./config/instrument.js";

import express from "express";
import cors from "cors";
import path from "path";
import * as Sentry from "@sentry/node";
import { fileURLToPath } from "url";

// Database + Cloudinary
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";

// Clerk (v4+)
import { clerkMiddleware, requireAuth } from "@clerk/express";

// Routes
import chatRouter from "./routes/chatRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

const app = express();

// --------------------------------------
// PATH HELPERS
// --------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------
// SIMPLE GLOBAL CORS (MUST BE BEFORE ROUTES)
// --------------------------------------
app.use(
  cors({
    origin: true,        // reflect request origin
    credentials: true,   // allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    optionsSuccessStatus: 200,
  })
);

app.options(
  "*",
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    optionsSuccessStatus: 200,
  })
);

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(
    `✅ ${req.method} ${req.path} | Origin: ${req.headers.origin || "no-origin"}`
  );
  next();
});

// --------------------------------------
// INITIALIZE SERVICES (DB, CLOUDINARY)
// --------------------------------------
(async () => {
  try {
    await connectDB();
    await connectCloudinary();
    console.log("✅ Services initialized successfully");
  } catch (error) {
    console.error("❌ Service initialization error:", error);
  }
})();

// --------------------------------------
// BODY PARSERS
// --------------------------------------
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------------------------------
// PUBLIC ROUTES (NO CLERK)
// --------------------------------------
app.get("/", (req, res) => {
  res.send("ASAP Backend running successfully 🚀");
});

// Chat AI route - public
app.use("/api", chatRouter);

// Serve resume files
app.use("/resumes", express.static(path.join(process.cwd(), "resumes")));

// Webhooks
app.post("/webhooks", clerkWebhooks);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
  );
  const hasMongoDB = !!process.env.MONGODB_URI;

  res.json({
    status: "ok",
    services: {
      groq: hasGroqKey ? "configured" : "missing",
      cloudinary: hasCloudinary ? "configured" : "missing",
      mongodb: hasMongoDB ? "configured" : "missing",
    },
    timestamp: new Date().toISOString(),
  });
});

// Sentry test route
app.get("/debug-sentry", function (req, res) {
  throw new Error("Sentry test error");
});

// --------------------------------------
// PUBLIC JOB ROUTES (NO CLERK)
// --------------------------------------
// ✅ Make /api/jobs fully public so it doesn't depend on Clerk
app.use("/api/jobs", jobRoutes);

// --------------------------------------
// CLERK MIDDLEWARE (AFTER PUBLIC ROUTES)
// --------------------------------------
if (!process.env.CLERK_PUBLISHABLE_KEY) {
  console.error("❌ CLERK_PUBLISHABLE_KEY is missing! Set it in env.");
}
if (!process.env.CLERK_SECRET_KEY) {
  console.error("❌ CLERK_SECRET_KEY is missing! Set it in env.");
}

app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

// --------------------------------------
// PROTECTED ROUTES (REQUIRE CLERK AUTH)
// --------------------------------------
// ⬇ company + users remain protected
app.use("/api/company", companyRoutes);
app.use("/api/users", requireAuth(), userRoutes);
app.use("/api/admin", requireAuth(), adminRoutes);
app.use("/api/gamification", gamificationRoutes);

// --------------------------------------
// SENTRY ERROR HANDLER
// --------------------------------------
Sentry.setupExpressErrorHandler(app);

// --------------------------------------
// START SERVER (LOCAL ONLY)
// --------------------------------------
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  const startServer = (port) => {
    const server = app
      .listen(port, () => {
        console.log(`\n===================================`);
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`===================================`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error(
            `⚠️ Port ${port} is already in use. ` +
            `Either stop the other process or set a different PORT in your .env`
          );
        } else {
          console.error("❌ Server error:", err);
        }
      });
  };

  startServer(PORT);
}

// --------------------------------------
// EXPORT FOR VERCEL (SERVERLESS)
// --------------------------------------
export default app;
