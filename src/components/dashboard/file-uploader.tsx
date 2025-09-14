
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  File as FileIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { uploadAndAnalyzeRecord } from '@/lib/actions/records';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';

type FileUpload = {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
};

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FileText className="w-6 h-6 text-red-500" />;
    if (extension === 'xls' || extension === 'xlsx') return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    if (extension === 'csv') return <FileIcon className="w-6 h-6 text-blue-500" />;
    return <FileIcon className="w-6 h-6 text-muted-foreground" />;
}

const StatusBadge = ({ status }: { status: FileUpload['status'] }) => {
    switch (status) {
        case 'pending':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
        case 'uploading':
            return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Uploading...</Badge>;
        case 'completed':
            return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Uploaded</Badge>;
        case 'failed':
            return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}


export function FileUploader({ organizationName }: { organizationName: string }) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const router = useRouter();


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileUpload[] = acceptedFiles.map((file) => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/csv': ['.csv'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          toast({
            variant: 'destructive',
            title: `File Rejected: ${file.name}`,
            description: error.message,
          });
        });
      });
    },
  });

  const removeFile = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== id));
  };
    
  const handleUploads = async () => {
    if (!user || !profile || !profile.organization_id) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication failed. Please log in again.'});
        return;
    }

    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast({ title: 'No files to upload.', description: 'Please add new files before starting.' });
      return;
    }

    let allUploadsSucceeded = true;

    for (const fileUpload of pendingFiles) {
       setFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id ? { ...f, status: 'uploading', progress: 50 } : f
        )
      );
      
      try {
        const fileDataUri = await new Promise<string>((resolve, reject) => {
             const reader = new FileReader();
             reader.readAsDataURL(fileUpload.file);
             reader.onloadend = () => {
                 if (typeof reader.result !== 'string') {
                    return reject(new Error('Could not read file.'));
                }
                resolve(reader.result);
             };
             reader.onerror = (error) => reject(error);
        });

        const result = await uploadAndAnalyzeRecord(
            user.id,
            profile.organization_id,
            fileDataUri,
            fileUpload.file.name,
            profile.organization_name
        );
        
        if (result.error) {
            throw new Error(result.error);
        }

        setFiles((prev) => prev.map((f) => f.id === fileUpload.id ? { ...f, status: 'completed', progress: 100 } : f));
        toast({
            variant: 'default',
            title: `Upload Complete: ${fileUpload.file.name}`,
            description: "The file is now available in your records."
        });

      } catch (error: any) {
        allUploadsSucceeded = false;
        setFiles(prev => prev.map(f => f.id === fileUpload.id ? { ...f, status: 'failed', error: error.message } : f));
        toast({
            variant: 'destructive',
            title: `Upload Failed: ${fileUpload.file.name}`,
            description: error.message || "An unknown error occurred."
        });
      }
    }

    if (allUploadsSucceeded) {
      toast({
        title: 'All Uploads Complete',
        description: 'You can now find your files on the Records page.',
        action: <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard/records')}>Go to Records</Button>
      });
      // Clear the queue after a short delay on full success
      setTimeout(() => {
        setFiles([]);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
            style={{ minHeight: '300px' }}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, Excel, CSV (Max 50MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">File Queue</h3>
            <div className="space-y-3">
              {files.map((fileUpload) => (
                <div key={fileUpload.id} className="p-3 border rounded-lg flex items-center gap-4">
                  {getFileIcon(fileUpload.file.name)}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">{fileUpload.file.name}</p>
                        <StatusBadge status={fileUpload.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {(fileUpload.status === 'uploading') && (
                      <Progress value={fileUpload.progress} className="h-2 mt-1" />
                    )}
                     {fileUpload.status === 'failed' && fileUpload.error && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                           <AlertCircle size={14} />
                            Error: {fileUpload.error.substring(0, 100)}...
                        </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(fileUpload.id)}
                    disabled={fileUpload.status === 'uploading'}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
             <Button onClick={handleUploads} disabled={files.every(f => f.status !== 'pending')} className="w-full">
              Upload {files.filter(f => f.status === 'pending').length} file(s)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
