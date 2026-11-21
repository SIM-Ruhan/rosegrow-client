"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { placeholder, tk } from "@/lib/config";

export default function ProductCard({ p }) {
  const off = p.comparePrice > p.price ? Math.round(100 - (p.price / p.comparePrice) * 100) : 0;
  return (
    <motion.div whileHover={{ y: -4 }} className="flex flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
      <Link href={`/product/${p._id}`} className="relative block aspect-square bg-pink-50">
        <img src={p.image || placeholder} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
        {off > 0 && <span className="absolute left-2 top-2 rounded-full bg-pink-600 px-2 py-0.5 text-xs font-medium text-white">-{off}%</span>}
        {p.stock <= 0 && <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-gray-600">Sold out</span>}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-pink-500">{p.category}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-medium">{p.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-pink-600">{tk(p.price)}</span>
          {off > 0 && <span className="text-xs text-gray-400 line-through">{tk(p.comparePrice)}</span>}
        </div>
        <Link href={`/product/${p._id}`} className="mt-3 rounded-full border border-pink-300 py-2 text-center text-sm font-medium text-pink-600 transition hover:bg-pink-500 hover:text-white">
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
