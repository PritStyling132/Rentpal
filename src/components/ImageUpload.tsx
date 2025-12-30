import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImages?: string[];
  userId: string;
  maxImages?: number;
}

export const ImageUpload = ({ onImagesUploaded, currentImages = [], userId, maxImages = 100 }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (previews.length + validFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload ${maxImages} images total`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload multiple images via Cloudinary
      const result = await uploadApi.uploadImages(validFiles, 'listings');
      const uploadedUrls = result.map((r: any) => r.url);

      const newPreviews = [...previews, ...uploadedUrls];
      setPreviews(newPreviews);
      onImagesUploaded(newPreviews);

      toast({
        title: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} uploaded successfully`,
        description: `${newPreviews.length}/${maxImages} images uploaded`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload some images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, [userId, previews]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    e.target.value = ''; // Reset input to allow re-uploading same files
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = previews[index];
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesUploaded(newPreviews);

    // Optionally delete from Cloudinary (fire and forget)
    try {
      await uploadApi.deleteByUrl(urlToRemove);
    } catch (error) {
      // Silently fail - image is already removed from UI
      console.error('Failed to delete image from storage:', error);
    }
  };

  return (
    <div className="space-y-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden border-2 border-border">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-all duration-300",
            isDragging ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50",
            isUploading && "opacity-50 pointer-events-none"
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drag & drop your images here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse ({previews.length}/{maxImages} images, max 10MB each)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                  <span>JPEG, PNG, WebP, or GIF</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
