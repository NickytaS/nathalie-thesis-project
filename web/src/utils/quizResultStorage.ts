import type { QuizScores, ToolId } from '../data/thesis';

export const QUIZ_RESULT_KEY = 'mte-quiz-result';
export const EVAL_COUNT_KEY = 'mte-eval-session-count';

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
}

export function evalSessionCount(): number {
  return parseInt(sessionStorage.getItem(EVAL_COUNT_KEY) || '0', 10);
}
