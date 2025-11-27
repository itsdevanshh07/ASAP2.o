import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import os from "os";
import { v2 as cloudinary } from "cloudinary";

export const generatePdf = async (htmlContent, filename = `resume-${Date.now()}.pdf`) => {
    let browser;
    const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    const tempFilePath = path.join(os.tmpdir(), safeFilename);

    try {
        console.log("🚀 Launching Puppeteer...");
        
        // Launch standard puppeteer
        // --no-sandbox is required for Render
        // --disable-dev-shm-usage helps prevent crashes in low-memory containers
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        });

        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: ["domcontentloaded", "networkidle0"],
            timeout: 30000
        });

        await page.pdf({
            path: tempFilePath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "0px",
                right: "0px",
                bottom: "0px",
                left: "0px"
            }
        });

        console.log(`☁️ Uploading PDF to Cloudinary: ${safeFilename}`);
        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "raw",
            folder: "resumes",
            public_id: path.parse(safeFilename).name,
            overwrite: true
        });

        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {
            console.error("Temp file cleanup error:", e);
        }

        return uploadResult.secure_url;
    } catch (error) {
        console.error("PDF Generation Error:", error.message || error);
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {}
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

