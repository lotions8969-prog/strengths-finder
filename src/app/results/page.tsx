'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadResults } from '@/lib/storage';
import { clearAll } from '@/lib/storage';
import { AssessmentResults, ThemeScore } from '@/types';
import { themes, domainInfo } from '@/data/themes';
import { Trophy, RotateCcw, ChevronDown, ChevronUp, Share2, Users } from 'lucide-react';

function ScoreBar({ score, color, animate, delay }: { score: number; color: string; animate: boolean; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(score), delay);
      return () => clearTimeout(timer);
    }
  }, [animate, score, delay]);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const r = loadResults();
    if (!r) {
      router.push('/');
      return;
    }
    setResults(r);
    setTimeout(() => setAnimated(true), 100);

    // 結果をサーバーに保存
    const id = localStorage.getItem('sf_user_id');
    const name = localStorage.getItem('sf_user_name') || '';
    setUserName(name);

    if (id && name && !saved) {
      fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, scores: r.scores, completedAt: r.completedAt }),
      }).then(() => setSaved(true)).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-white/50">読み込み中...</div>
      </div>
    );
  }

  const top5: ThemeScore[] = results.scores.slice(0, 5);
  const allScores: ThemeScore[] = results.scores;

  const getTheme = (themeId: string) => themes.find((t) => t.id === themeId)!;

  const handleRestart = () => {
    clearAll();
    router.push('/');
  };

  const handleShare = async () => {
    const top5Text = top5
      .map((s, i) => `${i + 1}位: ${getTheme(s.themeId).name}`)
      .join('\n');
    const text = `私のTop 5強みテーマ\n${top5Text}\n\nあなたも診断してみよう！`;

    if (navigator.share) {
      await navigator.share({ title: 'ストレングスファインダー診断結果', text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const completedDate = new Date(results.completedAt).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }} className="px-4 py-16 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400">
            <Trophy size={32} className="text-yellow-900" />
          </div>
        </div>
        {userName && (
          <p className="mb-1 text-lg font-bold text-white">{userName} さんの診断結果</p>
        )}
        <h1 className="mb-2 text-3xl font-bold text-white">Top 5 強みテーマ</h1>
        <p className="text-white/50 text-sm">{completedDate}に診断完了</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <Share2 size={16} />
            {copied ? 'コピーしました！' : '結果をシェア'}
          </button>
          <button
            onClick={() => router.push('/members')}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <Users size={16} />
            メンバーを見る
          </button>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <RotateCcw size={16} />
            もう一度診断
          </button>
        </div>
      </div>

      {/* Top 5 */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-800">
          あなたのTop 5 強みテーマ
        </h2>

        <div className="space-y-4">
          {top5.map((score, index) => {
            const theme = getTheme(score.themeId);
            const domain = domainInfo[theme.domain];
            const delay = index * 150;

            return (
              <div
                key={score.themeId}
                className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100"
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
                }}
              >
                <div className="flex items-start gap-4 p-6">
                  {/* Rank */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white shadow-md"
                    style={{ backgroundColor: theme.hexColor }}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800">{theme.name}</h3>
                      <span className="text-sm text-slate-400">{theme.nameEn}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: domain.hexColor }}
                      >
                        {domain.name}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="mb-3">
                      <ScoreBar
                        score={score.normalizedScore}
                        color={theme.hexColor}
                        animate={animated}
                        delay={delay + 300}
                      />
                    </div>

                    {/* Keywords */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {theme.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: theme.hexColor + '1a', color: theme.hexColor }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-slate-600">{theme.detailDescription}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All 34 themes accordion */}
        <div className="mt-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex w-full items-center justify-between rounded-xl bg-white px-6 py-4 text-left font-medium text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <span>全34テーマのスコアを見る</span>
            {showAll ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showAll && (
            <div className="mt-3 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              {allScores.map((score, index) => {
                const theme = getTheme(score.themeId);
                return (
                  <div
                    key={score.themeId}
                    className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0"
                  >
                    <span className="w-6 text-center text-sm font-mono text-slate-400">{index + 1}</span>
                    <div className="w-32 shrink-0">
                      <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${score.normalizedScore}%`,
                            backgroundColor: theme.hexColor,
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-sm font-mono text-slate-400">{score.rawScore}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-white font-medium shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <RotateCcw size={18} />
            もう一度診断する
          </button>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          ※ このアプリはGallup社のCliftonStrengths（ストレングスファインダー）にインスパイアされた独自の診断ツールです。
          公式のGallup製品ではありません。
        </p>
      </div>
    </div>
  );
}
