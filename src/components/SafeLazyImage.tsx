import React, { useState, useEffect, useRef } from 'react';
import { Image, Loader2 } from 'lucide-react';

interface SafeLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  imageFitMode?: 'cover' | 'contain';
  onClick?: () => void;
  fallbacks?: string[];
  title?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export default function SafeLazyImage({
  src,
  alt,
  className = '',
  crossOrigin = 'anonymous',
  imageFitMode = 'cover',
  onClick,
  fallbacks = [],
  title,
  referrerPolicy,
}: SafeLazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasFailed, setHasFailed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const fallbackQueueRef = useRef<string[]>([...fallbacks]);

  const fallbacksJoined = fallbacks.join(',');

  useEffect(() => {
    // Reset state if src or fallbacks change
    setIsLoaded(false);
    setHasFailed(false);
    fallbackQueueRef.current = [...fallbacks];
    
    if (isInView) {
      setCurrentSrc(src);
    }
  }, [src, fallbacksJoined, isInView]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check if IntersectionObserver is supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      {
        rootMargin: '250px', // Preload images 250px before they enter viewport
        threshold: 0.01,
      }
    );

    observer.observe(el);

    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (fallbackQueueRef.current.length > 0) {
      const nextFallback = fallbackQueueRef.current.shift();
      if (nextFallback) {
        setCurrentSrc(nextFallback);
        return;
      }
    }
    setHasFailed(true);
  };

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden bg-slate-50 flex items-center justify-center select-none w-full h-full min-h-0 min-w-0 ${className}`}
      onClick={onClick}
      title={title}
    >
      {/* Background blurred representation for 'contain' mode */}
      {isInView && !hasFailed && imageFitMode === 'contain' && currentSrc && (
        <img
          src={currentSrc}
          alt=""
          aria-hidden="true"
          referrerPolicy={referrerPolicy}
          className={`absolute inset-0 w-full h-full object-cover blur-md opacity-20 scale-110 pointer-events-none transition-opacity duration-500 ${
            isLoaded ? 'opacity-20' : 'opacity-0'
          }`}
        />
      )}

      {/* Main Image rendered only when in view */}
      {isInView && !hasFailed && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          crossOrigin={crossOrigin}
          referrerPolicy={referrerPolicy}
          className={`absolute inset-0 w-full h-full transition-all duration-300 ${
            imageFitMode === 'cover' ? 'object-cover' : 'object-contain'
          } object-center z-10 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Shimmer / Loader Overlay when not yet loaded */}
      {!isLoaded && !hasFailed && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] flex items-center justify-center z-0">
          <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
        </div>
      )}

      {/* Error state if all image links fail */}
      {hasFailed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 p-2 text-center z-25">
          <Image className="w-5 h-5 text-slate-300 mb-1" />
          <span className="text-[10px] text-slate-400 font-bold leading-tight">ไม่มีรูปภาพ</span>
        </div>
      )}
    </div>
  );
}
