"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { toast } from "sonner";

interface UseImageUploadProps {
  onUploadComplete?: (storageId: Id<"_storage">, url: string) => void;
  initialPreviewUrl?: string;
}

export function useImageUpload({ onUploadComplete, initialPreviewUrl }: UseImageUploadProps = {}) {
  const generateUploadUrl = useMutation(api.functions.storage.generateUploadUrl);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);

  useEffect(() => {
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [initialPreviewUrl]);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context not available"));

        // Max dimensions
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob (AVIF if supported, else WebP)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
               // Fallback to WebP
               canvas.toBlob(
                   (blobWebP) => {
                       if (blobWebP) resolve(blobWebP);
                       else reject(new Error("Compression failed"));
                   },
                   "image/webp",
                   0.8
               )
            }
          },
          "image/avif",
          0.8
        );
      };
      
      reader.readAsDataURL(file);
    });
  };

  const uploadToConvex = async (file: File) => {
    setIsUploading(true);
    try {
        // 1. Generate Upload URL
        const postUrl = await generateUploadUrl();
        
        // 2. Compress
        const compressedBlob = await compressImage(file);
        
        // 3. POST to Convex
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": compressedBlob.type },
            body: compressedBlob,
        });

        if (!result.ok) throw new Error("Upload failed");
        
        const { storageId } = await result.json();
        setStorageId(storageId);
        
        // Use the object URL for preview immediately
        const objectUrl = URL.createObjectURL(compressedBlob);
        setPreviewUrl(objectUrl);
        
        onUploadComplete?.(storageId, objectUrl);
        toast.success("Image uploaded");
        
    } catch (error) {
        console.error(error);
        toast.error("Failed to upload image");
    } finally {
        setIsUploading(false);
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);
        await uploadToConvex(file);
      }
    },
    [generateUploadUrl, onUploadComplete]
  );

  const handleRemove = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    setStorageId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isUploading,
    storageId
  };
}