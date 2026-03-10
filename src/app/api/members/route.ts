import { NextRequest, NextResponse } from 'next/server';

const TOKEN = process.env.GITHUB_TOKEN!;
const OWNER = 'lotions8969-prog';
const REPO = 'strengths-data';

async function ghFetch(path: string, options: RequestInit = {}) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...options,
    headers: {
      Authorization: `token ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      ...((options.headers as Record<string, string>) || {}),
    },
  });
}

// 全メンバーの結果を取得
export async function GET() {
  try {
    const res = await ghFetch('/contents/results');
    if (!res.ok) {
      if (res.status === 404) return NextResponse.json([]);
      return NextResponse.json([]);
    }
    const files: { name: string; download_url: string }[] = await res.json();

    const members = await Promise.all(
      files
        .filter((f) => f.name.endsWith('.json'))
        .map(async (file) => {
          const r = await fetch(file.download_url);
          return r.json();
        })
    );

    members.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    return NextResponse.json(members);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 診断結果を保存
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, scores, completedAt } = body;

    if (!id || !name || !scores) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const record = { id, name, scores, completedAt };
    const content = Buffer.from(JSON.stringify(record, null, 2)).toString('base64');
    const path = `/contents/results/${id}.json`;

    // 既存ファイルのSHAを取得（更新の場合に必要）
    let sha: string | undefined;
    const existing = await ghFetch(path);
    if (existing.ok) {
      const d = await existing.json();
      sha = d.sha;
    }

    const putBody: Record<string, string> = {
      message: `Save result: ${name}`,
      content,
    };
    if (sha) putBody.sha = sha;

    const res = await ghFetch(path, {
      method: 'PUT',
      body: JSON.stringify(putBody),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
