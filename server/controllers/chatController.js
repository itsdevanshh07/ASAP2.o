import { generateChatResponse, generateResume } from "../utils/aiService.js";
import { getFallbackResponse } from "../utils/fallbackService.js";
import { getTemplateHtml } from "../utils/resumeTemplates.js";
import { generatePdf } from "../utils/pdfService.js";

export const chatWithAI = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // Attempt to get response from AI
        const reply = await generateChatResponse(message, history);
        return res.json({ reply });
    } catch (error) {
        console.error("AI Chat Failed, switching to fallback:");
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            status: error.status,
            type: error.constructor.name
        });

        // Fallback mechanism
        const fallbackReply = getFallbackResponse(message);
        return res.json({
            reply: fallbackReply,
            meta: { source: "fallback", error: error.message }
        });
    }
};

export const createResume = async (req, res) => {
    const { userNotes, template = 'combination' } = req.body;

    if (!userNotes) {
        return res.status(400).json({ error: "User notes or description required" });
    }

    try {
        // 1. Get structured data from AI
        const resumeData = await generateResume(userNotes);

        // 2. Generate HTML based on template
        const html = getTemplateHtml(resumeData, template);

        // 3. Generate PDF
        const filename = `resume_${Date.now()}.pdf`;
        const pdfUrl = await generatePdf(html, filename);

        return res.json({
            resume: resumeData,
            pdfUrl: pdfUrl
        });
    } catch (error) {
        console.error("Resume Generation Failed:", error.message);
        return res.status(503).json({
            error: "Resume builder service is currently unavailable. Please try again later.",
            details: error.message,
            code: error.error?.code || "UNKNOWN",
            type: error.error?.type || "UNKNOWN"
        });
    }
};
