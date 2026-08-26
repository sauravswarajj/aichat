"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 240;
const FRAME_PATH_TEMPLATE = (index: number) => {
  const padded = String(index).padStart(3, "0");
  return `/hero/frames/frame_${padded}.jpg`;
};

interface UseHeroAnimationOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
}

export function useHeroAnimation({ canvasRef, containerRef }: UseHeroAnimationOptions) {
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(1);
  const rafIdRef = useRef<number | null>(null);
  const isReducedMotionRef = useRef<boolean>(false);

  // Check reduced motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      isReducedMotionRef.current = mediaQuery.matches;
      const handler = (e: MediaQueryListEvent) => {
        isReducedMotionRef.current = e.matches;
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  const drawToCanvas = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      img: HTMLImageElement
    ) => {
      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = canvas.width / dpr;
      const canvasHeight = canvas.height / dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imgRatio = img.naturalWidth / img.naturalHeight || 16 / 9;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth: number;
      let drawHeight: number;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        // Mobile Portrait: fit to screen width, centered vertically
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    },
    []
  );

  // Draw a specific frame onto the canvas
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current.get(frameIndex);
      if (!img || !img.complete || img.naturalWidth === 0) {
        // Fallback to nearest loaded frame for instant paint
        for (let diff = 1; diff <= 15; diff++) {
          const fallback =
            imagesRef.current.get(frameIndex - diff) || imagesRef.current.get(frameIndex + diff);
          if (fallback && fallback.complete && fallback.naturalWidth > 0) {
            drawToCanvas(ctx, canvas, fallback);
            return;
          }
        }
        return;
      }

      drawToCanvas(ctx, canvas, img);
    },
    [canvasRef, drawToCanvas]
  );

  const drawFrameRef = useRef(drawFrame);
  drawFrameRef.current = drawFrame;

  // Rock-solid frame preloader for desktop & mobile
  useEffect(() => {
    let active = true;
    let count = 0;

    const onImageLoaded = (index: number, img: HTMLImageElement) => {
      if (!active) return;
      imagesRef.current.set(index, img);
      count++;
      setLoadedCount(count);

      if (index === 1 || index === currentFrameRef.current) {
        drawFrameRef.current(index);
      }

      if (count >= 10) {
        setIsReady(true);
      }
    };

    const loadSingleImage = (index: number) => {
      const img = new Image();
      img.onload = () => onImageLoaded(index, img);
      img.onerror = () => {
        if (!active) return;
        count++;
        setLoadedCount(count);
      };
      img.src = FRAME_PATH_TEMPLATE(index);

      // Instant cache check
      if (img.complete && img.naturalWidth > 0) {
        onImageLoaded(index, img);
      }
    };

    // 1. First frame loads immediately
    loadSingleImage(1);

    // 2. High priority milestone frames (every 6th frame for instant scrub response)
    const priorityIndices: number[] = [];
    for (let i = 2; i <= TOTAL_FRAMES; i += 6) {
      priorityIndices.push(i);
    }
    priorityIndices.forEach((idx) => loadSingleImage(idx));

    // 3. Batch load remaining frames in small chunks to avoid mobile network bottlenecks
    const remainingIndices: number[] = [];
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if (!priorityIndices.includes(i)) {
        remainingIndices.push(i);
      }
    }

    let batchIndex = 0;
    const batchSize = 12;

    const interval = setInterval(() => {
      if (!active || batchIndex >= remainingIndices.length) {
        clearInterval(interval);
        return;
      }

      const nextBatch = remainingIndices.slice(batchIndex, batchIndex + batchSize);
      nextBatch.forEach((idx) => loadSingleImage(idx));
      batchIndex += batchSize;
    }, 60);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Handle Resize and high-DPI scaling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      drawFrameRef.current(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef]);

  // Scroll listener with requestAnimationFrame
  useEffect(() => {
    const handleScroll = () => {
      if (isReducedMotionRef.current) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollableDistance = container.offsetHeight - window.innerHeight;

      if (totalScrollableDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollableDistance));

      setCurrentProgress(progress);

      const targetFrame = Math.max(
        1,
        Math.min(TOTAL_FRAMES, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1)
      );

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          drawFrameRef.current(targetFrame);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [containerRef]);

  return {
    loadedCount,
    totalFrames: TOTAL_FRAMES,
    progress: currentProgress,
    isReady: isReady || loadedCount > 10,
    currentFrame: currentFrameRef.current,
  };
}
