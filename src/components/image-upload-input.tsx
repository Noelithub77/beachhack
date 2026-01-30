"use client";

import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { Id } from "@/../convex/_generated/dataModel";

interface ImageUploadInputProps {
  initialPreviewUrl?: string;
  onUploadComplete: (storageId: Id<"_storage">, url: string) => void;
  onRemove: () => void;
  className?: string;
}

export function ImageUploadInput({
  initialPreviewUrl,
  onUploadComplete,
  onRemove,
  className,
}: ImageUploadInputProps) {
  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isUploading,
  } = useImageUpload({
    onUploadComplete,
    initialPreviewUrl,
  });

  const handleClear = () => {
    handleRemove();
    onRemove();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div
          onClick={handleThumbnailClick}
          className={`
            relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted
            ${isUploading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          {previewUrl ? (
            <div className="relative h-full w-full">
               {/* Using standard img tag for preview blobs to avoid Next.js domain config issues with blob: URLs */}
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 p-2 text-center text-xs text-muted-foreground">
              <Upload className="h-6 w-6" />
              <span>Upload Image</span>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleThumbnailClick}
                disabled={isUploading}
            >
                {previewUrl ? "Change Image" : "Select Image"}
            </Button>
            {previewUrl && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleClear}
                    disabled={isUploading}
                >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                </Button>
            )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
