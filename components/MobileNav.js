"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Grid2x2, LayoutGrid, House, ShoppingBag, User, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORIES, catHref } from "@/lib/config";

export default function MobileNav() {
  const { count, session, isAdmin } = useStore();
  const path = usePathname();
  const [sheet, setSheet] = useState(false);
  useEffect(() => setSheet(false), [path]);

  const account = !session ? "/login" : isAdmin ? "/admin" : "/dashboard";
  const items = [
    { label: "Home", href: "/", icon: House, active: path === "/" },
    { label: "All", href: "/all-products", icon: LayoutGrid, active: path.startsWith("/all-products") },
    { label: "Categories", onClick: () => setSheet(true), icon: Grid2x2, active: sheet },
    { label: "Cart", href: "/cart", icon: ShoppingBag, active: path === "/cart", badge: count },
    { label: "My Account", href: account, icon: User, active: ["/dashboard", "/admin", "/login"].some((p) => path.startsWith(p)) },
  ];

  const cls = (a) => `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${a ? "font-semibold text-pink-600" : "text-gray-500"}`;

  return (
    <>
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/30" onClick={() => setSheet(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.25 }} className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 pb-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-lg font-bold text-pink-700">Categories</p>
                <button onClick={() => setSheet(false)} aria-label="Close"><X size={22} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((c) => (
                  <Link key={c.name} href={catHref(c.name)} className="flex flex-col items-center rounded-2xl bg-pink-50 p-3 text-center text-xs font-medium">
                    <span className="text-3xl">{c.emoji}</span>{c.name}
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex gap-2 text-sm">
                <Link href="/all-products?deals=1" className="flex-1 rounded-full bg-pink-500 py-2 text-center text-white">Best Deals</Link>
                <Link href="/all-products?featured=new" className="flex-1 rounded-full border border-pink-300 py-2 text-center text-pink-600">New Arrivals</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-[45] flex border-t border-pink-100 bg-white shadow-[0_-4px_16px_rgba(190,24,93,0.08)] md:hidden">
        {items.map(({ label, href, onClick, icon: I, active, badge }) => {
          const inner = (
            <>
              <I size={22} />
              {badge > 0 && <span className="absolute right-[26%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] text-white">{badge}</span>}
              {label}
            </>
          );
          return href ? <Link key={label} href={href} className={cls(active)}>{inner}</Link> : <button key={label} onClick={onClick} className={cls(active)}>{inner}</button>;
        })}
      </nav>
    </>
  );
}
