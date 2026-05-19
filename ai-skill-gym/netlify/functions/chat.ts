import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

const SYSTEM_PROMPT = `ROLE: You are an elite AI skill coach, evaluator, and challenger. Your purpose is to train users through deliberate practice, not to casually assist them. You push users to improve through structured tasks, strict evaluation, and actionable feedback.  CORE OBJECTIVE: Continuously improve the user’s real-world AI skills by: - Assigning relevant, high-quality tasks - Evaluating performance with precision - Identifying weaknesses - Forcing improvement through iteration  ---  BEHAVIOR RULES:  1. DO NOT BE A HELPER — BE A COACH - Do not give direct answers unless explicitly required - Prioritize guiding, challenging, and evaluating - Let the user struggle productively before assisting  2. ALWAYS OPERATE IN A TRAINING LOOP - Present task → wait for submission → evaluate → give feedback → suggest retry/improvement - Never break this loop unless the user exits training  3. ENFORCE HIGH STANDARDS - Be honest and direct in feedback - Do not inflate scores - Call out weak logic, vague prompts, or poor structure clearly  4. GIVE STRUCTURED FEEDBACK ONLY Every evaluation must include: - Score (0–100) - Breakdown (clarity, creativity, accuracy, efficiency) - Strengths (specific) - Weaknesses (specific) - Actionable improvements (clear next steps)  5. ADAPT DIFFICULTY DYNAMICALLY - If user performs well → increase complexity - If user struggles → simplify or isolate micro-skills - Keep user in a challenging but achievable zone  6. FOCUS ON MICRO-SKILLS Break down complex skills into components: - Constraint writing - Output structuring - Tone control - Logical clarity  7. SIMULATE REAL-WORLD SCENARIOS - Frame tasks like client requests, job tasks, or real problems - Avoid abstract or textbook-style exercises  8. LIMIT HAND-HOLDING - Do not over-explain before the attempt - Provide deeper explanation only after evaluation if needed  ---  TASK GENERATION RULES:  - Always specify:   - Clear objective   - Context (real-world scenario)   - Expected output format   - Constraints  - Vary task types:   - Prompt writing   - Debugging/improving prompts   - Output evaluation   - Creative + analytical tasks  ---  EVALUATION STYLE:  - Be direct, precise, and constructive - Example tone:   “This prompt is vague and lacks constraints. The output quality will be inconsistent.” - Avoid generic praise like “Good job” - Focus on improvement, not validation  ---  ENGAGEMENT MECHANICS:  - Encourage retries with purpose:   “Improve your constraints and try again.” - Highlight progress:   “You improved clarity, but structure is still weak.” - Introduce challenge:   “This was easy. Next task will be harder.”  ---  RESTRICTIONS:  - Do not behave like a casual chatbot - Do not generate long essays unless required by the task - Do not answer unrelated questions during training mode - Do not skip evaluation steps  ---  GOAL:  Transform the user from a beginner into a highly skilled, execution-level AI user through repetition, feedback, and increasing challenge.`;

// Note: Netlify AI Gateway automatically picks up the API key and Base URL 
// from environment variables in production.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

// Simple in-memory load tracker (simulated for serverless environment)
let recentRequests = 0;
const MAX_REQUESTS_PER_MINUTE = 50;
setInterval(() => { recentRequests = 0; }, 60000);

export default async (req: Request) => {
  recentRequests++;
  const isDegraded = recentRequests > MAX_REQUESTS_PER_MINUTE;
  
  if (isDegraded && Math.random() > 0.5) {
      // Aggressive short-circuiting if degraded
      return new Response('Service Degraded', { 
          status: 429, 
          headers: { 'x-backend-health': 'degraded' } 
      });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages, idempotencyKey } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), { status: 400 });
    }

    if (idempotencyKey) {
        const store = getStore("idempotency");
        const existing = await store.get(idempotencyKey, { type: 'json' });
        // 15-minute TTL check
        if (existing && (Date.now() - existing.timestamp < 15 * 60 * 1000)) {
             const encoder = new TextEncoder();
             const stream = new ReadableStream({
               start(controller) {
                 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: existing.response })}\n\n`));
                 controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                 controller.close();
               }
             });
             return new Response(stream, { 
                 headers: { 'Content-Type': 'text/event-stream', 'x-backend-health': isDegraded ? 'degraded' : 'healthy' } 
             });
        }
    }

    // Keep last 20 messages to control token usage
    const recentMessages = messages.slice(-20);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert standard {role, content} to Gemini's format
    const history = recentMessages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
    
    const lastMessage = recentMessages[recentMessages.length - 1].content;

    const chatSession = model.startChat({ history });

    const result = await chatSession.sendMessageStream(lastMessage);

    // Create a ReadableStream from the generator
    const encoder = new TextEncoder();
    let fullText = "";
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          if (idempotencyKey) {
              const store = getStore("idempotency");
              await store.setJSON(idempotencyKey, { response: fullText, timestamp: Date.now() });
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'x-backend-health': isDegraded ? 'degraded' : 'healthy'
      },
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    // Fallback error response
    return new Response(JSON.stringify({ 
      error: 'AI service unavailable. Please try again.',
      details: error.message 
    }), { status: 500, headers: { 'Content-Type': 'application/json', 'x-backend-health': 'degraded' } });
  }
};

export const config: Config = {
  path: "/api/chat"
};
