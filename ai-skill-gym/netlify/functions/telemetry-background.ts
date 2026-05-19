import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

// In-Memory rolling counters per function instance
let rollingMetrics = {
    totalEvents: 0,
    fallbackEvents: 0,
    timeoutEvents: 0,
    walAnomalies: 0,
    lastFlush: Date.now()
};

const SAMPLE_RATE = 0.2; // 20%
const FLUSH_INTERVAL = 60000; // 60s

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    // 1. Sampling Check
    // If the client didn't force a critical log, apply sampling to drop 80% of noise.
    if (Math.random() > SAMPLE_RATE) {
        return new Response('', { status: 202 });
    }

    const payload = await req.json();
    if (!Array.isArray(payload)) return new Response('', { status: 400 });

    // 2. In-Memory Aggregation (Not raw writes)
    payload.forEach(event => {
        rollingMetrics.totalEvents++;
        if (event.type === 'fallback_used') rollingMetrics.fallbackEvents++;
        if (event.type === 'job_timeout') rollingMetrics.timeoutEvents++;
        if (event.type === 'wal_full') rollingMetrics.walAnomalies++;
    });

    const now = Date.now();
    
    // 3. Flush & Anomaly Alerting (Every 60s)
    if (now - rollingMetrics.lastFlush > FLUSH_INTERVAL) {
        
        // Calculate Anomaly Rates
        const fallbackRate = rollingMetrics.totalEvents > 0 ? (rollingMetrics.fallbackEvents / rollingMetrics.totalEvents) : 0;
        const timeoutRate = rollingMetrics.totalEvents > 0 ? (rollingMetrics.timeoutEvents / rollingMetrics.totalEvents) : 0;

        // Check Alert Conditions
        if (fallbackRate > 0.30 || timeoutRate > 0.10 || rollingMetrics.walAnomalies > 5) {
            console.error("🚨 [CRITICAL ALERT] System Anomaly Detected!", {
                fallbackRate: (fallbackRate * 100).toFixed(1) + "%",
                timeoutRate: (timeoutRate * 100).toFixed(1) + "%",
                walAnomalies: rollingMetrics.walAnomalies
            });
            
            // In a real system, you trigger a webhook here:
            // await fetch('https://hooks.slack.com/services/T0000/B0000/XXXX', { ... })
        }

        // Persist aggregated counts to Blob, not raw logs
        const store = getStore("telemetry_stats");
        const timestamp = new Date().toISOString().substring(0, 13); // Hourly bucket
        
        const currentStats = await store.get(timestamp, { type: 'json' }) || { total:0, fallback:0, timeout:0 };
        await store.setJSON(timestamp, {
            total: currentStats.total + rollingMetrics.totalEvents,
            fallback: currentStats.fallback + rollingMetrics.fallbackEvents,
            timeout: currentStats.timeout + rollingMetrics.timeoutEvents,
        });

        // Reset in-memory counters
        rollingMetrics = { totalEvents: 0, fallbackEvents: 0, timeoutEvents: 0, walAnomalies: 0, lastFlush: now };
    }

    return new Response(JSON.stringify({ success: true }), { status: 202 });

  } catch (error) {
    console.error('[TELEMETRY ERROR]', error);
    return new Response('', { status: 500 });
  }
};

export const config: Config = {
  path: "/api/telemetry"
};
