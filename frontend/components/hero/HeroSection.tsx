"use client";

import React, { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isReady, loadedCount, totalFrames, progress } = useHeroAnimation({
    canvasRef,
    containerRef,
  });

  return (
    <section ref={containerRef} className="relative w-full h-[250vh] sm:h-[300vh]">
      {/* Sticky Fullscreen Viewport Container: Centered vertically and horizontally */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#07080b]">
        {/* Canvas for 240-frame Sequence — centered in viewport */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain sm:object-cover z-0 transition-opacity duration-500 block"
          style={{ opacity: isReady ? 1 : 0.6 }}
        />

        {/* Minimal Bottom Scroll Progress Indicator */}
        <div className="absolute bottom-8 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-20">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
            <span>Scroll to scrub</span>
            <span className="text-[#adc6ff] font-semibold">{Math.round(progress * 100)}%</span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 animate-bounce" />
        </div>

        {/* Frame Preload Progress overlay for slow connections */}
        {!isReady && loadedCount < 20 && (
          <div className="absolute bottom-4 right-4 z-30 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-400">
            Buffering: {loadedCount}/{totalFrames}
          </div>
        )}
      </div>
    </section>
  );
}
