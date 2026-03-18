import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const migrationQueue = new Queue('migration-queue', { connection });

export async function queueMigrationJob(type: string, source: string, target: string, dbName: string, configContent: string) {
  // 1. Create a Job record in the metadata DB
  const job = await prisma.job.create({
    data: {
      type,
      source,
      target,
      status: 'PENDING',
    },
  });

  // 2. Push to BullMQ
  await migrationQueue.add('migration-task', {
    jobId: job.id,
    type,
    dbName,
    configContent,
  });

  return job.id;
}

export async function getJobStatus(jobId: string) {
  return await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      metrics: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      }
    }
  });
}
