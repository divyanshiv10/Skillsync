import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());
const analyzeResume = async (resume, jobDescription) => {
    const userQuery = `
        Analyze the following resume against the provided job description.
        Provide a detailed analysis in JSON format. The JSON object must contain:
        1. "score": An integer between 0 and 100 representing the compatibility score.
        2. "feedback": A concise paragraph explaining the score and giving actionable advice for improvement.
        3. "missingKeywords": An array of the top 10 most important keywords or skills from the job description that are missing in the resume.

        --- RESUME TEXT ---
        ${resume}

        --- JOB DESCRIPTION TEXT ---
        ${jobDescription}
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found on the server. Please check your .env file.");
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    score: { type: "NUMBER" },
                    feedback: { type: "STRING" },
                    missingKeywords: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["score", "feedback", "missingKeywords"]
            }
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google AI API request failed: ${errorText}`);
    }

    return response.json();
};
const chatWithCoach = async (userQuery, analysisResult) => {
    const systemPrompt = `You are an expert career coach. The user's resume analysis is: ${JSON.stringify(analysisResult)}. Your response must be formatted using simple HTML tags like <strong> for bolding and <ul><li> for bullet points.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found on the server. Please check your .env file.");
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google AI API request failed: ${errorText}`);
    }

    return response.json();
};
app.post('/api/analyze', async (req, res) => {
    try {
        const { resume, jobDescription } = req.body;
        if (!resume || !jobDescription) {
            return res.status(400).json({ error: 'Resume and job description are required.' });
        }
        const result = await analyzeResume(resume, jobDescription);
        res.json(result);
    } catch (error) {
        console.error('Error in /api/analyze:', error.message);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});
app.post('/api/chat', async (req, res) => {
    try {
        const { userQuery, analysisResult } = req.body;
        if (!userQuery || !analysisResult) {
            return res.status(400).json({ error: 'User query and analysis result are required.' });
        }
        const result = await chatWithCoach(userQuery, analysisResult);
        res.json(result);
    } catch (error) {
        console.error('Error in /api/chat:', error.message);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});
app.listen(port, () => {
    console.log(`✅ Secure server is running successfully on http://localhost:${port}`);
});
