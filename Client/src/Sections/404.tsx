import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[linear-gradient(135deg,#4f46e5,#9333ea,#ec4899)] px-4 py-10 text-center text-white sm:gap-8">
      <p className="text-xs font-semibold tracking-[0.3em] sm:text-sm">
        MERIDIAN
      </p>

      <div
        aria-label="Error 404"
        className="flex items-center justify-center gap-2 text-7xl font-extrabold leading-none drop-shadow sm:gap-4 sm:text-9xl md:text-[10rem]"
      >
        <span>4</span>
        <span className="relative h-16 w-16 animate-bounce rounded-full bg-white shadow-xl sm:h-24 sm:w-24 md:h-36 md:w-36">
          <span className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-pink-500 sm:h-4 sm:w-4" />
          <span className="absolute bottom-2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-indigo-500 sm:h-4 sm:w-4" />
        </span>
        <span>4</span>
      </div>

      <div className="max-w-xs space-y-2 sm:max-w-md">
        <h1 className="text-2xl font-bold sm:text-4xl">Page not found</h1>
        <p className="text-sm text-white/90 sm:text-base">
          The page you are looking for does not exist, or it was moved.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <button
          type="button"
          onClick={goBack}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:text-base"
        >
          ← Go back
        </button>

        <Link
          to="/"
          className="rounded-full border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:text-base"
        >
          Go to home
        </Link>
      </div>
    </main>
  );
}