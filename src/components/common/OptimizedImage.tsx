import React, { useState } from "react";
import { getOptimizedImageUrl } from "@/src/lib/imageService";
import { ImageAsset, getImageUrl } from "@/src/types";
import { ImageSquare } from "@phosphor-icons/react";

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | ImageAsset | undefined | null;
  alt: string;
  width?: number | string;
  height?: number | string;
  targetWidth?: number;
  quality?: string | number;
  fallbackSrc?: string;
  aspectRatioClass?: string;
  containerClassName?: string;
  priority?: boolean;
}

/**
 * High-performance OptimizedImage component
 * - Applies automatic WebP/responsive dimensions via Cloudinary/Unsplash
 * - Progressive loading with smooth fade-in
 * - Shimmer skeleton to eliminate Cumulative Layout Shift (CLS)
 * - Graceful fallback on network or broken link errors
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  targetWidth,
  quality = "auto",
  fallbackSrc,
  className = "",
  containerClassName = "",
  priority = false,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute optimized URL based on service
  const computeUrl = (rawUrl: string, tw?: number): string => {
    if (!rawUrl) return "";

    // Cloudinary URL optimization
    if (rawUrl.includes("res.cloudinary.com") && rawUrl.includes("/upload/")) {
      return getOptimizedImageUrl(rawUrl, {
        width: tw,
        quality: quality || "auto",
        format: "webp",
      });
    }

    // Unsplash URL optimization
    if (rawUrl.includes("images.unsplash.com")) {
      try {
        const url = new URL(rawUrl);
        if (tw) url.searchParams.set("w", String(tw));
        url.searchParams.set("auto", "format");
        url.searchParams.set("fit", "crop");
        url.searchParams.set("q", "80");
        return url.toString();
      } catch {
        return rawUrl;
      }
    }

    return rawUrl;
  };

  const actualUrl = getImageUrl(src);
  const finalSrc = hasError
    ? fallbackSrc || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop"
    : computeUrl(actualUrl, targetWidth);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton Shimmer while loading */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-[#EDE6F5] animate-pulse pointer-events-none z-0"
          aria-hidden="true"
        />
      )}

      {/* Actual Image */}
      <img
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`transition-opacity duration-500 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...rest}
      />

      {/* Fallback indicator if error occurs */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#EDE6F5] text-[#4B1F7A]/60 text-xs p-2">
          <ImageSquare weight="duotone" className="w-6 h-6 mb-1 text-[#9C7A2B]" />
          <span className="text-[10px] text-center font-sans line-clamp-1">{alt || "รูปภาพ"}</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
