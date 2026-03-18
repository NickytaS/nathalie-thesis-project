import { Worker, Job as BullJob } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { triggerPgLoader, getContainerStatus } from './lib/docker-orchestrator';

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

console.log('🚀 Worker is starting...');

const worker = new Worker(
  'migration-queue',
  async (bullJob: BullJob) => {
    const { jobId, type, dbName, configContent } = bullJob.data;

    console.log(`📦 Processing job ${jobId} (type: ${type})`);

    // 1. Update DB to RUNNING
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      let containerId: string;

      if (type === 'pgloader') {
        containerId = await triggerPgLoader(jobId, dbName, configContent);
      } else {
        throw new Error(`Unsupported job type: ${type}`);
      }

      await prisma.job.update({
        where: { id: jobId },
        data: { containerId },
      });

      // 2. Poll for completion
      // In a real scenario, we might use a separate monitoring loop or container events
      // For now, we'll simple poll in the worker (not ideal but works for MVP)
      let finished = false;
      while (!finished) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusData = await getContainerStatus(containerId);
        
        if (statusData.status === 'FINISHED') {
          finished = true;
          const finalStatus = statusData.exitCode === 0 ? 'COMPLETED' : 'FAILED';
          await prisma.job.update({
            where: { id: jobId },
            data: {
              status: finalStatus,
              finishedAt: new Date(statusData.finishedAt),
              error: statusData.exitCode !== 0 ? `Exit code: ${statusData.exitCode}` : null,
            },
          });
          console.log(`✅ Job ${jobId} finished with status: ${finalStatus}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Job ${jobId} failed:`, error);
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error.message,
          finishedAt: new Date(),
        },
      });
    }
  },
  { connection }
);

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
