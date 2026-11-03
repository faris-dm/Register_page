import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaShieldAlt } from "react-icons/fa";
import {
  AiOutlineMail,
  AiOutlineArrowLeft,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";

export default function EmailReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");

    if (!email.trim()) {
      setIsError(true);
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://oauth-page-ka4i.onrender.com/api/password/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(
          data.message || data.error || "Unable to process your request."
        );
        return;
      }

      setIsError(false);
      setMessage(data.message || "Verification code sent successfully.");

      // Pass the email to the OTP page.
      navigate("/passOtp", {
        state: { email: email.trim() },
      });
    } catch (error) {
      setIsError(true);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col">
        {/* Brand */}
        <header>
          <Link
            to="/"
            className="inline-flex items-center text-xl font-bold tracking-[-0.06em] text-[#20231F] sm:text-2xl"
          >
            MERIDIAN<span className="text-[#8B927D]">.</span>
          </Link>
        </header>

        {/* Main content */}
        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">
            {/* Icon */}
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6E4DC] bg-white text-[#454B3F] shadow-sm">
              <AiOutlineMail size={25} strokeWidth={1.7} />
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#858779]">
              Account recovery
            </p>

            <h1 className="text-3xl font-semibold tracking-[-0.055em] text-[#252821] sm:text-4xl">
              Reset your password
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#77796F] sm:text-base">
              Enter the email address connected to your account. We’ll send you
              a verification code to continue resetting your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#34372F]"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 border-b border-[#D5D5CB] py-3 transition-colors focus-within:border-[#424A3C]">
                  <AiOutlineMail
                    size={19}
                    strokeWidth={1.7}
                    className="shrink-0 text-[#858779]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-transparent text-base text-[#252821] outline-none placeholder:text-[#B0B0A7] disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Backend and validation messages */}
              {message && (
                <div
                  role="alert"
                  aria-live="polite"
                  className={`rounded-xl border px-4 py-3 text-sm leading-5 ${
                    isError
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#30372B] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#424A3C] focus:outline-none focus:ring-2 focus:ring-[#737D67] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters
                      size={18}
                      className="animate-spin"
                    />
                    Sending verification code...
                  </>
                ) : (
                  "Send verification code"
                )}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#EFEEE8] p-4">
              <FaShieldAlt
                size={20}
                className="mt-0.5 shrink-0 text-[#68715B]"
              />
              <p className="text-xs leading-5 text-[#77796F]">
                Your account security matters. Never share your verification
                code with anyone.
              </p>
            </div>

            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#686B60] transition hover:text-[#252821]"
            >
              <AiOutlineArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </section>

        <footer className="border-t border-[#E7E5DE] pt-5 text-center text-xs text-[#999A90]">
          © {new Date().getFullYear()} MERIDIAN. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
