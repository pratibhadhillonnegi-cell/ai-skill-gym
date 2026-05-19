import { getProgress, saveProgress, deleteProgress, listAllProgress } from '../lib/data';
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const method = req.method;
  const url = new URL(req.url);
  
  // Extract userId from query string for GET, PUT, DELETE
  // Example: /api/data?userId=123
  const userId = url.searchParams.get('userId');

  try {
    if (method === 'GET') {
      if (userId) {
        const data = await getProgress(userId);
        if (!data) {
          // Return default state if empty
          return new Response(JSON.stringify({ 
            id: userId,
            level1: { attempts: 0, bestScore: 0 },
            level2: { attempts: 0, bestScore: 0 },
            level3: { attempts: 0, bestScore: 0 },
            level4: { attempts: 0, bestScore: 0 },
            history: [] 
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        const allData = await listAllProgress();
        return new Response(JSON.stringify(allData), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (method === 'POST' || method === 'PUT') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
      }
      const body = await req.json();
      body.id = userId; // Ensure ID matches

      // Enforce Integer Versioning (Last-Write-Wins with conflict rejection)
      const existing = await getProgress(userId);
      if (existing && existing.version && body.version && body.version < existing.version) {
          return new Response(JSON.stringify({ 
              error: 'Stale write rejected.', 
              currentVersion: existing.version 
          }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      // Auto-increment version if not provided or valid
      if (!body.version) {
          body.version = existing && existing.version ? existing.version + 1 : 1;
      }

      await saveProgress(userId, body);
      return new Response(JSON.stringify({ success: true, data: body }), { status: 200, headers: { 'Content-Type': 'application/json', 'x-backend-health': 'healthy' } });
    }

    if (method === 'DELETE') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
      }
      await deleteProgress(userId);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  } catch (error) {
    console.error('Data function error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/data"
};
