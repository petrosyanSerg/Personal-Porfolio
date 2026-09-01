import { NextResponse } from 'next/server';

import { emailConfig } from '@/lib/env';
import { contactSchema } from '@/lib/contact-schema';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 2048;

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

function evictExpired(now: number): void {
  for (const [address, times] of hits) {
    const last = times[times.length - 1];
    if (last === undefined || now - last >= WINDOW_MS) hits.delete(address);
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  evictExpired(now);

  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'rateLimited' }, { status: 429 });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'tooLarge' }, { status: 413 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const result = contactSchema.safeParse(parsedJson);
  if (!result.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const { name, email, message, company } = result.data;

  if (company) {
    return NextResponse.json({ ok: true });
  }

  if (!emailConfig) {
    console.error('[contact] Resend is not configured — message not delivered.');
    return NextResponse.json({ error: 'notConfigured' }, { status: 503 });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(emailConfig.apiKey);

    await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.to,
      replyTo: email,
      subject: `Portfolio enquiry — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact] Delivery failed:', error);
    return NextResponse.json({ error: 'sendFailed' }, { status: 502 });
  }
}
