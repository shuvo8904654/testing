import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  File,
  Camera,
  Folder,
  Eye,
  Download,
  Share2
} from "lucide-react";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
});

type UploadData = z.infer<typeof uploadSchema>;

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  url?: string;
  error?: string;
  metadata?: {
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
  };
}

export default function ImageUploadManager() {
  const { toast } = useToast();
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [showBatchUpload, setShowBatchUpload] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: UploadData }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', metadata.title);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.category) formData.append('category', metadata.category);
      if (metadata.tags) formData.append('tags', metadata.tags);

      // Simulate upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploads(prev => prev.map(upload => 
              upload.file === file 
                ? { ...upload, progress, status: 'uploading' }
                : upload
            ));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setUploads(prev => prev.map(upload => 
              upload.file === file 
                ? { ...upload, status: 'completed', url: response.url, progress: 100 }
                : upload
            ));
            resolve(response);
          } else {
            const error = `Upload failed: ${xhr.statusText}`;
            setUploads(prev => prev.map(upload => 
              upload.file === file 
                ? { ...upload, status: 'error', error }
                : upload
            ));
            reject(new Error(error));
          }
        };

        xhr.onerror = () => {
          const error = 'Network error during upload';
          setUploads(prev => prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'error', error }
              : upload
          ));
          reject(new Error(error));
        };

        xhr.open('POST', '/api/images/upload');
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Image uploaded successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newUploads: UploadFile[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: 'pending',
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          description: "",
          category: "general",
          tags: [],
        }
      }));

    setUploads(prev => [...prev, ...newUploads]);
    
    if (newUploads.length > 0) {
      toast({
        title: `${newUploads.length} image(s) ready to upload`,
        description: "Add titles and descriptions, then upload.",
      });
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const uploadFile = async (upload: UploadFile) => {
    if (!upload.metadata) return;
    
    setUploads(prev => prev.map(u => 
      u.id === upload.id ? { ...u, status: 'uploading' } : u
    ));

    try {
      await uploadMutation.mutateAsync({
        file: upload.file,
        metadata: upload.metadata
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const uploadAllPending = async () => {
    const pendingUploads = uploads.filter(u => u.status === 'pending');
    
    for (const upload of pendingUploads) {
      if (upload.metadata?.title) {
        await uploadFile(upload);
        // Add small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return <File className="h-4 w-4 text-gray-500" />;
      case 'uploading': return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'processing': return <ImageIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
    }
  };

  const pendingCount = uploads.filter(u => u.status === 'pending').length;
  const completedCount = uploads.filter(u => u.status === 'completed').length;
  const errorCount = uploads.filter(u => u.status === 'error').length;

  return (
    <div className="space-y-6" data-testid="image-upload-manager">
      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Uploading</p>
                <p className="text-2xl font-bold">{uploads.filter(u => u.status === 'uploading').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Image Upload
            </span>
            {pendingCount > 0 && (
              <Button onClick={uploadAllPending} disabled={uploadMutation.isPending}>
                <Upload className="h-4 w-4 mr-2" />
                Upload All ({pendingCount})
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop images here or click to select
            </h3>
            <p className="text-gray-600 mb-4">
              Support for JPG, PNG, GIF up to 5MB each
            </p>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            
            <label htmlFor="file-upload">
              <Button asChild className="cursor-pointer">
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Images
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload Queue ({uploads.length})</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setUploads([])}
                disabled={uploads.some(u => u.status === 'uploading')}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {uploads.map((upload) => (
              <UploadItem
                key={upload.id}
                upload={upload}
                onUpdate={(id, updates) => {
                  setUploads(prev => prev.map(u => 
                    u.id === id ? { ...u, ...updates } : u
                  ));
                }}
                onRemove={() => removeUpload(upload.id)}
                onUpload={() => uploadFile(upload)}
                onView={() => setSelectedFile(upload)}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.metadata?.title}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <img 
                src={selectedFile.url || URL.createObjectURL(selectedFile.file)}
                alt={selectedFile.metadata?.title}
                className="w-full max-h-96 object-contain rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File size:</span> {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div>
                  <span className="font-medium">Dimensions:</span> {selectedFile.file.type}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Description:</span> {selectedFile.metadata?.description || 'No description'}
                </div>
              </div>
              {selectedFile.url && (
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={selectedFile.url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadItem({ 
  upload, 
  onUpdate, 
  onRemove, 
  onUpload, 
  onView,
  getStatusIcon,
  getStatusColor 
}: {
  upload: UploadFile;
  onUpdate: (id: string, updates: Partial<UploadFile>) => void;
  onRemove: () => void;
  onUpload: () => void;
  onView: () => void;
  getStatusIcon: (status: UploadFile['status']) => React.ReactNode;
  getStatusColor: (status: UploadFile['status']) => string;
}) {
  const form = useForm<UploadData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: upload.metadata?.title || "",
      description: upload.metadata?.description || "",
      category: upload.metadata?.category || "general",
      tags: upload.metadata?.tags?.join(", ") || "",
    },
  });

  const handleFormChange = (data: UploadData) => {
    onUpdate(upload.id, {
      metadata: {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
      }
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <img 
            src={upload.url || URL.createObjectURL(upload.file)}
            alt={upload.metadata?.title}
            className="w-full h-full object-cover rounded cursor-pointer"
            onClick={onView}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white shadow-md rounded-full"
            onClick={onRemove}
            disabled={upload.status === 'uploading'}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(upload.status)}>
              {getStatusIcon(upload.status)}
              <span className="ml-1 capitalize">{upload.status}</span>
            </Badge>
            <span className="text-sm text-gray-500">
              {(upload.file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-8 text-sm"
                        onChange={(e) => {
                          field.onChange(e);
                          handleFormChange({ ...form.getValues(), title: e.target.value });
                        }}
                        disabled={upload.status === 'uploading' || upload.status === 'completed'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Category</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-8 text-sm"
                        onChange={(e) => {
                          field.onChange(e);
                          handleFormChange({ ...form.getValues(), category: e.target.value });
                        }}
                        disabled={upload.status === 'uploading' || upload.status === 'completed'}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="text-sm resize-none"
                      rows={2}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFormChange({ ...form.getValues(), description: e.target.value });
                      }}
                      disabled={upload.status === 'uploading' || upload.status === 'completed'}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>

          {/* Progress Bar */}
          {upload.status === 'uploading' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{upload.progress}%</span>
              </div>
              <Progress value={upload.progress} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {upload.status === 'error' && upload.error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {upload.error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {upload.status === 'pending' && (
              <Button 
                size="sm" 
                onClick={onUpload}
                disabled={!upload.metadata?.title}
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
            )}
            
            {upload.status === 'completed' && (
              <Button size="sm" variant="outline" onClick={onView}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            
            {upload.status === 'error' && (
              <Button size="sm" variant="outline" onClick={onUpload}>
                <Upload className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}