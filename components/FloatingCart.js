"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { tk } from "@/lib/config";

export default function FloatingCart() {
  const { cart, count, ready } = useStore();
  const path = usePathname();
  if (!ready || ["/cart", "/checkout", "/admin"].some((p) => path.startsWith(p))) return null;
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  return (
    <Link href="/cart" aria-label="Open cart" className="fixed bottom-20 right-0 z-40 w-[68px] overflow-hidden rounded-l-2xl shadow-xl transition hover:-translate-x-1 md:bottom-auto md:top-1/2 md:w-[76px] md:-translate-y-1/2">
      <div className="flex flex-col items-center gap-1 bg-pink-500 px-2 py-3 text-white">
        <ShoppingBag size={26} />
        <span className="text-xs font-medium">{count} {count === 1 ? "Item" : "Items"}</span>
      </div>
      <div className="bg-white py-2 text-center text-sm font-semibold text-pink-600">{tk(total)}</div>
    </Link>
  );
}
