import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "./AuthContext";

type Draft = {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
};

export default function ProfileScreen() {
  const { user, checking, logout, setUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    username: "",
    first_name: "",
    last_name: "",
    bio: "",
  });
  const [message, setMessage] = useState("");
  const [askLeave, setAskLeave] = useState(false);

  // guards come AFTER all the useState calls
  if (checking) return null;
  if (user === null) return <Navigate to="/" replace />;

  // works for both Google users (first/last name) and password users (username)
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const displayName = fullName || user.username || user.email;
  const greetingName = user.first_name || user.username || user.email;
  const initial = displayName.charAt(0).toUpperCase();

  const fieldStyle =
    "mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-700/10";

  const openEditor = () => {
    setDraft({
      username: user.username ?? "",
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      bio: user.bio ?? "",
    });
    setMessage("");
    setEditing(true);
  };

  const closeEditor = () => {
    setEditing(false);
    setMessage("");
  };

  const onType = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft({ ...draft, [e.target.name]: e.target.value });
  };

  const onSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!draft.username.trim() && !draft.first_name.trim()) {
      setMessage("Please add a username or a first name.");
      return;
    }

    // UI only for now: no save route exists on the backend yet
    setUser({ ...user, ...draft });
    setEditing(false);
    setMessage("Profile updated.");
  };

  const onLeave = async () => {
    try {
      await logout(); // sets user to null, so the guard above redirects to "/"
    } catch {
      setMessage("Logout failed. Please try again.");
    } finally {
      setAskLeave(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf6f0] px-4 py-6 text-stone-800 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* top bar */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-800 font-serif text-lg font-bold text-amber-50">
              M
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight">
              Meridian
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAskLeave(true)}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
          >
            Log out
          </button>
        </header>

        {/* profile card */}
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          {/* banner */}
          <div className="h-28 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 sm:h-36" />

          <div className="px-5 pb-8 sm:px-8">
            {/* avatar + name + edit button */}
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                {user.avater_url ? (
                  <img
                    src={user.avater_url}
                    alt={displayName}
                    className="h-24 w-24 shrink-0 rounded-full border-4 border-white object-cover shadow-sm sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-white bg-amber-100 font-serif text-4xl font-semibold text-amber-800 shadow-sm sm:h-28 sm:w-28">
                    {initial}
                  </div>
                )}

                <div className="min-w-0 pb-1">
                  <p className="text-sm text-stone-500">
                    Welcome back, {greetingName}
                  </p>
                  <h1 className="truncate font-serif text-2xl font-semibold sm:text-3xl">
                    {displayName}
                  </h1>
                  {user.username && fullName && (
                    <p className="truncate text-sm text-stone-500">
                      @{user.username}
                    </p>
                  )}
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={openEditor}
                  className="rounded-full bg-amber-800 px-5 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-amber-900"
                >
                  Edit profile
                </button>
              )}
            </div>

            {/* message */}
            {message && (
              <p
                role="status"
                className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                {message}
              </p>
            )}

            {/* edit form OR details */}
            {editing ? (
              <form onSubmit={onSave} className="mt-8 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="text-sm font-medium text-stone-700"
                    >
                      First name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      value={draft.first_name}
                      onChange={onType}
                      placeholder="Selam"
                      className={fieldStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="text-sm font-medium text-stone-700"
                    >
                      Last name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      value={draft.last_name}
                      onChange={onType}
                      placeholder="Tesfaye"
                      className={fieldStyle}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-stone-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    value={draft.username}
                    onChange={onType}
                    placeholder="selam_writes"
                    className={fieldStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="text-sm font-medium text-stone-700"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={draft.bio}
                    onChange={onType}
                    placeholder="Tell people a little about yourself"
                    className={`${fieldStyle} resize-none`}
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-amber-800 px-5 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-amber-900"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 space-y-4">
                {/* bio */}
                <div className="rounded-2xl bg-[#faf6f0] p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    About
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    {user.bio || "No bio yet. Tap “Edit profile” to add one."}
                  </p>
                </div>

                {/* details */}
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#faf6f0] p-5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Email
                    </dt>
                    <dd className="mt-2 break-words text-sm font-medium">
                      {user.email}
                    </dd>
                  </div>

                  <div className="rounded-2xl bg-[#faf6f0] p-5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Username
                    </dt>
                    <dd className="mt-2 break-words text-sm font-medium">
                      {user.username ? `@${user.username}` : "Not set"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* logout confirmation */}
      {askLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4">
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="font-serif text-xl font-semibold">
              Leaving already?
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              You can sign back in whenever you like.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAskLeave(false)}
                className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={onLeave}
                className="rounded-full bg-rose-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-800"
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
