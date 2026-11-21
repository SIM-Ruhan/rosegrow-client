"use client";
import { LogOut } from "lucide-react";

export default function DashShell({ title, tabs, tab, setTab, logout, children }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[230px_1fr]">
      <aside className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-pink-100 bg-white p-3 md:min-h-[75vh] md:flex-col">
        <p className="hidden px-3 py-2 font-display text-lg font-bold text-pink-700 md:block">{title}</p>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition ${tab === t.id ? "bg-pink-500 text-white" : "text-gray-700 hover:bg-pink-50"}`}
          >
            {t.label}
          </button>
        ))}
        <button onClick={logout} className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-pink-600 hover:bg-pink-50 md:mt-auto">
          <LogOut size={16} /> Logout
        </button>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
