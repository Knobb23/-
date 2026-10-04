import React, { useState, useRef } from "react";
import {
  UploadSimple,
  Camera,
  Trash,
  Crop,
  Star,
  CaretLeft,
  CaretRight,
  Sparkle,
  Image as ImageIcon,
  CheckCircle,
  WarningCircle,
  FileImage,
} from "@phosphor-icons/react";
import { ImageAsset, normalizeImageAsset } from "@/src/types";
import { uploadImage, ImageCategory, getOptimizedImageUrl } from "@/src/lib/imageService";
import { ImageCropModal } from "./ImageCropModal";

export interface ImageUploaderProps {
  value?: ImageAsset | ImageAsset[] | string | string[];
  onChange: (val: any) => void;
  multiple?: boolean;
  category?: ImageCategory;
  folder?: string;
  label?: string;
  helperText?: string;
  aspectRatio?: number;
  requiredAlt?: boolean;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  multiple = false,
  category = "news",
  folder = "desup_uploads",
  label = "อัปโหลดรูปภาพ",
  helperText,
  aspectRatio = 16 / 9,
  requiredAlt = true,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<"compressing" | "uploading">("compressing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cropper Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetSrc, setCropTargetSrc] = useState<string>("");
  const [cropTargetName, setCropTargetName] = useState<string>("");
  const [cropTargetAlt, setCropTargetAlt] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Normalize initial values to array of ImageAsset
  const assets: ImageAsset[] = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => normalizeImageAsset(item));
    }
    return [normalizeImageAsset(value)];
  }, [value]);

  const currentSingleAsset = assets[0] || null;

  // Process files (single or multiple)
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0 || disabled) return;
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    const fileList = Array.from(files);

    try {
      const newAssets: ImageAsset[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const defaultAlt = file.name.replace(/\.[^/.]+$/, "");

        const asset = await uploadImage(file, {
          folder,
          category,
          alt: defaultAlt,
          onProgress: (p, stage) => {
            const overallProgress = Math.round(((i + p / 100) / fileList.length) * 100);
            setUploadProgress(overallProgress);
            setUploadStage(stage);
          },
        });

        newAssets.push(asset);
        if (!multiple) break; // Take first if single mode
      }

      if (multiple) {
        onChange([...assets, ...newAssets]);
      } else {
        onChange(newAssets[0]);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Open Cropper
  const handleOpenCropper = (asset: ImageAsset) => {
    setCropTargetSrc(asset.url);
    setCropTargetName("image.webp");
    setCropTargetAlt(asset.alt || "");
    setCropModalOpen(true);
  };

  // Finish Cropper
  const handleCroppedFile = async (croppedFile: File) => {
    setCropModalOpen(false);
    setIsUploading(true);
    try {
      const newAsset = await uploadImage(croppedFile, {
        folder,
        category,
        alt: cropTargetAlt,
        onProgress: (p, stage) => {
          setUploadProgress(p);
          setUploadStage(stage);
        },
      });

      if (multiple) {
        const updated = assets.map((a) => (a.url === cropTargetSrc ? newAsset : a));
        onChange(updated);
      } else {
        onChange(newAsset);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการบันทึกภาพที่ครอบ");
    } finally {
      setIsUploading(false);
    }
  };

  // Update alt text for an asset
  const handleUpdateAlt = (index: number, newAlt: string) => {
    if (multiple) {
      const updated = assets.map((item, idx) =>
        idx === index ? { ...item, alt: newAlt } : item
      );
      onChange(updated);
    } else {
      onChange({ ...currentSingleAsset, alt: newAlt });
    }
  };

  // Delete an asset
  const handleDelete = (index: number) => {
    if (multiple) {
      const updated = assets.filter((_, idx) => idx !== index);
      onChange(updated);
    } else {
      onChange(null);
    }
  };

  // Move asset up / down in multiple mode
  const handleMove = (index: number, direction: "up" | "down") => {
    if (!multiple) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= assets.length) return;

    const newArr = [...assets];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    onChange(newArr);
  };

  // Set asset as cover (move to index 0)
  const handleSetCover = (index: number) => {
    if (!multiple || index === 0) return;
    const newArr = [...assets];
    const [selected] = newArr.splice(index, 1);
    newArr.unshift(selected);
    onChange(newArr);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Label and Helper info */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#1B1226] flex items-center gap-1.5">
          <span>{label}</span>
          {requiredAlt && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
              ต้องระบุ Alt ภาษาไทย
            </span>
          )}
        </label>
        <span className="text-[11px] text-[#1B1226]/50">
          JPG, PNG, WebP ≤ 15MB (ย่อเป็น WebP อัตโนมัติ)
        </span>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        disabled={disabled}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-[4px] bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <WarningCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploading Progress Bar */}
      {isUploading && (
        <div className="p-4 rounded-[6px] bg-[#EDE6F5] border border-[#B8923A]/30 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-[#4B1F7A] font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkle className="w-4 h-4 text-[#D9B867] animate-spin" />
              {uploadStage === "compressing"
                ? "กำลังย่อและแปลงเป็น WebP ด้วย Web Worker..."
                : "กำลังอัปโหลดไปยังคลาวด์..."}
            </span>
            <span className="font-mono font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4B1F7A] to-[#D9B867] h-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Single Mode: Has Asset -> Preview & Details Card */}
      {!multiple && currentSingleAsset?.url && (
        <div className="p-3 bg-white border border-[#B8923A]/30 rounded-[6px] shadow-sm space-y-3">
          <div className="relative group overflow-hidden rounded-[4px] bg-[#1B1226]/5 flex items-center justify-center max-h-64 sm:max-h-72">
            <img
              src={getOptimizedImageUrl(currentSingleAsset.url, { width: 800 })}
              alt={currentSingleAsset.alt || "Uploaded Image"}
              className="w-full h-auto max-h-64 sm:max-h-72 object-contain"
              loading="lazy"
            />
            {/* Quick action buttons overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenCropper(currentSingleAsset)}
                className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#1B1226] text-xs font-semibold flex items-center gap-1.5 shadow"
                title="ครอบรูป (Crop)"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>ครอบรูป</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-[#4B1F7A] hover:bg-[#2A1245] text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                title="เปลี่ยนรูปใหม่"
              >
                <UploadSimple className="w-3.5 h-3.5" />
                <span>เปลี่ยนรูป</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(0)}
                className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                title="ลบรูปภาพ"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>ลบ</span>
              </button>
            </div>
          </div>

          {/* Thai Alt Text Input (Mandatory field as requested) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-[#1B1226]/80">
                คำอธิบายรูปภาพ (Alt Text ภาษาไทยสำหรับความสามารถในการเข้าถึง):
              </span>
              {!currentSingleAsset.alt?.trim() && requiredAlt && (
                <span className="text-rose-600 font-bold">* จำเป็นต้องระบุ</span>
              )}
            </div>
            <input
              type="text"
              value={currentSingleAsset.alt || ""}
              onChange={(e) => handleUpdateAlt(0, e.target.value)}
              placeholder="เช่น ภาพพิธีเปิดการแข่งขันกีฬาประเพณีสามัญสัมพันธ์..."
              className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors ${
                requiredAlt && !currentSingleAsset.alt?.trim()
                  ? "border-rose-400 bg-rose-50/40 focus:border-rose-600"
                  : "border-[#B8923A]/30 focus:border-[#4B1F7A]"
              }`}
            />
          </div>
        </div>
      )}

      {/* Multiple Mode: List of Assets */}
      {multiple && assets.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#1B1226] flex items-center justify-between">
            <span>รูปภาพในแกลเลอรี ({assets.length} รูป)</span>
            <span className="text-[11px] text-[#9C7A2B] font-normal">
              ★ รูปแรกสุดจะถูกใช้เป็นรูปหน้าปก
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assets.map((asset, idx) => (
              <div
                key={asset.url + idx}
                className={`p-2.5 rounded-[6px] border bg-white space-y-2 transition-all relative ${
                  idx === 0
                    ? "border-[#B8923A] ring-2 ring-[#B8923A]/20 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] bg-slate-100 rounded overflow-hidden group">
                  <img
                    src={getOptimizedImageUrl(asset.url, { width: 400 })}
                    alt={asset.alt || `ภาพที่ ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#4B1F7A] text-[#D9B867] text-[10px] font-bold shadow flex items-center gap-1">
                      <Star weight="fill" className="w-3 h-3 text-[#D9B867]" />
                      รูปปกหลัก
                    </span>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="p-1.5 rounded-full bg-[#4B1F7A] text-[#FAF7F0] hover:bg-[#2A1245] text-xs"
                        title="ตั้งเป็นรูปปก"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenCropper(asset)}
                      className="p-1.5 rounded-full bg-white text-[#1B1226] hover:bg-slate-100 text-xs"
                      title="ครอบรูป"
                    >
                      <Crop className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 text-xs"
                      title="ลบรูปนี้"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Move order & number */}
                <div className="flex items-center justify-between text-[11px] text-[#1B1226]/60">
                  <span>ลำดับที่ {idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                      title="ย้ายขึ้น"
                    >
                      <CaretLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === assets.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                      title="ย้ายลง"
                    >
                      <CaretRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Alt text field for each gallery item */}
                <div>
                  <input
                    type="text"
                    value={asset.alt || ""}
                    onChange={(e) => handleUpdateAlt(idx, e.target.value)}
                    placeholder={`คำอธิบายภาพที่ ${idx + 1} (Alt)...`}
                    className={`w-full px-2 py-1 text-[11px] rounded border bg-transparent font-sans focus:outline-none ${
                      requiredAlt && !asset.alt?.trim()
                        ? "border-rose-400 bg-rose-50/30"
                        : "border-slate-200 focus:border-[#4B1F7A]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dropzone Area (Always shown in multiple mode, or when single mode has no asset) */}
      {(multiple || !currentSingleAsset?.url) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-[8px] p-6 text-center transition-all ${
            isDragging
              ? "border-[#4B1F7A] bg-[#EDE6F5]/50 scale-[1.01]"
              : "border-[#B8923A]/40 bg-white hover:border-[#9C7A2B] hover:bg-[#FAF7F0]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-[#EDE6F5] text-[#4B1F7A] flex items-center justify-center shadow-inner">
              <UploadSimple className="w-6 h-6 text-[#4B1F7A]" weight="light" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#1B1226]">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ภาพมาวางที่นี่
              </p>
              <p className="text-xs text-[#1B1226]/60">
                {helperText || "รองรับไฟล์ภาพ JPG, PNG, WebP (บีบอัดเป็น WebP คุณภาพสูงอัตโนมัติ)"}
              </p>
            </div>

            {/* Quick Action Buttons inside dropzone */}
            <div
              className="flex items-center gap-2 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-3 py-1.5 rounded-full bg-[#4B1F7A] hover:bg-[#2A1245] text-[#FAF7F0] text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <FileImage className="w-3.5 h-3.5 text-[#D9B867]" />
                <span>เลือกไฟล์จากเครื่อง</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled}
                className="px-3 py-1.5 rounded-full bg-[#FAF7F0] hover:bg-[#EDE6F5] border border-[#B8923A]/40 text-[#1B1226] text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-[#4B1F7A]" />
                <span>ถ่ายภาพจากมือถือ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropTargetSrc}
        fileName={cropTargetName}
        initialAspect={aspectRatio}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCroppedFile}
      />
    </div>
  );
};
