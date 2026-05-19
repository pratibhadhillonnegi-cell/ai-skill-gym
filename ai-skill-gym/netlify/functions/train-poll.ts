import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'jobId is required' }), { status: 400 });
    }

    const store = getStore("evaluations");
    const job = await store.get(jobId, { type: 'json' });

    if (!job) {
      return new Response(JSON.stringify({ status: 'not_found' }), { status: 404 });
    }

    // Job Watchdog TTL
    if (job.status === 'processing') {
        const ttl = (job.expectedDuration || 30000) + 15000; // 15s buffer
        if (Date.now() - job.timestamp > ttl) {
            console.warn(`[WATCHDOG] Job ${jobId} exceeded TTL of ${ttl}ms. Marking failed.`);
            
            job.status = 'failed';
            job.error = 'Job exceeded expected execution time (Watchdog Timeout)';
            
            // Mark it failed in the store so we don't keep polling
            await store.setJSON(jobId, job);
            
            return new Response(JSON.stringify(job), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
    }

    return new Response(JSON.stringify(job), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[TRAIN POLL ERROR]', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/train/poll"
};
