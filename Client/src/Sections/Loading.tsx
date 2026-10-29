type PageLoaderProps = {
  text?: string;
  fullScreen?: boolean;
};

const BRAND = "MERIDIAN".split("");

export default function PageLoader({
  text = "Checking your session...",
  fullScreen = true,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full flex-col items-center justify-center gap-5 bg-white px-4 text-center sm:gap-6 dark:bg-neutral-950 ${
        fullScreen ? "min-h-dvh" : "min-h-64"
      }`}
    >
      {/* Spinner */}
      <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20 md:h-24 md:w-24">
        <span className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-800" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        <span className="h-2 w-2 animate-ping rounded-full bg-indigo-600 sm:h-3 sm:w-3" />
      </div>

      {/* Brand name, letters pulse one by one */}
      <h1
        aria-label="Meridian"
        className="flex pl-[0.25em] text-xl font-semibold tracking-[0.25em] text-neutral-900 sm:text-3xl md:text-4xl dark:text-white"
      >
        {BRAND.map((letter, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {letter}
          </span>
        ))}
      </h1>

      <p className="text-xs text-neutral-500 sm:text-sm md:text-base dark:text-neutral-400">
        {text}
      </p>
    </div>
  );
}