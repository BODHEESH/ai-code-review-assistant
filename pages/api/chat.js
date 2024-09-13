// pages/api/chat.js

import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { question, isCodeReview, language, description } = req.body;

        try {
            let systemMessage = "You are a helpful assistant that responds concisely to the user.";
            let userMessage = question;

            if (isCodeReview) {
                systemMessage = "You are an experienced software engineer providing detailed code reviews.";
                userMessage = `Language: ${language}\nDescription: ${description}\n\nCode to review:\n${question}\n\nPlease provide a detailed code review, including suggestions for improvements, potential bugs, and optimizations.`;
            }

            const response = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    {
                        role: "user",
                        content: userMessage,
                    },
                ],
                model: "llama3-8b-8192",
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
            });

            const assistantMessage = response.choices[0]?.message?.content || "No response received";
            res.status(200).json({ message: assistantMessage });
        } catch (error) {
            console.error('Error fetching from Groq API:', error);
            res.status(500).json({ error: 'Failed to get assistant response' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}