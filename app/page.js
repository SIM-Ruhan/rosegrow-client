"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Headset, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { CATEGORIES, PROMO, catHref } from "@/lib/config";

const Reveal = ({ children }) => (
  <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="mx-auto mt-12 max-w-7xl px-4">
    {children}
  </motion.section>
);

const Grid = ({ title, products, href }) => (
  <Reveal>
    <div className="mb-4 flex items-end justify-between">
      <h2 className="font-display text-2xl font-bold text-pink-700">{title}</h2>
      <Link href={href} className="text-sm text-pink-600 hover:underline">View all →</Link>
    </div>
    {products.length ? (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.slice(0, 8).map((p) => <ProductCard key={p._id} p={p} />)}</div>
    ) : (
      <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">No products yet. Admins can mark products from the dashboard.</p>
    )}
  </Reveal>
);

const TRUST = [
  { icon: Truck, t: "Fast Delivery", d: "Dhaka 1–2 days · Outside Dhaka 3–5 days" },
  { icon: RefreshCw, t: "Easy Exchange", d: "7-day exchange for damaged or wrong items" },
  { icon: ShieldCheck, t: "100% Authentic", d: "Original products from trusted brands" },
  { icon: Headset, t: "Support", d: "Friendly help for every order" },
];

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [byCat, setByCat] = useState([]);
  useEffect(() => {
    api("/api/products/by-category?per=4").then(setByCat).catch(() => {});
    api("/api/products?featured=trending&limit=8").then(setTrending).catch(() => {});
    api("/api/products?featured=new&limit=8").then(setFresh).catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      <div className="mt-6 overflow-hidden bg-pink-500 py-2 text-sm text-white">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[0, 1].map((n) => <span key={n} className="px-8">{`${PROMO} • ${PROMO} • `}</span>)}
        </div>
      </div>

      <Reveal>
        <h2 className="mb-4 font-display text-2xl font-bold text-pink-700">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link key={c.name} href={catHref(c.name)} className="group flex flex-col items-center rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-100 to-white p-5 text-center transition hover:shadow-md">
              <span className="text-4xl transition group-hover:scale-110">{c.emoji}</span>
              <span className="mt-2 text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Grid title="Trending in Bangladesh" products={trending} href="/all-products?featured=trending" />
      <Grid title="New Arrivals" products={fresh} href="/all-products?featured=new" />

      {CATEGORIES.map((c) => {
        const list = byCat.find((x) => x.category === c.name)?.products;
        return list?.length ? <Grid key={c.name} title={`${c.emoji} ${c.name}`} products={list} href={catHref(c.name)} /> : null;
      })}

      <Reveal>
        <div className="rounded-3xl bg-pink-100/70 p-6">
          <h2 className="mb-5 text-center font-display text-2xl font-bold text-pink-700">Delivery &amp; Exchange</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map(({ icon: I, t, d }) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                <I className="mt-0.5 shrink-0 text-pink-500" />
                <div><p className="font-medium">{t}</p><p className="text-xs text-gray-500">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </>
  );
}
