import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config()

export const askGemini = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }
        if (!apiKey) {
            console.error("Gemini API Key is missing in .env");
            return res.status(500).json({ message: "Server Configuration Error" });
        }

        const prompt = `You are a helpful support assistant for an e-commerce shop called Mack Trading. 
                        Keep your answers short and friendly.
                        
                        Customer Question: ${message}`;

        const apiResponse = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent",
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 150 // Keep answers concise
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                }
            }
        );

        const generatedContent =
            apiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm sorry, I couldn't understand that.";

        res.status(200).json({ reply: generatedContent });

    } catch (error: any) {
        console.error("Gemini API Error:", error.response?.data || error.message);

        res.status(500).json({
            message: "Internal server error while generating text!",
        });
    }
};