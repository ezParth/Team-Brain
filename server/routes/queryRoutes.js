import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { question } = req.body;

  try {
    // Query Pathway for context
    const { data } = await axios.post(`${process.env.PATHWAY_URL}/query`, { question });

    // Call OpenAI to generate answer
    const completion = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful team assistant." },
          { role: "user", content: `Answer using context:\n${JSON.stringify(data.context)}\n\nQ: ${question}` }
        ],
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );

    const answer = completion.data.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default router;
