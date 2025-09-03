
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileBarChart2,
  Download,
  Trash2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/use-auth-context';
import { createClient } from '@/lib/supabase/client';
import { createFinancialRecord, runComplianceCheck } from '@/app/actions/records';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

type UploadableFile = {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'analyzing' | 'success' | 'error';
  error?: string;
};

const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('xls')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    if (fileType.includes('csv')) return <FileBarChart2 className="h-6 w-6 text-blue-500" />;
    if (fileType.includes('image')) return <FileImage className="h-6 w-6 text-purple-500" />;
    return <FileIcon className="h-6 w-6 text-gray-500" />;
}

const getStatusBadge = (status: 'processing' | 'completed' | 'failed') => {
    const variants = {
        processing: { className: "bg-orange-100 text-orange-800", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
        completed: { className: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
        failed: { className: "bg-red-100 text-red-800", icon: <X className="h-3 w-3" /> }
    }
    const variant = variants[status];
    return (
        <Badge className={cn("capitalize gap-1", variant.className)}>
            {variant.icon}
            {status}
        </Badge>
    )
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  const supabase = createClient();

  const fetchRecentUploads = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) {
        toast({ title: "Error fetching uploads", description: error.message, variant: "destructive" });
    } else {
        setRecentUploads(data);
    }
  }, [profile, supabase, toast]);

  useState(() => {
    fetchRecentUploads();
  });

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((err) => {
          toast({
            title: `Error with ${file.name}`,
            description: err.message,
            variant: 'destructive',
          });
        });
      });
    }

    const newFiles: UploadableFile[] = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles.filter(nf => !prev.some(ef => ef.file.name === nf.file.name))]);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
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
  
  const dropzoneClassName = useMemo(() => cn(
    'flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg min-h-[300px] w-full max-w-2xl mx-auto text-center cursor-pointer transition-colors duration-300',
    isDragAccept && 'border-green-500 bg-green-50',
    isDragReject && 'border-red-500 bg-red-50',
    isDragActive && 'border-primary bg-primary/10',
    !isDragActive && 'border-border hover:border-primary'
  ), [isDragActive, isDragAccept, isDragReject]);

  const handleUpload = async () => {
    if (!profile) {
        toast({ title: 'Error', description: 'You must be logged in to upload files.', variant: 'destructive' });
        return;
    }
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    const uploadPromises = pendingFiles.map(async (uploadableFile) => {
        setFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: 'uploading' } : f));
        const filePath = `${profile.organization_id}/${profile.id}/${uuidv4()}-${uploadableFile.file.name}`;
        
        const { error: uploadError } = await supabase.storage
            .from('financial-records')
            .upload(filePath, uploadableFile.file, {
                cacheControl: '3600',
                upsert: false,
                contentType: uploadableFile.file.type,
            });

        if (uploadError) {
             setFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: 'error', error: uploadError.message } : f));
             return;
        }

        setFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, progress: 100, status: 'analyzing' } : f));

        const record = await createFinancialRecord({
            organization_id: profile.organization_id!,
            file_name: uploadableFile.file.name,
            file_path: filePath,
            file_type: uploadableFile.file.type,
            file_size: uploadableFile.file.size,
        });

        await runComplianceCheck({
            recordId: record.id,
            filePath: filePath,
            fileType: uploadableFile.file.type,
        });

        setFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: 'success' } : f));
    });
    
    await Promise.all(uploadPromises);
    setIsUploading(false);
    toast({
        title: "Upload Complete",
        description: `Processing finished for ${pendingFiles.length} file(s).`
    })
    setFiles(prev => prev.filter(f => f.status !== 'success'));
    fetchRecentUploads(); // Refresh the list
  };
  
  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };
  
  const clearQueue = () => {
    setFiles([]);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Upload Financial Records</h1>
        <p className="text-muted-foreground">
          Upload your financial documents for automated analysis and audit reporting.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div {...getRootProps({ className: dropzoneClassName })}>
            <input {...getInputProps()} />
            <UploadCloud className={`w-16 h-16 text-muted-foreground transition-colors ${isDragActive ? 'text-primary' : ''}`} />
            <h3 className="mt-4 text-lg font-semibold">
              {isDragActive ? 'Drop the files here...' : 'Drag and drop files here'}
            </h3>
            <p className="text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">Maximum file size: 50MB</p>
          </div>
        </CardContent>
      </Card>
      
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue ({files.filter(f => f.status === 'pending').length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {files.map(uploadableFile => (
                  <div key={uploadableFile.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {getFileIcon(uploadableFile.file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{uploadableFile.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadableFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="w-1/3 mx-4">
                        {(uploadableFile.status === 'uploading' || uploadableFile.status === 'success' || uploadableFile.status === 'analyzing') && (
                           <Progress value={uploadableFile.progress} className="h-2" />
                        )}
                        {uploadableFile.status === 'success' && <div className="flex items-center text-sm text-green-600 mt-1"><CheckCircle className="h-4 w-4 mr-1" />Success</div>}
                         {uploadableFile.status === 'analyzing' && <div className="flex items-center text-sm text-blue-600 mt-1"><Loader2 className="h-4 w-4 mr-1 animate-spin" />Analyzing...</div>}
                        {uploadableFile.status === 'error' && <div className="flex items-center text-sm text-destructive mt-1"><AlertCircle className="h-4 w-4 mr-1" />{uploadableFile.error}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(uploadableFile.id)}
                      disabled={isUploading && uploadableFile.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
             <div className="flex justify-end gap-2 pt-4 border-t">
               <Button variant="outline" onClick={clearQueue} disabled={isUploading}>Clear Queue</Button>
              <Button onClick={handleUpload} disabled={isUploading || !files.some(f => f.status === 'pending')}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Upload {files.filter(f => f.status === 'pending').length} File(s)
              </Button>
             </div>
          </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Advanced Options</AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                        <div className="space-y-2">
                            <Label htmlFor="org-folder">Organization Folder</Label>
                            <Select>
                                <SelectTrigger id="org-folder">
                                    <SelectValue placeholder="Select a folder" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="acme-corp">Acme Corporation</SelectItem>
                                    <SelectItem value="innovate-llc">Innovate LLC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doc-category">Document Category</Label>
                            <Select>
                                <SelectTrigger id="doc-category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invoices">Invoices</SelectItem>
                                    <SelectItem value="receipts">Receipts</SelectItem>
                                    <SelectItem value="statements">Statements</SelectItem>
                                    <SelectItem value="reports">Reports</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Add Tags</Label>
                            <Input id="tags" placeholder="e.g., Q3, financials, urgent" />
                        </div>
                        <div className="space-y-2">
                             <Label>Priority Level</Label>
                             <RadioGroup defaultValue="normal" className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="normal" id="normal" />
                                    <Label htmlFor="normal">Normal</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="high" id="high" />
                                    <Label htmlFor="high">High</Label>
                                </div>
                             </RadioGroup>
                        </div>
                         <div className="col-span-1 md:col-span-2 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="auto-analysis" defaultChecked />
                                <Label htmlFor="auto-analysis">Start analysis immediately after upload</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="email-notification" />
                                <Label htmlFor="email-notification">Email me when analysis is complete</Label>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Uploads</CardTitle>
                    <CardDescription>Review your recently uploaded documents.</CardDescription>
                </div>
                 <Button variant="outline" size="sm" onClick={fetchRecentUploads}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentUploads.map(file => (
                            <TableRow key={file.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    {getFileIcon(file.file_type || '')}
                                    {file.file_name}
                                </TableCell>
                                <TableCell>{(file.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                                <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{getStatusBadge(file.status as any)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
