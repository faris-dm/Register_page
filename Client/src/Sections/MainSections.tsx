import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import useAuth from "./AuthContext";
import { FaEye, FaEyeSlash, FaGoogle, FaGithub } from "react-icons/fa";
import { useNavigate, Navigate, Link } from "react-router-dom";

type RegisterType = {
  username: string;
  email: string;
  password: string;
};

type LoginType = {
  email: string;
  password: string;
};

function Register() {
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");

  const [registerForm, setRegisterForm] = useState<RegisterType>({
    username: "",
    email: "",
    password: "",
  });

  const [loginForm, setLoginForm] = useState<LoginType>({
    email: "",
    password: "",
  });
  const { checking, user, setUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  function handleRegisterChange(e: ChangeEvent<HTMLInputElement>) {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:2040/api/auth/google";
  };
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:2040/api/auth/github";
  };

  function handleLoginChange(e: ChangeEvent<HTMLInputElement>) {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  }

  function switchTab(tab: "signup" | "login") {
    setActiveTab(tab);
    setErrorMessage("");
    setShowPassword(false);
    setShowLoginPassword(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);

      const response = await fetch("http://localhost:2040/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerForm),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to register");
        return;
      }

      console.log(result);
      setRegisterForm({
        username: "",
        email: "",
        password: "",
      });
      setUser(result.user);
      navigate("/api/profile");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);

      const response = await fetch("http://localhost:2040/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to login");
        return;
      }

      console.log(result);
      setLoginForm({
        email: "",
        password: "",
      });
      setUser(result.user);
      navigate("/api/profile");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }
  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  const socialButtonClass =
    "flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 sm:text-sm";

  if (checking) return null;
  if (user) return <Navigate to="/api/profile" replace />;

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* SECTION 1: BRANDING - HIDDEN ON SMALL SCREENS */}
      <section className="hidden flex-col justify-between bg-gray-900 p-10 text-white md:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-gray-900">
            M
          </div>
          <h5 className="text-xl font-bold tracking-tight">MERIDIAN</h5>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Build something
            <br />
            worth sharing.
          </h1>

          <p className="mt-4 max-w-sm text-gray-400">
            Create your account and start publishing your work, your wins and
            your progress.
          </p>
        </div>

        <p className="text-sm text-gray-500">© 2026 Meridian</p>
      </section>

      {/* SECTION 2: AUTHENTICATION FORM */}
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-8 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          {/* MOBILE LOGO */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 font-bold text-white">
              M
            </div>
            <h5 className="text-lg font-bold">MERIDIAN</h5>
          </div>

          {/* LOGIN / REGISTER SWITCH */}
          <div className="mb-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => switchTab("login")}
              aria-pressed={activeTab === "login"}
              className={`rounded-lg py-2 text-sm font-medium transition ${
                activeTab === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchTab("signup")}
              aria-pressed={activeTab === "signup"}
              className={`rounded-lg py-2 text-sm font-medium transition ${
                activeTab === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* SIGNUP HEADING */}
          {activeTab === "signup" && (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Create your account
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Start building something worth sharing.
              </p>

              {/* SIGNUP FORM */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="username" className={labelClass}>
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className={labelClass}>
                    Email address
                  </label>

                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className={labelClass}>
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      required
                      minLength={8}
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p
                    role="alert"
                    className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600"
                  >
                    {errorMessage}
                  </p>
                )}

                {/* MAIN SIGNUP BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>

                {/* SMALL SOCIAL BUTTONS BELOW SIGNUP */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className={socialButtonClass}
                  >
                    <FaGoogle className="shrink-0 text-green-500" />
                    Google
                  </button>

                  <button
                    onClick={handleGitHubLogin}
                    type="button"
                    className={socialButtonClass}
                  >
                    <FaGithub className="shrink-0 text-gray-900" />
                    GitHub
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("login")}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            </>
          )}

          {/* LOGIN HEADING */}
          {activeTab === "login" && (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter your details to access your account.
              </p>

              {/* LOGIN FORM - UI ONLY */}
              <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="login-email" className={labelClass}>
                    Email address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>

                    <a
                      href="#forgot-password"
                      onClick={(e) => e.preventDefault()}
                      className="text-xs font-medium text-red-600 hover:text-gray-900 sm:text-sm"
                    >
                      <Link to="/reset"> Forgot password</Link>
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      required
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={
                        showLoginPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                    >
                      {showLoginPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                {/* MAIN LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
                >
                  {loading ? "logging in ..." : "Login"}
                </button>

                {/* SMALL SOCIAL BUTTONS BELOW LOGIN */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className={socialButtonClass}
                  >
                    <FaGoogle className="shrink-0 text-green-500" />
                    Google
                  </button>
                  <button
                    onClick={handleGitHubLogin}
                    type="button"
                    className={socialButtonClass}
                  >
                    <FaGithub className="shrink-0 text-gray-900" />
                    GitHub
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("signup")}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    Register
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default Register;
