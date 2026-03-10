import { AssessmentAnswers, ThemeScore, AssessmentResults } from '@/types';
import { themes } from '@/data/themes';
import { questions } from '@/data/questions';

export function calculateResults(answers: AssessmentAnswers): AssessmentResults {
  const rawScores = themes.map((theme) => {
    const themeQuestions = questions.filter((q) => q.themeId === theme.id);
    const raw = themeQuestions.reduce((sum, q) => {
      return sum + (answers[q.id] ?? 3);
    }, 0);
    return { themeId: theme.id, rawScore: raw };
  });

  rawScores.sort((a, b) => b.rawScore - a.rawScore);

  const MIN = 2, MAX = 10;
  const scores: ThemeScore[] = rawScores.map((s, index) => ({
    themeId: s.themeId,
    rawScore: s.rawScore,
    normalizedScore: Math.round(((s.rawScore - MIN) / (MAX - MIN)) * 100),
    rank: index + 1,
  }));

  return {
    completedAt: new Date().toISOString(),
    answers,
    scores,
  };
}
