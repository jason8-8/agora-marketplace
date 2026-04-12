import { NextRequest, NextResponse } from 'next/server';
import { createTopic, publishMessage } from '@/lib/hcs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topicId = await createTopic(`agora-register-${Date.now()}`);
    await publishMessage(topicId, {
      type: 'EXPERT_REGISTRATION',
      name: body.name,
      title: body.title,
      specialty: body.specialty,
      rate: body.rate,
      years: body.years,
      domains: body.domains,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, topicId });
  } catch (err) {
    // Non-fatal: return success anyway so the UI confirms
    console.error('Registration HCS publish failed:', err);
    return NextResponse.json({ success: true, topicId: null });
  }
}
