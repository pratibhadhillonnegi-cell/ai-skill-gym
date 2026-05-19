import { getStore } from '@netlify/blobs';

export interface UserProgress {
  id: string;
  level1: { attempts: number; bestScore: number };
  level2: { attempts: number; bestScore: number };
  level3: { attempts: number; bestScore: number };
  level4: { attempts: number; bestScore: number };
  history: Array<{
    level: number;
    score: number;
    timestamp: string;
    challenge: string;
    userPrompt: string;
  }>;
}

const STORE_NAME = 'ai-skill-gym-data';

export async function getProgress(userId: string): Promise<UserProgress | null> {
  const store = getStore(STORE_NAME);
  const data = await store.get(userId, { type: 'json' });
  return data as UserProgress | null;
}

export async function saveProgress(userId: string, data: UserProgress): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.setJSON(userId, data);
}

export async function deleteProgress(userId: string): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.delete(userId);
}

export async function listAllProgress(): Promise<UserProgress[]> {
  const store = getStore(STORE_NAME);
  const { blobs } = await store.list();
  
  const allData: UserProgress[] = [];
  for (const blob of blobs) {
    const data = await store.get(blob.key, { type: 'json' });
    if (data) {
      allData.push(data as UserProgress);
    }
  }
  return allData;
}
