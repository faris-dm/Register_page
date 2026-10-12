import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import {
  initialProfile,
  updateProfileMock,
  type UserProfile,
} from "./ProfileApi";

type ProfilePageProps = {
  onLogout?: () => void;
};

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const [draft, setDraft] = useState<UserProfile>(initialProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    profile.username
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "U";

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  function startEditing() {
    setDraft(profile);
    setIsEditing(true);
    setNotice("");
  }

  function cancelEditing() {
    setDraft(profile);
    setIsEditing(false);
    setNotice("");
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setNotice("Image must be smaller than 3 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraft((previous) => ({
          ...previous,
          avatarUrl: reader.result as string,
        }));
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const username = draft.username.trim();
    const email = draft.email.trim();

    if (username.length < 2) {
      setNotice("Username must have at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice("Please enter a valid email address.");
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateProfileMock({
        username,
        email,
        avatarUrl: draft.avatarUrl,
      });

      setProfile(updated);
      setDraft(updated);
      setIsEditing(false);
      setNotice("Profile saved successfully.");
    } catch {
      setNotice("Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  function handlePasswordSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword) {
      setNotice("Enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setNotice("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotice("Passwords do not match.");
      return;
    }

    // Demo only: no real password is changed.
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);

    setNotice("Form validated. Connect your backend to change the password.");
  }

  function handleLogout() {
    setShowLogout(false);

    if (onLogout) {
      onLogout();
    } else {
      setNotice("Connect onLogout to your authentication logic.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Navbar */}
        <header className="mb-8 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-lg text-white">
              Q
            </span>
            <span className="text-xl tracking-tight">QUILog</span>
          </a>

          <span className="hidden text-sm text-slate-500 sm:block">
            Account settings
          </span>
        </header>

        {/* Profile card */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 sm:h-36" />

          <div className="px-5 pb-7 sm:px-8 sm:pb-8">
            {/* Avatar and welcome */}
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-sm sm:h-28 sm:w-28">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="min-w-0 pb-1">
                  <p className="text-sm text-slate-500">Welcome back,</p>

                  <h1 className="truncate text-xl font-bold sm:text-2xl">
                    {profile.username}
                  </h1>

                  <p className="truncate text-sm text-slate-500">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:pb-1">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:flex-none"
                  >
                    Edit profile
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowLogout(true)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 sm:flex-none"
                >
                  Log out
                </button>
              </div>
            </div>

            {/* Feedback */}
            {notice && (
              <div
                role="status"
                className="mt-6 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
              >
                {notice}
              </div>
            )}

            {/* Main layout */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Personal information */}
              <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h2 className="font-bold">Personal information</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your account details.
                </p>

                {isEditing ? (
                  <form onSubmit={handleSave} className="mt-5 space-y-4">
                    <div>
                      <label
                        htmlFor="username"
                        className="text-sm font-semibold"
                      >
                        Username
                      </label>

                      <input
                        id="username"
                        autoComplete="username"
                        className={inputClass}
                        value={draft.username}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            username: event.target.value,
                          })
                        }
                        minLength={2}
                        maxLength={60}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="text-sm font-semibold">
                        Email address
                      </label>

                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={inputClass}
                        value={draft.email}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            email: event.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Profile photo</p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                        >
                          Upload image
                        </button>

                        {draft.avatarUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                avatarUrl: "",
                              })
                            }
                            className="text-sm font-semibold text-rose-600"
                          >
                            Remove image
                          </button>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          aria-label="Choose profile image"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Images only, maximum 3 MB.
                      </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="mt-5 space-y-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <dt className="text-xs text-slate-500">Username</dt>
                      <dd className="mt-1 break-words text-sm font-semibold">
                        {profile.username}
                      </dd>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <dt className="text-xs text-slate-500">Email address</dt>
                      <dd className="mt-1 break-words text-sm font-semibold">
                        {profile.email}
                      </dd>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <dt className="text-xs text-slate-500">Account ID</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold">
                        {profile.id}
                      </dd>
                    </div>
                  </dl>
                )}
              </section>

              {/* Security */}
              <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h2 className="font-bold">Security</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your password.
                </p>

                <div className="mt-5 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold">Password</p>

                  <p className="mt-1 text-sm text-slate-500">
                    Keep your password private and secure.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      setNotice("");
                    }}
                    className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {showPassword ? "Cancel" : "Change password"} →
                  </button>

                  {showPassword && (
                    <form
                      onSubmit={handlePasswordSave}
                      className="mt-4 space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="text-sm font-semibold"
                        >
                          Current password
                        </label>

                        <input
                          id="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          className={inputClass}
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(event.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="newPassword"
                          className="text-sm font-semibold"
                        >
                          New password
                        </label>

                        <input
                          id="newPassword"
                          type="password"
                          autoComplete="new-password"
                          className={inputClass}
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          minLength={8}
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="text-sm font-semibold"
                        >
                          Confirm new password
                        </label>

                        <input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          className={inputClass}
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          minLength={8}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        Validate password form
                      </button>

                      <p className="text-xs leading-5 text-slate-500">
                        Demo only. Connect a secure backend endpoint before
                        enabling real password changes.
                      </p>
                    </form>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Security tip
                  </p>
                  <p className="mt-1 text-sm leading-5 text-amber-800">
                    Never share your password. Your backend should verify your
                    current password and securely hash the new one.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-slate-400">
          QUILog · Profile settings
        </p>
      </div>

      {/* Logout confirmation */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M10 17l5-5-5-5M15 12H3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 id="logout-title" className="mt-4 text-lg font-bold">
              Log out of your account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You can sign in again whenever you are ready.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogout(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Yes, log out
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
