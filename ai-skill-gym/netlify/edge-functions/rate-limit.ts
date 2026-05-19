import type { Context } from "@netlify/edge-functions";

// In-memory Edge cache for rolling rate limits.
// Note: Edge functions run across many nodes, so this is per-region.
// For true global sync, you would use Netlify Blobs or Redis.
// This is sufficient to stop naive single-IP spam.
const ipCache = new Map<string, { count: number; expires: number }>();
let globalRequests = 0;
let globalResetTime = Date.now() + 60000;

export default async (request: Request, context: Context) => {
    const url = new URL(request.url);
    
    // Only rate limit the API endpoints
    if (!url.pathname.startsWith('/api/')) {
        return; 
    }

    const now = Date.now();
    const ip = context.ip || 'unknown';

    // 1. Global Safety Cap (e.g., 500 req/min per edge node)
    if (now > globalResetTime) {
        globalRequests = 0;
        globalResetTime = now + 60000;
    }
    
    globalRequests++;
    
    if (globalRequests > 500) {
        console.error(`[EDGE] Global rate limit hit. Rejecting ${ip}`);
        return new Response(JSON.stringify({ error: "System under heavy load. Global limit reached." }), {
            status: 429,
            headers: { 
                "Content-Type": "application/json",
                "Retry-After": "60",
                "x-backend-health": "degraded"
            }
        });
    }

    // 2. Per-IP Fair Use Cap (e.g., 60 req/min per IP)
    let ipStats = ipCache.get(ip);
    
    if (!ipStats || now > ipStats.expires) {
        ipStats = { count: 1, expires: now + 60000 };
    } else {
        ipStats.count++;
    }
    
    ipCache.set(ip, ipStats);

    if (ipStats.count > 60) {
        console.warn(`[EDGE] IP rate limit hit for ${ip}`);
        return new Response(JSON.stringify({ error: "Too many requests from this IP." }), {
            status: 429,
            headers: { 
                "Content-Type": "application/json",
                "Retry-After": "60",
                "x-backend-health": "degraded" 
            }
        });
    }

    // Pass through if safe
    return;
};

export const config = {
    path: "/api/*",
};
