import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
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
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg min-h-[400px] text-center">
            <UploadCloud className="w-16 h-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Drag and drop files here</h3>
            <p className="text-muted-foreground">or</p>
            <button className="mt-2 text-primary hover:underline">browse your files</button>
            <p className="mt-4 text-sm text-muted-foreground">
              Supports: PDF, Excel, CSV, JPG, PNG. Max file size: 50MB.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
