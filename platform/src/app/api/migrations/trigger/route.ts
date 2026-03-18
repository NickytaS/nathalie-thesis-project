import { NextRequest, NextResponse } from 'next/server';
import { queueMigrationJob } from '@/lib/docker-orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, source, target, dbName, configContent } = body;

    if (!type || !source || !target || !dbName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const jobId = await queueMigrationJob(type, source, target, dbName, configContent || '');

    return NextResponse.json({ jobId, message: 'Migration job queued successfully' });
  } catch (error: any) {
    console.error('API Error (trigger):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
