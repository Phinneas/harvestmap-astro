export const prerender = false;
import type { APIRoute } from 'astro';

const RATE_LIMIT_WINDOW = 60;
const MAX_SUBMISSIONS_PER_WINDOW = 3;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime;
  const kv = runtime?.env?.SUBMISSIONS_KV;

  if (!kv) {
    return json({ error: 'Submission storage not configured' }, 503);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const type = data.type === 'new-farm' ? 'new-farm' : 'ripe-report';

  if (type === 'ripe-report') {
    if (!data.farmSlug || typeof data.farmSlug !== 'string') {
      return json({ error: 'Missing farm slug' }, 400);
    }
    if (data.farmSlug.length > 200) {
      return json({ error: 'Invalid farm slug' }, 400);
    }
  } else {
    if (!data.farmName || typeof data.farmName !== 'string') {
      return json({ error: 'Missing farm name' }, 400);
    }
    if (!data.farmState || typeof data.farmState !== 'string') {
      return json({ error: 'Missing farm state' }, 400);
    }
  }

  // Rate limiting by IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateKey = `rate:${ip}`;
  let rateCount = 0;
  try {
    const existing = await kv.get(rateKey);
    rateCount = existing ? parseInt(existing, 10) : 0;
  } catch {}

  if (rateCount >= MAX_SUBMISSIONS_PER_WINDOW) {
    return json({ error: 'Too many submissions. Please wait a minute.' }, 429);
  }

  try {
    await kv.put(rateKey, String(rateCount + 1), {
      expirationTtl: RATE_LIMIT_WINDOW,
    });
  } catch {}

  const id = crypto.randomUUID();
  const submission = {
    id,
    type,
    farmSlug: data.farmSlug || '',
    farmName: data.farmName || '',
    farmState: data.farmState || '',
    farmCity: data.farmCity || '',
    crops: Array.isArray(data.crops) ? data.crops.slice(0, 50) : [],
    notes: typeof data.notes === 'string' ? data.notes.slice(0, 2000) : '',
    description: typeof data.description === 'string' ? data.description.slice(0, 2000) : '',
    farmWebsite: typeof data.farmWebsite === 'string' ? data.farmWebsite.slice(0, 500) : '',
    farmPhone: typeof data.farmPhone === 'string' ? data.farmPhone.slice(0, 50) : '',
    reporterName: typeof data.reporterName === 'string' ? data.reporterName.slice(0, 100) : '',
    reporterEmail: typeof data.reporterEmail === 'string' ? data.reporterEmail.slice(0, 200) : '',
    submittedAt: data.submittedAt || new Date().toISOString(),
    ip,
    status: 'pending',
  };

  try {
    await kv.put(`sub:${id}`, JSON.stringify(submission));
    const pendingKey = 'index:pending';
    let pending: string[] = [];
    try {
      const existing = await kv.get(pendingKey);
      pending = existing ? JSON.parse(existing) : [];
    } catch {}
    pending.push(id);
    await kv.put(pendingKey, JSON.stringify(pending));
  } catch (e) {
    return json({ error: 'Failed to store submission' }, 500);
  }

  return json({ ok: true, id }, 201);
};
