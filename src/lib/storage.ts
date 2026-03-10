import { AssessmentAnswers, AssessmentResults } from '@/types';

const KEYS = {
  ANSWERS: 'sf_answers',
  QUESTION_ORDER: 'sf_question_order',
  RESULTS: 'sf_results',
};

export function saveAnswers(answers: AssessmentAnswers): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.ANSWERS, JSON.stringify(answers));
}

export function loadAnswers(): AssessmentAnswers | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.ANSWERS);
  return raw ? JSON.parse(raw) : null;
}

export function saveQuestionOrder(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.QUESTION_ORDER, JSON.stringify(ids));
}

export function loadQuestionOrder(): string[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.QUESTION_ORDER);
  return raw ? JSON.parse(raw) : null;
}

export function saveResults(results: AssessmentResults): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
}

export function loadResults(): AssessmentResults | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.RESULTS);
  return raw ? JSON.parse(raw) : null;
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
