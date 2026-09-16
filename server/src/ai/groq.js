import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SUPPORTED_MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'qwen/qwen3-32b',
  'openai/gpt-oss-20b',
].filter(Boolean);

export async function callWithFallback(messages, options = {}) {
  const { temperature = 0.4, max_tokens = 800, onMeta, ...rest } = options;
  const modelsToTry = [...new Set(SUPPORTED_MODELS)];
  let chatCompletion = null;
  let lastError = null;
  let usedModel = null;

  for (const model of modelsToTry) {
    try {
      chatCompletion = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens,
        ...rest,
      });
      usedModel = model;
      console.log(`Groq response generated using model: ${model}`);
      break;
    } catch (err) {
      console.warn(`Model ${model} failed: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  if (!chatCompletion) {
    throw lastError || new Error('No Groq model was able to respond.');
  }

  const content = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
  const approxTokens =
    chatCompletion.usage?.total_tokens ||
    Math.ceil((content.length + JSON.stringify(messages).length) / 4);

  if (typeof onMeta === 'function') {
    onMeta({ model: usedModel, tokens: approxTokens });
  }

  return content;
}

export async function streamWithFallback(messages, options = {}) {
  const { temperature = 0.4, max_tokens = 800, ...rest } = options;
  const modelsToTry = [...new Set(SUPPORTED_MODELS)];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const stream = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens,
        stream: true,
        ...rest,
      });
      console.log(`Groq streaming initialized using model: ${model}`);
      return { stream, model };
    } catch (err) {
      console.warn(`Model ${model} streaming failed: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error('No Groq model was able to stream.');
}

