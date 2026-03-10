import { NextRequest, NextResponse } from 'next/server';

const TOKEN = process.env.GITHUB_TOKEN!;
const OWNER = 'lotions8969-prog';
const REPO = 'strengths-data';
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

async function gh(path: string, options: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
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
    const res = await gh('/results');
    if (!res.ok) {
      if (res.status === 404) return NextResponse.json([]);
      const err = await res.text();
      console.error('GET /results failed:', err);
      return NextResponse.json([]);
    }
    const files: { name: string; download_url: string }[] = await res.json();

    const jsonFiles = files.filter((f) => f.name.endsWith('.json'));
    if (jsonFiles.length === 0) return NextResponse.json([]);

    const members = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const r = await fetch(file.download_url, { cache: 'no-store' });
          return await r.json();
        } catch {
          return null;
        }
      })
    );

    const valid = members
      .filter((m) => m !== null && m.id && m.name)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return NextResponse.json(valid);
  } catch (e) {
    console.error('GET members error:', e);
    return NextResponse.json([]);
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

    const record = { id, name, scores, completedAt, savedAt: new Date().toISOString() };
    const content = Buffer.from(JSON.stringify(record, null, 2)).toString('base64');
    const path = `/results/${id}.json`;

    // 既存ファイルのSHAを取得
    let sha: string | undefined;
    const existing = await gh(path);
    if (existing.ok) {
      const d = await existing.json();
      sha = d.sha;
    }

    const putBody: Record<string, string> = {
      message: `Save result: ${name} (${new Date().toISOString()})`,
      content,
    };
    if (sha) putBody.sha = sha;

    const res = await gh(path, {
      method: 'PUT',
      body: JSON.stringify(putBody),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('PUT result failed:', err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST members error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 診断結果を削除
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const path = `/results/${id}.json`;

    // SHAを取得
    const existing = await gh(path);
    if (!existing.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const d = await existing.json();
    const sha = d.sha;

    const res = await gh(path, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Delete result: ${id}`,
        sha,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE members error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
