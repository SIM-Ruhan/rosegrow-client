"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { NAV_LINKS, SITE } from "@/lib/config";

export default function Navbar() {
  const { count, session, isAdmin, logout } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const user = session?.user;

  const submit = (e) => {
    e.preventDefault();
    router.push(`/all-products${q ? `?search=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="font-display text-2xl font-bold text-pink-600">
          {SITE.name}
        </Link>

        <form onSubmit={submit} className="order-last flex w-full flex-1 md:order-none md:w-auto md:max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for lipstick, serum, perfume..."
            className="w-full rounded-l-full border border-r-0 border-pink-200 bg-pink-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button className="rounded-r-full bg-pink-500 px-4 text-white hover:bg-pink-600" aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/cart" className="relative rounded-full p-2 text-pink-600 hover:bg-pink-50" aria-label="Cart">
            <ShoppingBag size={24} />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1 text-xs text-white">
              {count}
            </span>
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-pink-200 font-semibold text-pink-700">
                {user.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : (user.name || "U")[0].toUpperCase()}
              </button>
              {open && (
                <>
                  <div className="fixed inset-0" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 z-10 mt-2 w-60 rounded-xl border border-pink-100 bg-white p-3 shadow-lg">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                    <Link onClick={() => setOpen(false)} href={isAdmin ? "/admin" : "/dashboard"} className="mt-3 block rounded-lg px-3 py-2 text-sm hover:bg-pink-50">
                      Dashboard
                    </Link>
                    <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-pink-600 hover:bg-pink-50">
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600">
              Sign In / Sign Up
            </Link>
          )}
        </div>
      </div>

      <nav className="border-t border-pink-100 bg-pink-50/60">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm font-medium md:justify-center">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="whitespace-nowrap text-gray-700 transition hover:text-pink-600">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
