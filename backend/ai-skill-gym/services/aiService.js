const axios = require('axios');

// select which provider to call: 'ollama' | 'openai' | 'groq' | 'mock'
const AI_PROVIDER = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

// ollama configuration (default)
const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral'; // Or 'neural-chat', 'llama2', etc.

// openai configuration
let openai;
if (AI_PROVIDER === 'openai') {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// groq configuration
let groq;
if (AI_PROVIDER === 'groq') {
  const Groq = require('groq-sdk');
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_API_BASE_URL || undefined,
    timeout: Number(process.env.GROQ_TIMEOUT || 120000),
  });
}

const promptCache = new Map();
const cacheEnabled = process.env.GROQ_CACHE_ENABLED === 'true';

const critiquePrompt = (userPrompt, exerciseContext) => `You are an expert prompt engineering teacher. A student has submitted the following prompt for this exercise:\n\nExercise Context: ${exerciseContext}\n\nStudent's Prompt:\n"${userPrompt}"\n\nProvide your critique in this exact JSON format:\n{\n  "critique": "2-3 sentence critique of what's working and what could improve",\n  "improvedPrompt": "Your improved version of the prompt",\n  "explanation": "Bullet-point explanation of why your version is better (2-3 points)",\n  "score": 7\n}\n\nFocus on clarity, specificity, and prompt engineering best practices. Return ONLY valid JSON, no other text.`;

const generateCritique = async (userPrompt, exerciseContext) => {
  try {
    const prompt = critiquePrompt(userPrompt, exerciseContext);

    let content;

    if (AI_PROVIDER === 'openai') {
      // call the OpenAI chat completions API (v4)
      const systemMessage = {
        role: 'system',
        content: 'You are an expert prompt engineering teacher who returns only valid JSON and strictly follows output format instructions.',
      };
      const userMessage = {
        role: 'user',
        content: prompt,
      };

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [systemMessage, userMessage],
        max_tokens: 500,
        temperature: 0.7,
      });
      content = response.choices?.[0]?.message?.content || '';
    } else if (AI_PROVIDER === 'groq') {
      const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
      const temperature = Number(process.env.GROQ_TEMPERATURE ?? 0.7);
      const top_p = Number(process.env.GROQ_TOP_P ?? 0.95);
      const max_tokens = Number(process.env.GROQ_MAX_TOKENS ?? 500);

      const systemMessage = {
        role: 'system',
        content: 'You are an expert prompt engineering teacher who returns only valid JSON and strictly follows output format instructions.',
      };
      const userMessage = {
        role: 'user',
        content: prompt,
      };

      const cacheKey = `${model}:${temperature}:${top_p}:${max_tokens}:${userPrompt}:${exerciseContext}`;
      if (cacheEnabled && promptCache.has(cacheKey)) {
        content = promptCache.get(cacheKey);
      } else {
        const response = await groq.chat.completions.create({
          model,
          messages: [systemMessage, userMessage],
          temperature,
          top_p,
          max_tokens,
          stream: false,
        });

        content = response.choices?.[0]?.message?.content || '';
        if (cacheEnabled && content) {
          promptCache.set(cacheKey, content);
        }
      }
    } else if (AI_PROVIDER === 'ollama') {
      const response = await axios.post(OLLAMA_API, {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      });
      content = response.data.response;
    } else {
      // if unknown provider just throw and hit fallback
      throw new Error(`Unsupported AI_PROVIDER: ${AI_PROVIDER}`);
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Ensure all required fields exist
    return {
      critique: result.critique || 'Good attempt at structuring your prompt.',
      improvedPrompt: result.improvedPrompt || userPrompt,
      explanation: result.explanation || 'This version is more specific and structured.',
      score: result.score || 6,
    };
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Return a fallback response if the provider fails or is unreachable
    return {
      critique: 'Your prompt shows good intent. Consider being more specific about the desired output format and context.',
      improvedPrompt: `${userPrompt.trim()}\n\nProvide the response in a clear, structured format.`,
      explanation: `Your prompt could improve by:\n• Being more specific about the expected output\n• Adding context about who the AI should be\n• Including examples of desired format`,
      score: 5,
    };
  }
};

module.exports = { generateCritique };
