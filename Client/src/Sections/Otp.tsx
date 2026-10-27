import { useState} from "react";
import { FiMail, FiArrowRight, FiShield } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { useLocation, useNavigate } from "react-router-dom";
import Auth from "./AuthContext";

export default function EmailVerification() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { setUser } = Auth();
  const Navigate = useNavigate();
  const Location = useLocation();

  const handleSubmit = async () => {
    const digitOTP = code.join("");
    if (!/^\d{6}$/.test(digitOTP)) {
      setErrorMessage("Please enter all 6 digits.");
      return;
    }
    const email = Location.state?.email;
    setLoading(true);
    setErrorMessage("");

    try {
      const reponse = await fetch(`http://localhost:2040/api/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: digitOTP, email }),
      });

      const result = await reponse.json();
      if (!reponse.ok) {
        setErrorMessage(result.message);
        return;
      }

      setCode(["", "", "", "", "", ""]);
      Navigate("/api/profile");
      setUser(result.user);
    } catch (error) {
      console.log(error);
      setErrorMessage("unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10 font-sans text-[#172b24]">
      <section className="w-full max-w-md rounded-3xl border border-[#e8ece9] bg-white p-6 shadow-[0_12px_50px_rgba(20,40,30,0.05)] sm:p-9">
        {/* Brand */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174c3c] text-white">
            <FiShield size={21} />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">
              meridian<span className="text-[#38866a]">.</span>
            </p>
            <p className="text-xs text-gray-500">YOUR SPACE. YOUR SECURITY.</p>
          </div>
        </div>

        {/* Icon */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#21664c]">
          <FiMail size={26} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-[34px]">
          Check your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          We sent you a verification code. Enter the 6-digit code below to
          continue.
        </p>

        {/* OTP inputs */}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600"
          >
            {" "}
            {errorMessage}
          </p>
        )}

        <div className="mt-8">
          <label className="mb-3 block text-sm font-medium text-[#263c32]">
            Verification code
          </label>

          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setCode((prev) =>
                    prev.map((item, i) =>
                      i === index ? value.slice(-1) : item
                    )
                  );
                }}
                className="h-12 w-full rounded-xl border border-[#dfe6e1] bg-[#fcfdfc] text-center text-lg font-semibold outline-none transition focus:border-[#287454] focus:ring-4 focus:ring-[#287454]/10 sm:h-14"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#174c3c] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#103d30] active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
        >
          {loading ? (
            <>
              <ImSpinner8 className="animate-spin" size={18} />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify email</span>
              <FiArrowRight size={17} />
            </>
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          Didn't receive a code?{" "}
          <button
            type="button"
            className="font-semibold text-[#287454] hover:text-[#174c3c]"
          >
            Resend code
          </button>
        </p>

        <div className="mt-8 border-t border-[#edf0ed] pt-5 text-center">
          <p className="text-xs text-gray-400">
            Protected by Meridian security
          </p>
        </div>
      </section>
    </main>
  );
}
