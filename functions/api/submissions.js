// Cloudflare Pages Function — admin endpoint for reviewing submissions
// Protected by ADMIN_TOKEN env variable (passed as Bearer header).
// Supports: GET (list pending), POST with action=approve/reject.

export async function onRequestGet({ request, env }) {
  if (!env.SUBMISSIONS_KV) {
    return json({ error: 'Storage not configured' }, 503);
  }

  const auth = checkAuth(request, env);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  // Get pending submission IDs
  let pendingIds = [];
  try {
    const raw = await env.SUBMISSIONS_KV.get('index:pending');
    pendingIds = raw ? JSON.parse(raw) : [];
  } catch {}

  // Fetch each submission
  const submissions = [];
  for (const id of pendingIds) {
    try {
      const raw = await env.SUBMISSIONS_KV.get(`sub:${id}`);
      if (raw) submissions.push(JSON.parse(raw));
    } catch {}
  }

  return json({ submissions }, 200);
}

export async function onRequestPost({ request, env }) {
  if (!env.SUBMISSIONS_KV) {
    return json({ error: 'Storage not configured' }, 503);
  }

  const auth = checkAuth(request, env);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { id, action } = body;
  if (!id || !action) {
    return json({ error: 'Missing id or action' }, 400);
  }

  if (action === 'approve') {
    // Mark as approved
    try {
      const raw = await env.SUBMISSIONS_KV.get(`sub:${id}`);
      if (!raw) return json({ error: 'Submission not found' }, 404);
      const submission = JSON.parse(raw);
      submission.status = 'approved';
      submission.approvedAt = new Date().toISOString();
      await env.SUBMISSIONS_KV.put(`sub:${id}`, JSON.stringify(submission));
      await removeFromPending(env, id);
      return json({ ok: true, submission }, 200);
    } catch (e) {
      return json({ error: 'Failed to approve' }, 500);
    }
  } else if (action === 'reject') {
    try {
      await env.SUBMISSIONS_KV.delete(`sub:${id}`);
      await removeFromPending(env, id);
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: 'Failed to reject' }, 500);
    }
  }

  return json({ error: 'Unknown action' }, 400);
}

function checkAuth(request, env) {
  if (!env.ADMIN_TOKEN) return true; // No token set = open (dev mode)
  const header = request.headers.get('Authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  return token === env.ADMIN_TOKEN;
}

async function removeFromPending(env, id) {
  try {
    const raw = await env.SUBMISSIONS_KV.get('index:pending');
    let pending = raw ? JSON.parse(raw) : [];
    pending = pending.filter((p) => p !== id);
    await env.SUBMISSIONS_KV.put('index:pending', JSON.stringify(pending));
  } catch {}
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
