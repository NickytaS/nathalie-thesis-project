'use client';

import { useState, useEffect } from 'react';
import { startMigrationAction, checkStatusAction } from '../actions/migration';
import { Play, Loader2, CheckCircle2, XCircle, Database } from 'lucide-react';
import FileUpload from './FileUpload';

export default function MigrationTrigger({ dbName, isCustom = false }: { dbName: string, isCustom?: boolean }) {
  const [containerId, setContainerId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [loading, setLoading] = useState(false);
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setStatus('starting');
    const result = await startMigrationAction(dbName, customFileName || undefined);
    if (result.success && result.containerId) {
      setContainerId(result.containerId);
      setStatus('running');
    } else {
      setStatus('error');
    }
    setLoading(false);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'running' && containerId) {
      interval = setInterval(async () => {
        const stats = await checkStatusAction(containerId);
        if (stats.status === 'exited') {
          setStatus(stats.exitCode === 0 ? 'success' : 'failed');
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, containerId]);

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-xl bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Database className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold capitalize">{dbName.replace('_', ' ')}</h3>
            <p className="text-xs text-zinc-500">{isCustom ? "Custom Tooling" : "MySQL → PostgreSQL"}</p>
          </div>
        </div>
        
        <button
          onClick={handleStart}
          disabled={loading || status === 'running'}
          className={`h-10 px-4 rounded-lg flex items-center gap-2 transition-all text-sm font-semibold ${
            status === 'running' 
              ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
              : 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-50'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {status === 'running' ? 'Running' : 'Start'}
        </button>
      </div>

      {isCustom && (
        <div className="pt-2">
          <FileUpload 
            onUploadSuccess={(name) => setCustomFileName(name)} 
            onClear={() => setCustomFileName(null)} 
          />
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase text-zinc-400">Status:</span>
        <div className="flex items-center gap-1.5">
          {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
          {status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          <span className={`text-sm font-medium ${
            status === 'success' ? 'text-green-600' : 
            status === 'failed' ? 'text-red-600' : 
            status === 'running' ? 'text-blue-600' : 
            'text-zinc-600'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
