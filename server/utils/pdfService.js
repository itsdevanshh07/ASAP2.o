import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import path from "path";
import fs from "fs";
import os from "os";
import { v2 as cloudinary } from "cloudinary";

const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL || !!process.env.RENDER;

// Helper: get correct Chrome/Edge executable path
const getExecutablePath = async () => {
    // 1. If on Render, try standard system paths first (if buildpack is used), then fallback to sparticuz
    if (process.env.RENDER) {
        const renderPaths = [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.53/chrome-linux64/chrome" // Example path
        ];
        for (const p of renderPaths) {
            if (fs.existsSync(p)) {
                console.log(`✅ Found Render browser executable at: ${p}`);
                return p;
            }
        }
        // Fallback to sparticuz if system chrome not found
        console.log("⚠️ System Chrome not found on Render, trying @sparticuz/chromium...");
    }

    if (isProd) {
        // Vercel / serverless / Render fallback: use sparticuz chromium
        try {
            const execPath = await chromium.executablePath();
            if (execPath) {
                return execPath;
            }
        } catch (e) {
            console.error("Error getting sparticuz executable path:", e);
        }

        // If we are here in prod and haven't returned, we might be in trouble if it's Vercel.
        // But for Render we might have missed a path.
        if (process.env.VERCEL) {
            throw new Error("Chromium executablePath is null on Vercel.");
        }
    }

    // Local dev: allow override via .env
    if (process.env.CHROME_EXECUTABLE_PATH) {
        return process.env.CHROME_EXECUTABLE_PATH;
    }

    // Windows: Check Chrome and Edge
    if (process.platform === "win32") {
        const paths = [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
            "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
        ];

        for (const p of paths) {
            if (fs.existsSync(p)) {
                console.log(`✅ Found browser executable at: ${p}`);
                return p;
            }
        }
    }

    // Common macOS / Linux locations
    const candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }

    throw new Error(
        "Could not find Chrome or Edge executable. Set CHROME_EXECUTABLE_PATH in your .env for local dev."
    );
};

export const generatePdf = async (htmlContent, filename = `resume-${Date.now()}.pdf`) => {
    let browser;
    const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    const tempFilePath = path.join(os.tmpdir(), safeFilename);

    try {
        const executablePath = await getExecutablePath();
        console.log(`🚀 Launching Puppeteer with executable: ${executablePath}`);

        const launchOptions = isProd
            ? {
                args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
                defaultViewport: chromium.defaultViewport,
                executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            }
            : {
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath,
                headless: true,
            };

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        // Avoid hanging forever on networkidle0 if external assets are slow
        await page.setContent(htmlContent, {
            waitUntil: ["domcontentloaded", "networkidle0"],
            timeout: 30_000, // 30s
        });

        await page.pdf({
            path: tempFilePath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "0px",
                right: "0px",
                bottom: "0px",
                left: "0px",
            },
        });

        // Upload to Cloudinary as raw file
        console.log(`☁️ Uploading PDF to Cloudinary: ${safeFilename}`);
        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "raw",
            folder: "resumes",
            public_id: path.parse(safeFilename).name,
            overwrite: true,
        });

        // Clean up temp file
        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {
            console.error("Temp file cleanup error:", e);
        }

        // Return URL to frontend
        return uploadResult.secure_url;
    } catch (error) {
        console.error("PDF Generation Error:", error.message || error);
        console.error(error.stack || "");
        // Clean up if something was written
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                console.error("Cleanup error:", e);
            }
        }
        throw new Error("Failed to generate PDF: " + error.message);
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                console.error("Error closing browser:", e);
            }
        }
    }
};
