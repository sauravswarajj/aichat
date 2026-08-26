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

  const drawToCanvas = (
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
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  };

  // Draw a specific frame onto the canvas
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current.get(frameIndex);
      if (!img || !img.complete || img.naturalWidth === 0) return;

      drawToCanvas(ctx, canvas, img);
    },
    [canvasRef]
  );

  // Preload frames progressively
  useEffect(() => {
    let isCancelled = false;
    let loaded = 0;

    // Load first frame immediately
    const firstImg = new Image();
    firstImg.src = FRAME_PATH_TEMPLATE(1);
    firstImg.onload = () => {
      if (isCancelled) return;
      imagesRef.current.set(1, firstImg);
      loaded++;
      setLoadedCount(loaded);
      drawFrame(1);
    };

    // Preload milestone frames (every 8th frame)
    const milestoneIndices: number[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 8) {
      milestoneIndices.push(i);
    }

    const remainingIndices: number[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!milestoneIndices.includes(i) && i !== 1) {
        remainingIndices.push(i);
      }
    }

    const loadIndex = (index: number) => {
      const img = new Image();
      img.src = FRAME_PATH_TEMPLATE(index);
      img.onload = () => {
        if (isCancelled) return;
        imagesRef.current.set(index, img);
        loaded++;
        setLoadedCount(loaded);

        if (loaded >= 20) {
          setIsReady(true);
        }
      };
      img.onerror = () => {
        if (isCancelled) return;
        loaded++;
        setLoadedCount(loaded);
      };
    };

    milestoneIndices.forEach((idx) => {
      if (idx !== 1) loadIndex(idx);
    });

    const timeout = setTimeout(() => {
      remainingIndices.forEach((idx) => {
        loadIndex(idx);
      });
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [drawFrame]);

  // Handle Resize and high-DPI scaling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      drawFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef, drawFrame]);

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
          drawFrame(targetFrame);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [containerRef, drawFrame]);

  return {
    loadedCount,
    totalFrames: TOTAL_FRAMES,
    progress: currentProgress,
    isReady: isReady || loadedCount > 20,
    currentFrame: currentFrameRef.current,
  };
}
