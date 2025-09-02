
'use client';

import {useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {createClient} from '@/lib/supabase/client';
import {Loader2, UploadCloud, File as FileIcon, CheckCircle, AlertCircle} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {useRouter} from 'next/navigation';
import {createFinancialRecord, getSignedUrl} from '@/app/actions/records';
import {v4 as uuidv4} from 'uuid';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
];

type UploadableFile = {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
};

export default function UploadPage() {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const {toast} = useToast();
  const router = useRouter();
  const supabase = createClient();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach(({errors}) => {
        errors.forEach((err: any) => {
          toast({
            title: 'File Error',
            description: err.message,
            variant: 'destructive',
          });
        });
      });
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [toast]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });

  const handleUpload = async () => {
    if (files.some(f => f.status === 'uploading')) return;

    setIsUploading(true);

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) {
      toast({title: 'Not authenticated', variant: 'destructive'});
      setIsUploading(false);
      return;
    }
    
    const {data: profile} = await supabase.from('profiles').select('organization_id').single();
    if (!profile || !profile.organization_id) {
        toast({title: 'Organization not found for user.', variant: 'destructive'});
        setIsUploading(false);
        return;
    }

    const uploadPromises = files
      .filter(f => f.status === 'pending')
      .map(async uploadableFile => {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadableFile.id ? {...f, status: 'uploading'} : f
          )
        );
        try {
          const {file} = uploadableFile;
          
          const {url, path} = await getSignedUrl({
            fileType: file.type,
            fileSize: file.size,
            organizationId: profile.organization_id!,
          });
          
          const {error: uploadError} = await supabase.storage
            .from('financial-records')
            .uploadToSignedUrl(path, url.token, file, {
              upsert: true,
               onUploadProgress: (progress) => {
                 const percentage = (progress.loaded / progress.total) * 100;
                 setFiles(prev =>
                    prev.map(f =>
                        f.id === uploadableFile.id ? {...f, progress: percentage} : f
                    )
                 );
               }
            });

          if (uploadError) throw new Error(uploadError.message);

          await createFinancialRecord({
            organization_id: profile.organization_id!,
            file_name: file.name,
            file_path: path,
            file_type: file.type,
            file_size: file.size,
          });

          setFiles(prev =>
            prev.map(f =>
              f.id === uploadableFile.id
                ? {...f, status: 'success', progress: 100}
                : f
            )
          );
        } catch (error: any) {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadableFile.id
                ? {...f, status: 'error', error: error.message}
                : f
            )
          );
        }
      });

    await Promise.all(uploadPromises);
    setIsUploading(false);
    toast({
        title: "Uploads Complete",
        description: "Successfully processed all pending files.",
    })
    router.push('/dashboard/records');
    router.refresh();
  };
  
   const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Upload Financial Records</h1>
        <p className="text-muted-foreground">
          Drag and drop your files or browse to upload. Analysis will begin automatically.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>File Uploader</CardTitle>
          <CardDescription>
            Supported formats: PDF, Excel, CSV, JPG, PNG. Max file size: 50MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg min-h-[300px] text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-16 h-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {isDragActive ? 'Drop the files here...' : 'Drag and drop files here'}
            </h3>
            <p className="text-muted-foreground">or</p>
            <Button type="button" variant="link" className="mt-2 text-primary hover:underline">
              browse your files
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Selected Files</h3>
              <div className="space-y-2">
                {files.map(uploadableFile => (
                  <div key={uploadableFile.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{uploadableFile.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadableFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="w-1/3 mx-4">
                      {uploadableFile.status === 'uploading' && (
                         <Progress value={uploadableFile.progress} />
                      )}
                      {uploadableFile.status === 'success' && (
                          <div className="flex items-center text-green-600">
                             <CheckCircle className="h-4 w-4 mr-2" /> Complete
                          </div>
                      )}
                      {uploadableFile.status === 'error' && (
                           <div className="flex items-center text-destructive" title={uploadableFile.error}>
                             <AlertCircle className="h-4 w-4 mr-2" /> Error
                          </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(uploadableFile.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setFiles([])} disabled={isUploading}>Clear All</Button>
                <Button onClick={handleUpload} disabled={isUploading || files.every(f => f.status !== 'pending')}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Upload {files.filter(f => f.status === 'pending').length} File(s)
                </Button>
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
