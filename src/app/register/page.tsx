'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAll } from '@/lib/storage';
import { UserCircle, ChevronRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('名前を入力してください');
      return;
    }
    if (trimmed.length > 30) {
      setError('30文字以内で入力してください');
      return;
    }

    clearAll();
    // IDと名前をlocalStorageに保存
    const id = crypto.randomUUID();
    localStorage.setItem('sf_user_id', id);
    localStorage.setItem('sf_user_name', trimmed);
    router.push('/assessment');
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <UserCircle size={40} className="text-white" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold text-white animate-fade-in-up">
          名前を入力
        </h1>
        <p className="mb-10 text-center text-white/50 animate-fade-in-up">
          診断結果にあなたの名前が表示されます。<br />
          他のメンバーとも共有されます。
        </p>

        {/* Input */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm animate-scale-in">
          <label className="mb-2 block text-sm font-medium text-white/70">
            あなたの名前（ニックネーム可）
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="例：田中太郎"
            maxLength={30}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-lg text-white placeholder-white/30 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <p className="mt-2 text-right text-xs text-white/30">{name.length}/30</p>
        </div>

        <button
          onClick={handleStart}
          className="group mt-6 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/30"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          診断を始める
          <ChevronRight size={22} className="transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← 戻る
        </button>
      </div>
    </div>
  );
}
