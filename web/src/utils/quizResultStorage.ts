import type { QuizScores, ToolId } from '../data/thesis';

export const QUIZ_RESULT_KEY = 'mte-quiz-result';
export const EVAL_COUNT_KEY = 'mte-eval-session-count';
export const QUIZ_HISTORY_KEY = 'mte-quiz-history';

export interface StoredQuizResult {
  quizScores: QuizScores;
  winner: ToolId;
  savedAt: string;
}

export function loadQuizResult(): StoredQuizResult | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_RESULT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredQuizResult;
    if (!data?.quizScores || !data?.winner) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveQuizResult(quizScores: QuizScores, winner: ToolId): void {
  const payload: StoredQuizResult = {
    quizScores,
    winner,
    savedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(payload));
  const prev = parseInt(sessionStorage.getItem(EVAL_COUNT_KEY) || '0', 10);
  sessionStorage.setItem(EVAL_COUNT_KEY, String(prev + 1));
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    const prior = raw ? (JSON.parse(raw) as StoredQuizResult[]) : [];
    const safePrior = Array.isArray(prior) ? prior : [];
    const next = [payload, ...safePrior].slice(0, 25);
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore history persistence failures in private browsing or blocked storage.
  }
}

export function evalSessionCount(): number {
  return parseInt(sessionStorage.getItem(EVAL_COUNT_KEY) || '0', 10);
}

export function loadQuizHistory(): StoredQuizResult[] {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    const data = raw ? (JSON.parse(raw) as StoredQuizResult[]) : [];
    const history = Array.isArray(data)
      ? data.filter((item) => item?.quizScores && item?.winner && typeof item.savedAt === 'string')
      : [];
    const latest = loadQuizResult();
    if (!latest) return history;
    const alreadyIncluded = history.some(
      (item) =>
        item.savedAt === latest.savedAt &&
        item.winner === latest.winner &&
        JSON.stringify(item.quizScores) === JSON.stringify(latest.quizScores),
    );
    if (alreadyIncluded) return history;
    const next = [latest, ...history].slice(0, 25);
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}
