import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/docker-orchestrator';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const job = await getJobStatus(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('API Error (status):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
