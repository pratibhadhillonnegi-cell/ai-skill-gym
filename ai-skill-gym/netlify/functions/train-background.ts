import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { challenge, userPrompt, jobId, idempotencyKey } = await req.json();

    if (!challenge || !userPrompt || !jobId || !idempotencyKey) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const store = getStore("evaluations");

    // Idempotency Check: if this exact request was already evaluated, skip it
    const existingJob = await store.get(jobId, { type: 'json' });
    if (existingJob) {
      console.log(`[TRAIN] Job ${jobId} already exists (Idempotent replay)`);
      return new Response(JSON.stringify({ success: true, jobId }), { status: 202 });
    }

    // Per-user job limit (Guardrail against queue spam)
    // In production, we'd query an index of active jobs. Here we simulate the block.
    // E.g., if a user submits > 5 pending jobs rapidly, we reject them.
    const userJobCountKey = `user_jobs_${idempotencyKey.split('_')[0] || 'default'}`;
    let userActiveJobs = await store.get(userJobCountKey, { type: 'json' }) || { count: 0, timestamp: Date.now() };
    
    // Reset counter every hour
    if (Date.now() - userActiveJobs.timestamp > 3600000) userActiveJobs = { count: 0, timestamp: Date.now() };
    
    if (userActiveJobs.count > 10) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Too many active evaluations.' }), { status: 429 });
    }

    userActiveJobs.count++;
    await store.setJSON(userJobCountKey, userActiveJobs);

    // Mark job as processing
    await store.setJSON(jobId, { 
        status: 'processing', 
        timestamp: Date.now(),
        expectedDuration: 30000 // 30 seconds expected
    });

    // The actual background evaluation (we do NOT await this in the response cycle
    // if it were a true background function, but for local netlify dev compatibility 
    // without `-background` suffix complexities, we process it async if we can, or just await it.
    // However, to satisfy the architecture constraints, we will await it here and rely on 
    // the Netlify Function timeout (10s default), knowing the frontend will fallback if it drops.
    // Wait, since this is a simulated background process for robust architecture:
    
    // We will kick off the processing Promise without awaiting it to return 202 immediately.
    // Note: In standard Netlify serverless functions, the function dies when the response is returned.
    // For true background execution, the file must be named `-background.ts` or `_background.ts`.
    // Since we are configuring the path manually, we will just await it here but the client will poll.
    // Actually, to make it a TRUE background function on Netlify, we return immediately 
    // and let Netlify handle the promise if we are using the correct naming convention.
    
    // We'll await it to ensure it runs correctly in `netlify dev`.
    
    const systemPrompt = `You are an expert prompt engineering teacher. A student submitted the following prompt for the challenge: "${challenge}"
    
Student's Prompt:
"${userPrompt}"

Provide your critique in this EXACT JSON format:
{
  "critique": "2-3 sentence critique of what's working and what could improve",
  "improvedPrompt": "Your improved version of the prompt",
  "explanation": "Bullet-point explanation of why your version is better",
  "score": 7
}

Return ONLY valid JSON. No markdown ticks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    let parsedResult;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      parsedResult = {
        critique: "Failed to parse evaluation.",
        improvedPrompt: userPrompt,
        explanation: "System error during evaluation parsing.",
        score: 5
      };
    }

    // Save the final result
    await store.setJSON(jobId, { 
      status: 'complete', 
      result: parsedResult,
      timestamp: Date.now() 
    });

    return new Response(JSON.stringify({ success: true, jobId }), { status: 202 });

  } catch (error) {
    console.error('[TRAIN ERROR]', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/train"
};
