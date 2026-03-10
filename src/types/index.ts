export type StrengthDomain = 'executing' | 'influencing' | 'relationship' | 'thinking';

export interface StrengthTheme {
  id: string;
  name: string;
  nameEn: string;
  domain: StrengthDomain;
  hexColor: string;
  description: string;
  detailDescription: string;
  keywords: string[];
}

export interface Question {
  id: string;
  themeId: string;
  text: string;
}

export interface AssessmentAnswers {
  [questionId: string]: number;
}

export interface ThemeScore {
  themeId: string;
  rawScore: number;
  normalizedScore: number;
  rank: number;
}

export interface AssessmentResults {
  completedAt: string;
  answers: AssessmentAnswers;
  scores: ThemeScore[];
}
