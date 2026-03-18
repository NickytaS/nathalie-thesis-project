import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';

const docker = new Docker({ socketPath: '//./pipe/docker_engine' }); // Windows specific

// Note: PROJECT_ROOT might need to be adjusted if the backend is running in a container
// For now, assuming host execution during dev.
const PROJECT_ROOT = 'c:/Users/banknote/Desktop/bullshit-nofocus';

export async function triggerPgLoader(jobId: string, dbName: string, configContent: string) {
  try {
    // Create a temporary config file for the job
    const configDir = path.join(PROJECT_ROOT, 'backend', 'temp_configs');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const configPath = path.join(configDir, `${jobId}.load`);
    fs.writeFileSync(configPath, configContent);

    const binds = [
      `${configPath}:/config/job.load:ro`,
      `${PROJECT_ROOT}/platform/uploads:/uploads:ro` // To reach the SQL dump
    ];

    const container = await docker.createContainer({
      Image: 'dimitri/pgloader',
      Cmd: ['pgloader', '/config/job.load'],
      HostConfig: {
        NetworkMode: 'bullshit-nofocus_migration-net',
        Binds: binds
      },
      Labels: {
        'platform': 'MigrateOptima',
        'job_id': jobId,
        'job_type': 'pgloader'
      }
    });

    await container.start();
    return container.id;
  } catch (error) {
    console.error('Docker Error (triggerPgLoader):', error);
    throw error;
  }
}

export async function getContainerStatus(containerId: string) {
  try {
    const container = docker.getContainer(containerId);
    const data = await container.inspect();
    return {
      status: data.State.Running ? 'RUNNING' : 'FINISHED',
      exitCode: data.State.ExitCode,
      finishedAt: data.State.FinishedAt,
      error: data.State.Error
    };
  } catch (error) {
    console.error('Error fetching container status:', error);
    return { status: 'ERROR', message: 'Container not found' };
  }
}
