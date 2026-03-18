'use server';

import { triggerPgLoader, getJobStatus, createCustomPgLoadConfig } from '@/lib/docker-orchestrator';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, file.name);
    fs.writeFileSync(filePath, buffer);

    return { success: true, fileName: file.name };
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, error: String(error) };
  }
}

export async function startMigrationAction(dbName: string, customFileName?: string) {
  try {
    let containerConfigPath: string;
    let isCustom = false;

    if (customFileName) {
      // Create a custom config that points to the uploaded file
      const customConfigName = await createCustomPgLoadConfig(customFileName, `${dbName}_custom`);
      containerConfigPath = `/uploads/${customConfigName}`;
      isCustom = true;
    } else {
      // Use existing static configs
      const configFileName = `pgloader_${dbName}.conf`;
      containerConfigPath = `/config/pgloader/${configFileName}`;
    }

    const containerId = await triggerPgLoader(dbName, containerConfigPath, isCustom ? customFileName : undefined);
    
    revalidatePath('/');
    return { success: true, containerId };
  } catch (error) {
    console.error('Action Error:', error);
    return { success: false, error: String(error) };
  }
}

export async function checkStatusAction(containerId: string) {
  return await getJobStatus(containerId);
}
