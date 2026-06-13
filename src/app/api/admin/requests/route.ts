import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // analyze | questions | chat
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let events = getAllEvents();
    if (type) events = events.filter(e => e.type === type);
    // Newest first, limited
    events = events.reverse().slice(0, limit);

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Admin requests error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
