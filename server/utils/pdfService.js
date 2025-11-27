// server/utils/pdfService.js

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";
import os from "os";
import { v2 as cloudinary } from "cloudinary";

// Configure chromium for Render / serverless
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

/**
 * Launches a headless Chromium instance compatible with Render.
 */
const launchBrowser = async () => {
  // On Render (and other serverless), always use @sparticuz/chromium
  const executablePath = await chromium.executablePath;

  console.log("🚀 Launching Chromium with executablePath:", executablePath);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });

  return browser;
};

/**
 * Generate a PDF from HTML and upload to Cloudinary.
 * Returns the secure URL of the PDF.
 */
export const generatePdf = async (
  htmlContent,
  filename = `resume-${Date.now()}.pdf`
) => {
  let browser;
  const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  const tempFilePath = path.join(os.tmpdir(), safeFilename);

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 30_000,
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

    // Cleanup temp file
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

