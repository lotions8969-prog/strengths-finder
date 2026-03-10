'use client';

import { useRouter } from 'next/navigation';
import { domainInfo } from '@/data/themes';
import { Zap, TrendingUp, Heart, Brain, ChevronRight, Star, Users } from 'lucide-react';

const domainIcons = {
  executing: Zap,
  influencing: TrendingUp,
  relationship: Heart,
  thinking: Brain,
};

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
            <Star size={14} className="text-yellow-400" />
            <span>ギャロップ CliftonStrengths インスパイア</span>
          </div>
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight text-white animate-fade-in-up md:text-7xl">
          あなたの<span style={{ color: '#a78bfa' }}>強み</span>を<br />発見する
        </h1>

        <p className="mb-4 max-w-2xl text-xl text-white/70 animate-fade-in-up">
          34の強みテーマから、あなたのTop 5を見つけましょう。
        </p>
        <p className="mb-12 max-w-xl text-base text-white/50 animate-fade-in-up">
          68の質問に答えることで、あなたの才能と強みのパターンを分析します。
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up">
          <button
            onClick={() => router.push('/register')}
            className="group flex items-center gap-3 rounded-full px-10 py-5 text-xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/30"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            診断を始める
            <ChevronRight size={24} className="transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => router.push('/members')}
            className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-5 text-lg font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
          >
            <Users size={22} />
            メンバーの強みを見る
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center animate-fade-in">
          {[
            { label: '強みテーマ', value: '34' },
            { label: '診断質問数', value: '68' },
            { label: '所要時間', value: '約15分' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Cards */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">4つの強みの領域</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(domainInfo) as [keyof typeof domainInfo, typeof domainInfo[keyof typeof domainInfo]][]).map(([key, domain]) => {
            const Icon = domainIcons[key];
            return (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: domain.hexColor + '33' }}
                >
                  <Icon size={24} style={{ color: domain.hexColor }} />
                </div>
                <h3 className="mb-2 font-bold text-white">{domain.name}</h3>
                <p className="text-xs leading-relaxed text-white/50">{domain.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-3xl px-4 pb-20 text-center">
        <h2 className="mb-8 text-2xl font-bold text-white">診断の流れ</h2>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
          {[
            { step: '01', text: '名前を入力' },
            { step: '02', text: '68問に1〜5で回答' },
            { step: '03', text: 'Top 5強みを確認・共有' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
              >
                {item.step}
              </div>
              <p className="text-sm text-white/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8 text-center">
        <p className="text-xs text-white/30">
          ※ このアプリはGallup社のCliftonStrengths（ストレングスファインダー）にインスパイアされた独自の診断ツールです。
          公式のGallup製品ではありません。
        </p>
      </div>
    </div>
  );
}
