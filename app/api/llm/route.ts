import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { question } = await req.json();

  // Hardcoded response logic for testing
  const answer = `This is a mock answer to: "${question}"`;

  return NextResponse.json({ answer });
}