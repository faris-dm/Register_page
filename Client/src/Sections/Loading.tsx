import { useState, useEffect } from "react";
import type { ReactNode } from "react";

type PageLoaderProps = {
  loading: boolean;
  children: ReactNode;
  minMs?: number;
  text?: string;
};

export default function PageLoader({
  loading,
  children,
  minMs = 1500,
  text = "Getting things ready",
}: PageLoaderProps) {
  const [minDone, setMinDone] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDone(true), minMs);
    return () => clearTimeout(timer);
  }, [minMs]);

  if (!loading && minDone) {
    return <>{children}</>;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[linear-gradient(135deg,#4f46e5,#9333ea,#ec4899)] px-4 text-center sm:gap-10"
    >
      <style>{`
        @keyframes roll {
          0%   { left: 0; transform: rotate(0deg); }
          50%  { left: calc(100% - var(--ball)); transform: rotate(540deg); }
          100% { left: 0; transform: rotate(0deg); }
        }
      `}</style>

      <div className="relative h-10 w-56 max-w-full sm:h-12 sm:w-80 md:w-[28rem]">
        <div
          className="absolute top-0 h-10 w-10 rounded-full bg-white shadow-xl [--ball:2.5rem] sm:h-12 sm:w-12 sm:[--ball:3rem]"
          style={{ animation: "roll 2s ease-in-out infinite" }}
        >
          <span className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-pink-500 sm:h-3 sm:w-3" />
          <span className="absolute bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-indigo-500 sm:h-3 sm:w-3" />
        </div>
        <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-white/30" />
      </div>

      <h1 className="pl-[0.25em] text-2xl font-bold tracking-[0.25em] text-white drop-shadow sm:text-4xl md:text-5xl">
        MERIDIAN
      </h1>

      <p className="flex items-end gap-1 text-sm text-white/90 sm:text-base">
        {text}
        <span className="mb-1 h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
        <span
          className="mb-1 h-1.5 w-1.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="mb-1 h-1.5 w-1.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "300ms" }}
        />
      </p>
    </div>
  );
}