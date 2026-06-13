import { NextRequest, NextResponse } from 'next/server';
import { upsertUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const user = upsertUser({ email, name: name || 'User', role: role || 'user' });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error('track-user error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
