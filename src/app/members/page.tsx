'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { themes, domainInfo } from '@/data/themes';
import { ThemeScore } from '@/types';
import { Users, ChevronDown, ChevronUp, ArrowLeft, Trophy, Trash2, Loader2, RefreshCw } from 'lucide-react';

interface MemberResult {
  id: string;
  name: string;
  completedAt: string;
  scores: ThemeScore[];
}

function DomainBadge({ domain }: { domain: keyof typeof domainInfo }) {
  const d = domainInfo[domain];
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: d.hexColor }}
    >
      {d.name}
    </span>
  );
}

function MemberCard({
  member,
  isMe,
  onDelete,
}: {
  member: MemberResult;
  isMe: boolean;
  onDelete: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const top5 = member.scores.slice(0, 5);
  const date = new Date(member.completedAt).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-sm border transition-all ${
        isMe ? 'border-purple-300 ring-2 ring-purple-200' : 'border-slate-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            {member.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">{member.name}</span>
              {isMe && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600 shrink-0">
                  あなた
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">{date}に診断</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onDelete(member.id, member.name)}
            className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors"
            title="削除"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Top 5 mini */}
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-2">
          {top5.map((score, i) => {
            const theme = themes.find((t) => t.id === score.themeId)!;
            return (
              <div key={score.themeId} className="flex items-center gap-1.5">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: theme.hexColor }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-slate-700">{theme.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top 5 詳細
          </p>
          <div className="space-y-4">
            {top5.map((score, i) => {
              const theme = themes.find((t) => t.id === score.themeId)!;
              return (
                <div key={score.themeId}>
                  <div className="mb-1.5 flex items-center gap-2 flex-wrap">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: theme.hexColor }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-700">{theme.name}</span>
                    <span className="text-xs text-slate-400">{theme.nameEn}</span>
                    <DomainBadge domain={theme.domain} />
                  </div>
                  <div className="ml-8">
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${score.normalizedScore}%`, backgroundColor: theme.hexColor }}
                      />
                    </div>
                    <p className="text-xs italic text-slate-500 mb-1.5">「{theme.description}」</p>
                    <div className="flex flex-wrap gap-1">
                      {theme.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ backgroundColor: theme.hexColor + '1a', color: theme.hexColor }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 削除確認モーダル
function DeleteModal({
  name,
  onConfirm,
  onCancel,
  deleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-bold text-slate-800">削除の確認</h3>
        <p className="mb-6 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{name}</span> さんの診断結果を削除しますか？
          <br />
          この操作は元に戻せません。
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? <><Loader2 size={14} className="animate-spin" />削除中</> : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/members', { cache: 'no-store' });
      const data = await r.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem('sf_user_id');
    setMyId(id);
    fetchMembers();
  }, [fetchMembers]);

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/members?id=${deleteTarget.id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 削除確認モーダル */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
        className="px-4 py-12 text-center"
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <Users size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">メンバーの強み</h1>
        <p className="mt-2 text-white/50">
          {loading ? '読み込み中...' : `${members.length}人が診断済み`}
        </p>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Nav */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            ホームに戻る
          </button>
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            読み込み中...
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">まだ誰も診断していません</p>
            <button
              onClick={() => router.push('/register')}
              className="mt-4 rounded-full px-6 py-2 text-sm font-medium text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              最初に診断する
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isMe={member.id === myId}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}

        {members.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/register')}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-white font-medium shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              自分も診断する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
