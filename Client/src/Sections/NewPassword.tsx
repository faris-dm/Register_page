import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate passwords and send the new password to the backend.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Do not accept empty or short passwords.
    if (!password.trim() || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    // Both password fields must match.
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          newPassword: password,
          confirmPassword,
        }),
      });

      // Handle responses that may not contain JSON.
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset your password. Please try again."
        );
      }

      setSuccess(data.message || "Your password has been reset successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-md flex-col justify-center">
        {/* Brand */}
        <Link
          to="/"
          className="mb-8 inline-flex w-fit items-center gap-1 text-xl font-black tracking-[-0.06em] text-[#111827] sm:mb-10"
          aria-label="MERIDIAN home"
        >
          MERIDIAN<span className="text-[#6366f1]">.</span>
        </Link>

        {/* Form card */}
        <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_12px_45px_rgba(15,23,42,0.05)] sm:rounded-3xl sm:p-8">
          {/* Icon */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5]">
            <FiLock size={23} />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6366f1]">
            Account security
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Reset your password
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
            Create a new password for your account. Choose something strong that
            you haven't used before.
          </p>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
            >
              <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
              <p>{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700"
            >
              <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
              <div>
                <p>{success}</p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-2 font-semibold underline underline-offset-4"
                >
                  Go to login
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* New password */}
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                New password
              </label>

              <div className="relative">
                <FiLock
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading || !!success}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Use at least 8 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Confirm new password
              </label>

              <div className="relative">
                <FiLock
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  required
                  disabled={loading || !!success}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={19} />
                  ) : (
                    <FiEye size={19} />
                  )}
                </button>
              </div>

              {/* Show matching feedback while typing. */}
              {confirmPassword && (
                <p
                  className={`mt-2 text-xs ${
                    password === confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {password === confirmPassword
                    ? "Passwords match."
                    : "Passwords do not match."}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338ca] focus:outline-none focus:ring-4 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving changes...
                </>
              ) : success ? (
                <>
                  <FiCheckCircle size={18} />
                  Password updated
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>

          {/* Navigation */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-indigo-600"
            >
              <FiArrowLeft size={17} />
              Back to login
            </Link>
          </div>
        </section>

        {/* Security footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <FiShield size={15} />
          Your account security matters to us.
        </div>
      </div>
    </main>
  );
}
