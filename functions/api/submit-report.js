// Cloudflare Pages Function — handles "what's ripe" submission form
// Writes submissions to KV namespace bound as SUBMISSIONS_KV.
// Rate-limits by IP using KV with a 60s window.

const RATE_LIMIT_WINDOW = 60; // seconds
const MAX_SUBMISSIONS_PER_WINDOW = 3;

export async function onRequestPost({ request, env }) {
  if (!env.SUBMISSIONS_KV) {
    return json({ error: 'Submission storage not configured' }, 503);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  // Validate required fields
  if (!data.farmSlug || typeof data.farmSlug !== 'string') {
    return json({ error: 'Missing farm slug' }, 400);
  }
  if (data.farmSlug.length > 200) {
    return json({ error: 'Invalid farm slug' }, 400);
  }

  // Rate limiting by IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateKey = `rate:${ip}`;
  let rateCount = 0;
  try {
    const existing = await env.SUBMISSIONS_KV.get(rateKey);
    rateCount = existing ? parseInt(existing, 10) : 0;
  } catch {}

  if (rateCount >= MAX_SUBMISSIONS_PER_WINDOW) {
    return json({ error: 'Too many submissions. Please wait a minute.' }, 429);
  }

  // Increment rate limit counter
  try {
    await env.SUBMISSIONS_KV.put(rateKey, String(rateCount + 1), {
      expirationTtl: RATE_LIMIT_WINDOW,
    });
  } catch {}

  // Create submission record
  const id = crypto.randomUUID();
  const submission = {
    id,
    farmSlug: data.farmSlug,
    farmName: data.farmName || '',
    farmState: data.farmState || '',
    crops: Array.isArray(data.crops) ? data.crops.slice(0, 50) : [],
    notes: typeof data.notes === 'string' ? data.notes.slice(0, 2000) : '',
    reporterName: typeof data.reporterName === 'string' ? data.reporterName.slice(0, 100) : '',
    reporterEmail: typeof data.reporterEmail === 'string' ? data.reporterEmail.slice(0, 200) : '',
    submittedAt: data.submittedAt || new Date().toISOString(),
    ip,
    status: 'pending',
  };

  // Store submission
  try {
    await env.SUBMISSIONS_KV.put(`sub:${id}`, JSON.stringify(submission));
    // Also add to pending index
    const pendingKey = 'index:pending';
    let pending = [];
    try {
      const existing = await env.SUBMISSIONS_KV.get(pendingKey);
      pending = existing ? JSON.parse(existing) : [];
    } catch {}
    pending.push(id);
    await env.SUBMISSIONS_KV.put(pendingKey, JSON.stringify(pending));
  } catch (e) {
    return json({ error: 'Failed to store submission' }, 500);
  }

  return json({ ok: true, id }, 201);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
