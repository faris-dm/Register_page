// ProfileScreen.tsx
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

// import {useAuth} from "./AuthContext"

import useAuth from "./AuthContext";

import { useNavigate, Navigate } from "react-router-dom";

type DataTpe = {
  username: string;
  email: string;
};
// fake data, to be replaced by the context later

export default function ProfileScreen() {
  const { user, checking, logout, setUser } = useAuth();

  const navigate = useNavigate();
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<DataTpe>({ username: "", email: "" });
  const [message, setMessage] = useState<string>("");
  const [askLeave, setAskLeave] = useState<boolean>(false);

  const letters = user.username.trim().slice(0, 2).toUpperCase() || "U";

  const fieldStyle =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  function openEditor() {
    setDraft({ username: user.username, email: user.email });
    setMessage("");
    setEditing(true);
  }

  function closeEditor() {
    setEditing(false);
    setMessage("");
  }

  function onType(e: ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, [e.target.name]: e.target.value });
  }

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (draft.username.trim().length < 2) {
      setMessage("Username needs at least 2 characters.");
      return;
    }

    setUser({ ...user, ...draft }); // UI only: nothing is sent anywhere yet
    setEditing(false);
    setMessage("Profile updated.");
  }

  async function onLeave() {
    try {
      await logout();
      setMessage("Logout done");
    } catch (error) {
      setMessage("Logout failed ,please try again");
    } finally {
      setAskLeave(false);
    }
  }
  if (checking) return null;
  if (user === null) {
    return <Navigate to="/" replace />;
  }
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* top bar */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
              M
            </span>
            <span className="text-xl tracking-tight">MERIDIAN</span>
          </div>

          <button
            type="button"
            onClick={() => setAskLeave(true)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
          >
            Log out
          </button>
        </header>

        {/* card */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 sm:h-36" />

          <div className="px-5 pb-8 sm:px-8">
            {/* avatar + name + edit button */}
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-sm sm:h-28 sm:w-28">
                  {letters}
                </div>

                <div className="min-w-0 pb-1">
                  <p className="text-sm text-slate-500">Welcome back,</p>
                  <h1 className="truncate text-xl font-bold sm:text-2xl">
                    {user.username}
                  </h1>
                  <p className="truncate text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={openEditor}
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Edit profile
                </button>
              )}
            </div>

            {/* message */}
            {message && (
              <p
                role="status"
                className="mt-6 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
              >
                {message}
              </p>
            )}

            {/* edit form OR details */}
            {editing ? (
              <form onSubmit={onSave} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="username" className="text-sm font-semibold">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    value={draft.username}
                    onChange={onType}
                    required
                    className={fieldStyle}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-semibold">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={draft.email}
                    onChange={onType}
                    required
                    className={fieldStyle}
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            ) : (
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs text-slate-500">Username</dt>
                  <dd className="mt-1 break-words text-sm font-semibold">
                    {user.username}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs text-slate-500">Email address</dt>
                  <dd className="mt-1 break-words text-sm font-semibold">
                    {user.email}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs text-slate-500">Account ID</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold">
                    No id
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </section>
      </div>

      {/* logout confirmation */}
      {askLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold">Log out of your account?</h2>
            <p className="mt-2 text-sm text-slate-500">
              You can sign in again whenever you are ready.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAskLeave(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onLeave}
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
