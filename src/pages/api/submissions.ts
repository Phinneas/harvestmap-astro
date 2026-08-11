export const prerender = false;
import type { APIRoute } from 'astro';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function checkAuth(request: Request, env: any) {
  if (!env.ADMIN_TOKEN) return true;
  const header = request.headers.get('Authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  return token === env.ADMIN_TOKEN;
}

async function removeFromPending(env: any, id: string) {
  try {
    const raw = await env.SUBMISSIONS_KV.get('index:pending');
    let pending = raw ? JSON.parse(raw) : [];
    pending = pending.filter((p: string) => p !== id);
    await env.SUBMISSIONS_KV.put('index:pending', JSON.stringify(pending));
  } catch {}
}

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime;
  const kv = runtime?.env?.SUBMISSIONS_KV;

  if (!kv) return json({ error: 'Storage not configured' }, 503);
  if (!checkAuth(request, runtime?.env)) return json({ error: 'Unauthorized' }, 401);

  let pendingIds: string[] = [];
  try {
    const raw = await kv.get('index:pending');
    pendingIds = raw ? JSON.parse(raw) : [];
  } catch {}

  const submissions = [];
  for (const id of pendingIds) {
    try {
      const raw = await kv.get(`sub:${id}`);
      if (raw) submissions.push(JSON.parse(raw));
    } catch {}
  }

  return json({ submissions }, 200);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime;
  const kv = runtime?.env?.SUBMISSIONS_KV;

  if (!kv) return json({ error: 'Storage not configured' }, 503);
  if (!checkAuth(request, runtime?.env)) return json({ error: 'Unauthorized' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { id, action } = body;
  if (!id || !action) return json({ error: 'Missing id or action' }, 400);

  if (action === 'approve') {
    try {
      const raw = await kv.get(`sub:${id}`);
      if (!raw) return json({ error: 'Submission not found' }, 404);
      const submission = JSON.parse(raw);
      submission.status = 'approved';
      submission.approvedAt = new Date().toISOString();
      await kv.put(`sub:${id}`, JSON.stringify(submission));
      await removeFromPending(runtime.env, id);
      return json({ ok: true, submission }, 200);
    } catch (e) {
      return json({ error: 'Failed to approve' }, 500);
    }
  } else if (action === 'reject') {
    try {
      await kv.delete(`sub:${id}`);
      await removeFromPending(runtime.env, id);
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: 'Failed to reject' }, 500);
    }
  }

  return json({ error: 'Unknown action' }, 400);
};
