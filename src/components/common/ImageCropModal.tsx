import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
  X,
  Check,
  ArrowsClockwise,
  MagnifyingGlassPlus,
  Crop,
  ArrowsInLineHorizontal,
} from "@phosphor-icons/react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName: string;
  initialAspect?: number; // e.g. 16/9, 4/3, 1, 4/5
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  fileName,
  initialAspect = 16 / 9,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (newCrop: Point) => setCrop(newCrop);
  const onZoomChange = (newZoom: number) => setZoom(newZoom);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const rotRad = (rotation * Math.PI) / 180;

    // Calculate bounding box of rotated image
    const { width: bBoxWidth, height: bBoxHeight } = {
      width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
      height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
    };

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    // Crop the canvas to target pixelCrop
    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");

    if (!croppedCtx) {
      throw new Error("No cropped 2d context");
    }

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const baseName = fileName.replace(/\.[^/.]+$/, "");
          const file = new File([blob], `${baseName}_cropped.webp`, { type: "image/webp" });
          resolve(file);
        },
        "image/webp",
        0.92
      );
    });
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedFile);
    } catch (err) {
      console.error("Cropping failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#1B1226] text-[#FAF7F0] rounded-xl overflow-hidden shadow-2xl border border-[#B8923A]/40 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#FAF7F0]/15 bg-[#2A1245]">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#D9B867]" weight="bold" />
            <h3 className="font-serif font-bold text-base text-[#FAF7F0]">
              ครอบและปรับแต่งภาพ (Crop & Rotate)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper Viewport */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[420px] bg-black select-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
            showGrid
          />
        </div>

        {/* Control Toolbar */}
        <div className="p-4 bg-[#2A1245] border-t border-[#FAF7F0]/15 space-y-3">
          {/* Aspect Ratio Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#FAF7F0]/70 font-medium flex items-center gap-1">
              <ArrowsInLineHorizontal className="w-3.5 h-3.5 text-[#D9B867]" />
              สัดส่วนภาพ:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "16:9 (แบนเนอร์/ปก)", val: 16 / 9 },
                { label: "4:3 (ทั่วไป)", val: 4 / 3 },
                { label: "1:1 (สี่เหลี่ยมจัตุรัส)", val: 1 },
                { label: "4:5 (ภาพบุคคลแนวตั้ง)", val: 4 / 5 },
                { label: "อิสระ", val: undefined },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setAspect(opt.val)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    aspect === opt.val
                      ? "bg-[#D9B867] text-[#1B1226] font-semibold"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom and Rotate sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <MagnifyingGlassPlus className="w-4 h-4 text-[#D9B867] shrink-0" />
              <span className="text-[#FAF7F0]/70 w-12 shrink-0">ซูม:</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#D9B867] cursor-pointer"
              />
              <span className="font-mono text-[10px] w-8 text-right text-white/60">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ArrowsClockwise className="w-4 h-4 text-[#D9B867] shrink-0" />
              <span className="text-[#FAF7F0]/70 w-12 shrink-0">หมุน:</span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-[#D9B867] cursor-pointer"
              />
              <span className="font-mono text-[10px] w-8 text-right text-white/60">
                {rotation}°
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#FAF7F0]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isProcessing}
              className="px-5 py-2 rounded-lg bg-[#D9B867] hover:bg-[#C9A757] text-[#1B1226] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" weight="bold" />
              <span>{isProcessing ? "กำลังประมวลผล..." : "เสร็จสิ้นและใช้ภาพนี้"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
