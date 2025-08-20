import { useRef, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (url: string) => void;
  acceptedTypes?: string;
  maxSizeInMB?: number;
  placeholder?: string;
  currentValue?: string;
}

export function FileUpload({
  onFileUpload,
  acceptedTypes = "image/*",
  maxSizeInMB = 5,
  placeholder = "Upload an image",
  currentValue
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSizeInMB}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setPreview(data.url);
      onFileUpload(data.url);
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setPreview(null);
    onFileUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full sm:w-auto"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : placeholder}
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={clearFile}
            className="px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {preview && (
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 border rounded-lg overflow-hidden bg-gray-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}