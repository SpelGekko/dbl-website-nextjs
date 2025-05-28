// /app/api/bot/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tweet } = await request.json();

    // You can replace this logic with your real bot code
    const fakeReply = `This is a bot-generated response to: "${tweet}"`;

    return NextResponse.json({ reply: fakeReply });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request or server error' },
      { status: 400 }
    );
  }
}
