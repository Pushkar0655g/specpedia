import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Highly engineered system prompt
    let systemPrompt = `You are SpecPedia AI, an expert product specification assistant. 
    1. Format all responses using clean Markdown. Use bolding for product names and key metrics. Use bullet points for lists.
    2. If comparing, create a clear side-by-side breakdown, followed by a "### Final Verdict" section recommending which is better.
    3. If asked about a product NOT in the provided context, use your general knowledge, but explicitly state: "Note: This product is not in the SpecPedia database. Specs are estimated from global data." Do not make up fake specs.`;
    
    if (context && context.name) {
      systemPrompt += `\nThe user is currently viewing: ${context.name}. Database Specs: ${JSON.stringify(context.specs)}. Price: ₹${context.price}.`;
    }

    console.log(`Sending to Groq: "${message}"`);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant", 
      temperature: 0.4, // Lower temperature = more factual, less creative/hallucinating
      max_tokens: 800,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
    res.json({ reply: aiResponse });

  } catch (error) {
    console.error("=== GROQ API ERROR ===");
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

export default router;