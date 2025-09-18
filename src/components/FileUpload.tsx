import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, File, FileText, X, Check, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (type.includes('powerpoint') || type.includes('presentation')) return <FileText className="w-4 h-4 text-orange-500" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  const simulateUpload = async (file: File): Promise<UploadedFile> => {
    const uploadFile: UploadedFile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, uploadFile]);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, progress } : f
      ));
    }

    // Simulate processing
    setUploadedFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'processing', progress: 100 } : f
    ));

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success (90% chance) or error (10% chance)
    const isSuccess = Math.random() > 0.1;
    
    const finalFile: UploadedFile = {
      ...uploadFile,
      status: isSuccess ? 'success' : 'error',
      error: isSuccess ? undefined : 'Failed to process document. Please try again.'
    };

    setUploadedFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? finalFile : f
    ));

    if (isSuccess) {
      toast.success(`${file.name} added to knowledge base`);
    } else {
      toast.error(`Failed to upload ${file.name}`);
    }

    return finalFile;
  };

  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      if (!Object.keys(acceptedTypes).includes(file.type)) {
        toast.error(`${file.name} is not a supported file type.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const uploadPromises = validFiles.map(file => simulateUpload(file));
      const results = await Promise.all(uploadPromises);
      onUploadComplete?.(results);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 w-96"
    >
      <Card className="shadow-xl border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <h3 className="text-lg">Upload Documents</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className={`w-8 h-8 mx-auto mb-3 ${
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <p className="text-sm mb-2">
              Drop files here or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, DOCX, TXT, MD, PPT, PPTX (max 10MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={Object.values(acceptedTypes).join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />

          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uploaded Files ({uploadedFiles.length})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs h-6 px-2"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-muted/50 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm truncate">{file.name}</p>
                            <Badge
                              variant={
                                file.status === 'success' ? 'default' :
                                file.status === 'error' ? 'destructive' :
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {file.status === 'uploading' ? 'Uploading' :
                               file.status === 'processing' ? 'Processing' :
                               file.status === 'success' ? 'Added' : 'Failed'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {formatFileSize(file.size)}
                          </p>
                          
                          {file.status === 'uploading' && (
                            <Progress value={file.progress} className="h-1" />
                          )}
                          
                          {file.status === 'processing' && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border border-primary border-t-transparent rounded-full"
                              />
                              Extracting content...
                            </div>
                          )}
                          
                          {file.error && (
                            <p className="text-xs text-destructive mt-1">
                              {file.error}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {file.status === 'success' && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="h-6 w-6 p-0 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}