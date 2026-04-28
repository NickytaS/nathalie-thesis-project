import type { QuizScores, ToolId } from '../data/thesis';
import { apiUrl } from '../utils/apiBase';

export type RemoteQuizResult = {
  id: number;
  winner: ToolId;
  quizScores: QuizScores;
  savedAt: string;
};

async function readMessage(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  return typeof data.message === 'string' ? data.message : res.statusText;
}

export async function saveQuizResultRemote(
  quizScores: QuizScores,
  winner: ToolId,
): Promise<RemoteQuizResult | null> {
  const r = await fetch(apiUrl('/api/quiz-results'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ quizScores, winner }),
  });
  if (!r.ok) return null;
  return (await r.json()) as RemoteQuizResult;
}

export async function fetchQuizHistory(): Promise<RemoteQuizResult[]> {
  const r = await fetch(apiUrl('/api/quiz-results'), { credentials: 'include' });
  if (!r.ok) return [];
  const data = (await r.json()) as { items?: RemoteQuizResult[] };
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchLatestQuizResult(): Promise<RemoteQuizResult | null> {
  const r = await fetch(apiUrl('/api/quiz-results/latest'), { credentials: 'include' });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return (await r.json()) as RemoteQuizResult;
}

export async function fetchQuizResultById(id: number): Promise<RemoteQuizResult | null> {
  const r = await fetch(apiUrl(`/api/quiz-results/${id}`), { credentials: 'include' });
  if (!r.ok) return null;
  return (await r.json()) as RemoteQuizResult;
}

export async function deleteQuizResultRemote(id: number): Promise<{ ok: boolean; message?: string }> {
  const r = await fetch(apiUrl(`/api/quiz-results/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (r.status === 204) return { ok: true };
  return { ok: false, message: await readMessage(r) };
}
