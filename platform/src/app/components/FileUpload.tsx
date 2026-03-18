'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { uploadFileAction } from '../actions/migration';

interface FileUploadProps {
  onUploadSuccess: (fileName: string) => void;
  onClear: () => void;
}

export default function FileUpload({ onUploadSuccess, onClear }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const result = await uploadFileAction(formData);
      if (result.success && result.fileName) {
        onUploadSuccess(result.fileName);
      } else {
        alert('Upload failed: ' + result.error);
        setFile(null);
      }
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group cursor-pointer border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-black dark:hover:border-white transition-colors"
        >
          <Upload className="w-6 h-6 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-zinc-500">Upload .sql or .csv data</span>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".sql,.csv"
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium truncate max-w-[150px]">{file.name}</span>
            {uploading && <span className="text-xs text-zinc-400 animate-pulse">(Uploading...)</span>}
          </div>
          <button onClick={handleClear} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      )}
    </div>
  );
}
