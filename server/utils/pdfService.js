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

        // Launch standard puppeteer. 
        // We use --no-sandbox which is required for Render/Docker environments.
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        // Set content and wait for network to be idle
        await page.setContent(htmlContent, {
            waitUntil: ["domcontentloaded", "networkidle0"],
            timeout: 30_000, // 30s timeout
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

        // Upload to Cloudinary
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

        return uploadResult.secure_url;

    } catch (error) {
        console.error("PDF Generation Error:", error);
        // Clean up if something was written
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {}
        }
        throw new Error("Failed to generate PDF: " + error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};



