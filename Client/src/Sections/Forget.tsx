

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

type View = "form" | "sent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

const display = "font-['Bricolage_Grotesque',sans-serif]";
const btn =
  "h-12 rounded-lg border-[1.5px] px-5 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2441d1]/30 disabled:cursor-not-allowed disabled:opacity-60";
const btnPrimary = `${btn} mt-5 border-[#2441d1] bg-[#2441d1] text-white hover:bg-[#1a31a8]`;
const btnGhost = `${btn} mt-3 border-[#cbd3dd] bg-transparent text-[#0e1a2b] hover:border-[#0e1a2b] hover:bg-white`;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the heading when the step changes (helps screen readers)
  useEffect(() => {
    headingRef.current?.focus();
  }, [view]);

  // Countdown for the Resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function sendLink() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:2040/api/forget_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      // const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error("Request failed");
      setView("sent");
      setCooldown(RESEND_SECONDS);
    } catch {
      setError(
        "We couldn’t send the email. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address, like name@example.com.");
      return;
    }
    void sendLink();
  }

  const sent = view === "sent";

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f7fa] text-[#0e1a2b] antialiased font-['Figtree',system-ui,sans-serif] md:flex-row">
      {/* Brand panel: slim top bar on mobile, left column from tablet up */}
      <aside className="relative overflow-hidden bg-[#0e1a2b] px-6 py-4 text-white md:flex md:min-h-screen md:w-[42%] md:flex-col md:justify-between md:p-12 xl:w-[46%] xl:p-16">
        <a
          href="/"
          aria-label="MERIDIAN home"
          className={`${display} inline-block text-2xl font-extrabold tracking-wide focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f0b44c] md:text-3xl`}
        >
          MERIDIAN<span className="text-[#f0b44c]">.</span>
        </a>

        <p
          className={`${display} relative z-10 hidden max-w-xs text-3xl font-semibold leading-tight md:block xl:max-w-xs xl:text-4xl`}
        >
          Every route needs a line to come back to.
        </p>

        <svg
          viewBox="0 0 400 400"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute -right-[30%] top-1/2 hidden w-[120%] max-w-[38rem] -translate-y-1/2 text-white/15 md:block"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="200" cy="200" r="60" />
            <circle cx="200" cy="200" r="110" />
            <circle cx="200" cy="200" r="160" />
            <circle cx="200" cy="200" r="210" />
            <ellipse cx="200" cy="200" rx="60" ry="200" />
          </g>
          <line
            x1="200"
            y1="0"
            x2="200"
            y2="400"
            stroke="#f0b44c"
            strokeWidth="1.5"
          />
        </svg>
      </aside>

      {/* Form area */}
      <section className="flex flex-1 items-start justify-center px-6 pb-12 pt-10 md:items-center md:p-12">
        <div
          className={`relative w-full max-w-md border-l pl-7 ${
            sent ? "border-[#2441d1]" : "border-[#cbd3dd]"
          }`}
        >
          {/* Dot on the vertical line; fills in once the email is sent */}
          <span
            aria-hidden="true"
            className={`absolute -left-2 top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 transition-colors ${
              sent
                ? "border-[#2441d1] bg-[#2441d1] text-white motion-safe:animate-pulse"
                : "border-[#f0b44c] bg-[#f5f7fa] text-transparent"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          {!sent ? (
            <>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className={`${display} mb-3.5 text-3xl font-extrabold leading-tight tracking-tight outline-none md:text-4xl`}
              >
                Forgot your password?
              </h1>
              <p className="mb-6 text-base leading-relaxed text-[#5a6678]">
                Enter the email you signed up with. We’ll send you a link to
                choose a new password.
              </p>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col"
              >
                <label htmlFor="email" className="mb-1.5 text-sm font-semibold">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "email-error" : undefined}
                  className={`h-12 w-full rounded-lg border-[1.5px] bg-white px-3.5 text-base text-[#0e1a2b] placeholder:text-[#8a95a5] focus:outline-none focus:ring-4 disabled:bg-[#eceff3] ${
                    error
                      ? "border-[#b3261e] focus:ring-[#b3261e]/20"
                      : "border-[#cbd3dd] focus:border-[#2441d1] focus:ring-[#2441d1]/20"
                  }`}
                />
                {error && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-2 text-sm text-[#b3261e]"
                  >
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className={btnPrimary}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <Link
                to="/"
                className="mt-7 inline-block py-2 text-[0.95rem] font-semibold text-[#2441d1] underline underline-offset-4 hover:text-[#1a31a8]"
              >
                Back to log in
              </Link>
            </>
          ) : (
            <>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className={`${display} mb-3.5 text-3xl font-extrabold leading-tight tracking-tight outline-none md:text-4xl`}
              >
                Check your email
              </h1>
              <p className="mb-4 text-base leading-relaxed text-[#5a6678]">
                If an account exists for{" "}
                <strong className="break-all font-semibold text-[#0e1a2b]">
                  {email.trim()}
                </strong>
                , a reset link is on its way. It expires in 15 minutes.
              </p>
              <p className="mb-6 text-sm leading-relaxed text-[#5a6678]">
                Nothing yet? Look in your spam folder, or send it again.
              </p>

              {error && (
                <p role="alert" className="mb-2 text-sm text-[#b3261e]">
                  {error}
                </p>
              )}

              <div className="flex flex-col" aria-live="polite">
                <button
                  type="button"
                  onClick={() => void sendLink()}
                  disabled={loading || cooldown > 0}
                  className={`${btnPrimary} mt-0`}
                >
                  {loading
                    ? "Sending…"
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView("form");
                  }}
                  className={btnGhost}
                >
                  Use a different email
                </button>
              </div>

              <a
                href="/"
                className="mt-7 inline-block py-2 text-[0.95rem] font-semibold text-[#2441d1] underline underline-offset-4 hover:text-[#1a31a8]"
              >
                Back to log in
              </a>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
