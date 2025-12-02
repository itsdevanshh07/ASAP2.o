import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import path from "path";
import fs from "fs";
import os from "os";
import { v2 as cloudinary } from "cloudinary";

// Helper to find local Chrome on Windows/Mac/Linux
const getLocalExecutablePath = () => {
    const platform = process.platform;
    if (platform === "win32") {
        const paths = [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
            "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        ];
        return paths.find((p) => fs.existsSync(p));
    } else if (platform === "darwin") {
        return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    } else {
        // Linux local (not Render)
        return "/usr/bin/google-chrome";
    }
};

export const generatePdf = async (
    htmlContent,
    filename = `resume-${Date.now()}.pdf`
) => {
    let browser;
    const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    const tempFilePath = path.join(os.tmpdir(), safeFilename);

    try {
        console.log("🚀 Launching Puppeteer...");

        let executablePath;
        let args;

        // Check if running on Render or Production
        if (process.env.RENDER || process.env.NODE_ENV === "production") {
            console.log("🌍 Running in Production/Render environment");
            // Configure sparticuz/chromium
            // It might need more memory, so we disable shm usage
            executablePath = await chromium.executablePath();
            args = chromium.args;
        } else {
            console.log("💻 Running in Local environment");
            executablePath = getLocalExecutablePath();
            if (!executablePath) {
                throw new Error(
                    "Local Chrome/Edge executable not found. Please set CHROME_EXECUTABLE_PATH env var or install Chrome."
                );
            }
            args = ["--no-sandbox", "--disable-setuid-sandbox"];
        }

        console.log(`Using executable: ${executablePath}`);

        browser = await puppeteer.launch({
            args: [...args, "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: ["domcontentloaded", "networkidle0"],
            timeout: 30000,
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

        console.log(`☁️ Uploading PDF to Cloudinary: ${safeFilename}`);
        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "raw",
            folder: "resumes",
            public_id: path.parse(safeFilename).name,
            overwrite: true,
        });

        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {
            console.error("Temp file cleanup error:", e);
        }

        return uploadResult.secure_url;
    } catch (error) {
        console.error("PDF Generation Error:", error.message || error);
        console.error(error.stack || "");
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
