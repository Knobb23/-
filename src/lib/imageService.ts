/**
 * Image Service
 * Handles client-side WebP compression, aspect-ratio cropping, and uploading
 * to Cloudinary (unsigned) or Firebase Storage with graceful fallbacks.
 */

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/src/lib/firebase";
import { IMAGE_PROVIDER } from "@/src/config/site";
import { ImageAsset } from "@/src/types";

export type ImageCategory = "hero" | "cover" | "gallery" | "news" | "event" | "person" | "avatar" | "attachment";

export interface UploadOptions {
  folder?: string;
  category?: ImageCategory;
  alt?: string;
  onProgress?: (progress: number, stage: "compressing" | "uploading") => void;
}

/**
 * Maximum dimensions per category as per specification:
 * 1920px: hero, cover, gallery
 * 1200px: news, event, attachment
 * 600px: person, avatar
 */
export function getMaxDimension(category: ImageCategory = "news"): number {
  switch (category) {
    case "hero":
    case "cover":
    case "gallery":
      return 1920;
    case "person":
    case "avatar":
      return 600;
    case "attachment":
    case "news":
    case "event":
    default:
      return 1200;
  }
}

/**
 * Compresses an image file before upload using browser-image-compression (Web Worker).
 * Target: WebP format, quality 0.82, max dimension 1920/1200/600px, target size <= 400KB (or 300KB for attachments).
 */
export async function compressImageFile(
  file: File,
  category: ImageCategory = "news",
  onProgress?: (progress: number) => void
): Promise<File> {
  // Validate file size up to 15MB
  const maxInitialSize = 15 * 1024 * 1024;
  if (file.size > maxInitialSize) {
    throw new Error(`ไฟล์ภาพมีขนาดใหญ่เกินไป (${(file.size / (1024 * 1024)).toFixed(1)}MB) กรุณาใช้ไฟล์ขนาดไม่เกิน 15MB`);
  }

  // Validate allowed mime types
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์ภาพนามสกุล JPG, PNG หรือ WebP เท่านั้น");
  }

  const maxDimension = getMaxDimension(category);
  const targetSizeMB = category === "attachment" ? 0.3 : 0.4; // <= 300KB or <= 400KB

  const options = {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: maxDimension,
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.82,
    onProgress: (p: number) => {
      if (onProgress) onProgress(p);
    },
  };

  try {
    const compressed = await imageCompression(file, options);
    // Ensure WebP extension
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([compressed], `${baseName}.webp`, { type: "image/webp" });
  } catch (error) {
    console.warn("browser-image-compression fallback to original:", error);
    return file;
  }
}

/**
 * Measures the natural width and height of an image file or URL.
 */
export function getImageDimensions(fileOrUrl: File | string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);

    img.onload = () => {
      resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
      if (typeof fileOrUrl !== "string") {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      resolve({ width: 1200, height: 800 });
      if (typeof fileOrUrl !== "string") {
        URL.revokeObjectURL(url);
      }
    };

    img.src = url;
  });
}

/**
 * Converts a file to base64 Data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image using Cloudinary (unsigned) or Firebase Storage according to IMAGE_PROVIDER.
 * Automatically compresses to WebP, measures dimensions, and returns an ImageAsset.
 */
export async function uploadImage(file: File, options?: UploadOptions): Promise<ImageAsset> {
  const category = options?.category || "news";
  const alt = (options?.alt || file.name.replace(/\.[^/.]+$/, "")).trim();
  const folder = options?.folder || "desup_uploads";

  // Step 1: Compress image
  options?.onProgress?.(10, "compressing");
  const compressedFile = await compressImageFile(file, category, (p) => {
    const stageProgress = 10 + Math.round((p / 100) * 40); // 10% - 50%
    options?.onProgress?.(stageProgress, "compressing");
  });

  // Step 2: Get dimensions
  const dimensions = await getImageDimensions(compressedFile);

  // Step 3: Upload based on provider
  options?.onProgress?.(50, "uploading");

  const cloudinaryCloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const cloudinaryPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Provider: Cloudinary (default)
  if (IMAGE_PROVIDER === "cloudinary" && cloudinaryCloudName && cloudinaryPreset) {
    try {
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", cloudinaryPreset);
      formData.append("folder", folder);

      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise<{ secure_url: string; width?: number; height?: number }>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const uploadPercent = 50 + Math.round((e.loaded / e.total) * 50); // 50% - 100%
            options?.onProgress?.(uploadPercent, "uploading");
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve({
                secure_url: res.secure_url,
                width: res.width || dimensions.width,
                height: res.height || dimensions.height,
              });
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Cloudinary network error"));
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`);
        xhr.send(formData);
      });

      const result = await uploadPromise;
      return {
        url: result.secure_url,
        width: result.width || dimensions.width,
        height: result.height || dimensions.height,
        alt,
        size: compressedFile.size,
      };
    } catch (error) {
      console.warn("Cloudinary upload failed, checking fallbacks:", error);
    }
  }

  // Provider: Firebase Storage
  if (IMAGE_PROVIDER === "firebase" || (!cloudinaryCloudName && storage)) {
    try {
      const cleanName = compressedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${folder}/${Date.now()}_${cleanName}`;
      const storageReference = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageReference, compressedFile, {
        contentType: compressedFile.type,
      });

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = 50 + Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 50);
            options?.onProgress?.(progress, "uploading");
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      return {
        url: downloadUrl,
        width: dimensions.width,
        height: dimensions.height,
        alt,
        size: compressedFile.size,
      };
    } catch (error) {
      console.warn("Firebase Storage upload failed, falling back to data URL:", error);
    }
  }

  // Fallback: If neither cloud provider is configured, encode to compressed Data URL
  // Ensures zero broken states during preview or before keys are entered.
  const dataUrl = await fileToDataUrl(compressedFile);
  options?.onProgress?.(100, "uploading");

  return {
    url: dataUrl,
    width: dimensions.width,
    height: dimensions.height,
    alt,
    size: compressedFile.size,
  };
}

/**
 * Optimizes an image URL for display:
 * If Cloudinary, injects f_auto,q_auto,w_${width} parameters.
 */
export function getOptimizedImageUrl(
  url: string,
  options?: { width?: number; quality?: string | number; format?: string }
): string {
  if (!url) return "";

  // Cloudinary transform injection
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const widthParam = options?.width ? `w_${options.width},` : "";
    const qualityParam = options?.quality ? `q_${options.quality},` : "q_auto,";
    const formatParam = options?.format ? `f_${options.format}` : "f_auto";
    const transform = `${widthParam}${qualityParam}${formatParam}`;

    return url.replace("/upload/", `/upload/${transform}/`);
  }

  return url;
}
