'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/data/questions';
import { themes } from '@/data/themes';
import { AssessmentAnswers } from '@/types';
import { saveAnswers, loadAnswers, saveQuestionOrder, loadQuestionOrder, saveResults } from '@/lib/storage';
import { calculateResults } from '@/lib/scoring';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RATING_LABELS = ['全くそうでない', 'あまりそうでない', 'どちらとも言えない', 'ややそうである', '非常にそうである'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedOrder = loadQuestionOrder();
    const savedAnswers = loadAnswers();

    let order: string[];
    if (savedOrder) {
      order = savedOrder;
    } else {
      order = shuffle(questions).map((q) => q.id);
      saveQuestionOrder(order);
    }

    setOrderedIds(order);

    if (savedAnswers) {
      setAnswers(savedAnswers);
      // Resume from first unanswered
      const firstUnanswered = order.findIndex((id) => !(id in savedAnswers));
      setCurrentIndex(firstUnanswered === -1 ? order.length - 1 : firstUnanswered);
    }

    setMounted(true);
  }, []);

  const currentQuestion = orderedIds[currentIndex]
    ? questions.find((q) => q.id === orderedIds[currentIndex])
    : null;

  const currentTheme = currentQuestion
    ? themes.find((t) => t.id === currentQuestion.themeId)
    : null;

  const handleSelect = useCallback(async (value: number) => {
    if (!currentQuestion || animating) return;

    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);

    if (currentIndex === orderedIds.length - 1) {
      // Last question answered
      const results = calculateResults(newAnswers);
      saveResults(results);
      router.push('/results');
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setAnimating(false);
    }, 300);
  }, [currentQuestion, answers, currentIndex, orderedIds.length, animating, router]);

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  if (!mounted || orderedIds.length === 0 || !currentQuestion || !currentTheme) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="text-white/50">読み込み中...</div>
      </div>
    );
  }

  const progress = ((currentIndex) / orderedIds.length) * 100;
  const selectedValue = answers[currentQuestion.id] ?? null;

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-between text-sm">
            <button
              onClick={() => router.push('/')}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              ← ホーム
            </button>
            <span className="font-mono text-white/60">
              {currentIndex + 1} / {orderedIds.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: currentTheme.hexColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div
          className={`transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Theme badge */}
          <div className="mb-8 flex justify-center">
            <span
              className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: currentTheme.hexColor + '33', border: `1px solid ${currentTheme.hexColor}66` }}
            >
              {currentTheme.name}（{currentTheme.nameEn}）
            </span>
          </div>

          {/* Question text */}
          <div className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-xl leading-relaxed text-white md:text-2xl">
              {currentQuestion.text}
            </p>
          </div>

          {/* Rating buttons */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className={`w-full rounded-xl border px-6 py-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                  selectedValue === value
                    ? 'border-transparent text-white shadow-lg'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                style={
                  selectedValue === value
                    ? { backgroundColor: currentTheme.hexColor, borderColor: currentTheme.hexColor }
                    : {}
                }
              >
                <div className="flex items-center gap-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={
                      selectedValue === value
                        ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                        : { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                    }
                  >
                    {value}
                  </span>
                  <span className="font-medium">{RATING_LABELS[value - 1]}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
              前の質問へ
            </button>

            {selectedValue !== null && (
              <button
                onClick={() => {
                  if (currentIndex === orderedIds.length - 1) {
                    const results = calculateResults(answers);
                    saveResults(results);
                    router.push('/results');
                  } else {
                    setAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex((i) => i + 1);
                      setAnimating(false);
                    }, 300);
                  }
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                次の質問へ
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
