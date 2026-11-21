"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { BTN, BTN_O, INPUT } from "@/lib/config";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("in");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } =
      mode === "in"
        ? await authClient.signIn.email({ email: f.email, password: f.password })
        : await authClient.signUp.email({ name: f.name, email: f.email, password: f.password });
    if (error) { setErr(error.message || "Something went wrong"); setBusy(false); return; }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <h1 className="text-center font-display text-3xl font-bold text-pink-700">{mode === "in" ? "Welcome back" : "Create account"}</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "up" && <input required className={INPUT} placeholder="Full name" value={f.name} onChange={set("name")} />}
          <input required type="email" className={INPUT} placeholder="Email" value={f.email} onChange={set("email")} />
          <input required minLength={8} type="password" className={INPUT} placeholder="Password (min 8 characters)" value={f.password} onChange={set("password")} />
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button disabled={busy} className={`${BTN} w-full`}>{mode === "in" ? "Sign In" : "Sign Up"}</button>
        </form>
        <div className="my-4 text-center text-xs text-gray-400">or</div>
        <button onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })} className={`${BTN_O} w-full`}>Continue with Google</button>
        <p className="mt-5 text-center text-sm text-gray-600">
          {mode === "in" ? "New here?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); }} className="font-medium text-pink-600 hover:underline">
            {mode === "in" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
