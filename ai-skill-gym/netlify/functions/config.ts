import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

// For demonstration. In a real environment, store this in process.env.ADMIN_SECRET
const ADMIN_SECRET = process.env.ADMIN_SECRET || "gym-ops-2026";

const DEFAULT_CONFIG = {
    fallback_enabled: true,
    max_fallback_uses_per_session: 5,
    telemetry_sample_rate: 0.2, 
    circuit_breaker_threshold: 3, 
    circuit_breaker_window_ms: 300000, 
    cooldown_period_ms: 300000, 
    max_jobs_per_user: 10,
    version: "v6.0.0"
};

export default async (req: Request) => {
    const store = getStore("system_config");
    
    if (req.method === 'GET') {
        const config = await store.get("global", { type: 'json' }) || DEFAULT_CONFIG;
        return new Response(JSON.stringify(config), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
        });
    }

    if (req.method === 'POST') {
        const authHeader = req.headers.get('Authorization');
        
        if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        try {
            const updates = await req.json();
            const currentConfig = await store.get("global", { type: 'json' }) || DEFAULT_CONFIG;
            
            // Merge updates (Partial Modes allowed)
            const newConfig = { ...currentConfig, ...updates, version: `v6.${Date.now()}` };
            
            await store.setJSON("global", newConfig);

            return new Response(JSON.stringify({ success: true, config: newConfig }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err) {
            return new Response("Bad Request", { status: 400 });
        }
    }

    return new Response("Method Not Allowed", { status: 405 });
};

export const config: Config = {
    path: "/api/config"
};
