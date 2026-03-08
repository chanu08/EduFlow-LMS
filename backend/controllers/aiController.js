/**
 * AI Tutor Controller — Google Gemini powered
 *
 * Requires: npm install @google/generative-ai
 * Env var:  GEMINI_API_KEY in backend/.env
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Provider adapter ────────────────────────────────────────────────────────
async function callAIProvider(question, lessonContext) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = lessonContext
        ? `You are a friendly and helpful tutor for an online learning platform called EduFlow.\n\nHere is the current lesson content the student is reading:\n"""\n${lessonContext}\n"""\n\nThe student asks: ${question}\n\nAnswer clearly and concisely, relating your answer to the lesson context where relevant.`
        : `You are a friendly and helpful tutor for an online learning platform called EduFlow.\n\nThe student asks: ${question}\n\nAnswer clearly and concisely.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ─── Route handler ────────────────────────────────────────────────────────────
exports.askAI = async (req, res) => {
    const { question, lessonContext } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: 'question is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    try {
        const answer = await callAIProvider(question.trim(), lessonContext || '');
        return res.json({ answer });
    } catch (err) {
        console.error('Gemini API error:', err.message);
        return res.status(500).json({ error: 'AI service error. Please try again.' });
    }
};
