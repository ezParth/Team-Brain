// ./controllers/gpt.controller.ts
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { GroupModel } from "../models/group.model"; // Adjust path as needed
import OpenAI from "openai";
import axios from "axios";
import { CohereClient } from "cohere-ai";

dotenv.config();

// ✅ OpenAI v4 initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ✅ Cohere initialization
// const cohere = new CohereClient({
//   apiKey: process.env.COHERE_API_KEY!,
// });

// Main function
export const askGroupQuestion = async (req: Request, res: Response) => {
  console.log("Hitting ask question");
  const { user, groupName, question } = req.body;

  try {
    if (!user || !groupName || !question) {
      return res.status(400).json({ success: false, error: "Missing fields." });
    }

    const group = await GroupModel.findOne({ groupName });
    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found." });
    }

    const context = group.messages
      .map((msg) => `${msg.sender}: ${msg.message}`)
      .join("\n");

    const prompt = `${context}\n\nQuestion: ${question}\nAnswer:`;

    // Try multiple AI models in sequence
    // const aiFunctions = [askCohere, askClaude];
    const aiFunctions = [askCohere];
    let answer = "";

    for (const fn of aiFunctions) {
      try {
        answer = await fn(prompt);
        if (answer) break; // stop at the first successful response
        console.log("Answer -> ", answer)
      } catch (err: any) {
        console.error(`${fn.name} failed:`, err.message);
      }
    }

    if (!answer) {
      return res.status(500).json({
        success: false,
        error: "All AI models failed to generate a response.",
      });
    }

    return res.status(200).json({ success: true, messages: answer });
  } catch (err: any) {
    console.error("Unexpected error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ===== AI MODEL FUNCTIONS =====

// OpenAI
const askOpenAI = async (prompt: string): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    max_tokens: 150,
    temperature: 0.7,
  });
  return response.choices?.[0]?.message?.content?.trim() || "";
};

// Gemini
export const askGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const headers = { "Content-Type": "application/json" };

  const response = await axios.post(url, body, { headers });
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
};

// Cohere


const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

const askCohere = async (prompt: string): Promise<string> => {
  const response = await cohere.chat({
    model: "command-xlarge-nightly", // latest chat model
    message: prompt,
    maxTokens: 150,
    temperature: 0.7,
  });

  // The chat API returns an array of messages in 'response.choices'
  console.log("res -> ", response)
  console.log("res -> ", response.text)
  return response.text ?? "ERROR IN ASK COHERE";
  // return response.choices?.[0]?.message?.content ?? "ERROR IN ASK COHERE";
};


// const askCohere = async (prompt: string): Promise<string> => {
//   const response = await cohere.generate({
//     model: "command-xlarge",
//     prompt,
//     max_tokens: 150,
//     temperature: 0.7,
//   });
//   return response.body.generations[0].text.trim();
// };

// Claude (Anthropic)
const askClaude = async (prompt: string): Promise<string> => {
  const res = await axios.post(
    "https://api.anthropic.com/v1/complete",
    {
      model: "claude-3",
      prompt: `Human: ${prompt}\nAssistant:`,
      max_tokens_to_sample: 150,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.completion.trim();
};



/*

Hitting ask question
askCohere failed: NotFoundError
Status code: 404
Body: {
  "id": "2adc629b-c246-4c22-a3e8-64eed570b3d7",
  "message": "Generate API was removed on September 15 2025. Please migrate to Chat API. See https://docs.cohere.com/docs/migrating-from-cogenerate-to-cochat for details."
}
askClaude failed: Request failed with status code 401


*/