import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from environment variables.");
  }
  return new Groq({ apiKey });
};

// Candidate models in preference order (with fallbacks if a model is decommissioned or unavailable)
const SUPPORTED_MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b'
].filter(Boolean);

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const groq = getGroqClient();

    // Highly engineered system prompt
    let systemPrompt = `You are SpecPedia AI, an expert product specification assistant. 
    1. Format all responses using clean Markdown. Use bolding for product names and key metrics. Use bullet points for lists.
    2. If comparing, create a clear side-by-side breakdown, followed by a "### Final Verdict" section recommending which is better.
    3. If asked about a product NOT in the provided context, use your general knowledge, but explicitly state: "Note: This product is not in the SpecPedia database. Specs are estimated from global data." Do not make up fake specs.`;
    
    if (context && context.name) {
      systemPrompt += `\nThe user is currently viewing: ${context.name}. Database Specs: ${JSON.stringify(context.specs)}. Price: ₹${context.price}.`;
    }

    console.log(`Sending to Groq: "${message}"`);

    // Try primary and fallback models to prevent downtime if one model is decommissioned or rate-limited
    const modelsToTry = [...new Set(SUPPORTED_MODELS)];
    let chatCompletion = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          model,
          temperature: 0.4,
          max_tokens: 800,
        });
        console.log(`Groq response generated using model: ${model}`);
        break;
      } catch (err) {
        console.warn(`Model ${model} failed: ${err.message}. Trying next candidate...`);
        lastError = err;
      }
    }

    if (!chatCompletion) {
      throw lastError || new Error("No Groq model was able to respond.");
    }

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
    res.json({ reply: aiResponse });

  } catch (error) {
    console.error("=== GROQ API ERROR ===");
    console.error(error.message);
    if (error.error) console.error(error.error);
    res.status(500).json({ error: error.message || "Failed to fetch AI response" });
  }
});

export default router;