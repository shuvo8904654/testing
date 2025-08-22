import { useRef, useState, useCallback } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Upload, X, Image, Crop as CropIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface FileUploadProps {
  onFileUpload: (url: string) => void;
  acceptedTypes?: string;
  maxSizeInMB?: number;
  placeholder?: string;
  currentValue?: string;
  enableCrop?: boolean;
  cropAspect?: number;
}

export function FileUpload({
  onFileUpload,
  acceptedTypes = "image/*",
  maxSizeInMB = 5,
  placeholder = "Upload an image",
  currentValue,
  enableCrop = false,
  cropAspect = 1
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
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

    if (enableCrop && file.type.startsWith('image/')) {
      // Store original file for later reference
      setOriginalFile(file);
      // Create preview URL for cropping
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Direct upload without cropping
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
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

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50,
        },
        cropAspect,
        width,
        height
      ),
      width,
      height
    ));
  }, [cropAspect]);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: Crop): Promise<File> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a File object from the blob with proper name and type
            const fileExtension = originalFile?.type.includes('png') ? 'png' : 'jpg';
            const mimeType = originalFile?.type.includes('png') ? 'image/png' : 'image/jpeg';
            const file = new File([blob], `cropped-image-${Date.now()}.${fileExtension}`, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(file);
          }
        }, file.type.includes('png') ? 'image/png' : 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop);
        await uploadFile(croppedImageFile);
        setCropDialogOpen(false);
        setImageToCrop(null);
      } catch (error) {
        toast({
          title: "Crop failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
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
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto"
          >
            {enableCrop ? <CropIcon className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
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

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageToCrop && (
              <div className="max-h-96 overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={cropAspect}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageToCrop}
                    onLoad={onImageLoad}
                    className="max-w-full"
                  />
                </ReactCrop>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCropDialogOpen(false);
                  setImageToCrop(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop || isUploading}
              >
                {isUploading ? "Uploading..." : "Crop & Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}