"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { BTN } from "@/lib/config";

export default function Landing() {
  const { slug } = useParams();
  const [lp, setLp] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api(`/api/landing/${slug}`).then(setLp).catch((e) => setErr(e.message)); }, [slug]);

  if (err) return <p className="py-24 text-center text-gray-500">{err}</p>;
  if (!lp) return <p className="py-24 text-center text-gray-500">Loading...</p>;

  return (
    <div>
      <section className="bg-gradient-to-b from-pink-100 to-pink-50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            {lp.offerText && <span className="inline-block rounded-full bg-pink-600 px-4 py-1 text-sm font-medium text-white">{lp.offerText}</span>}
            <h1 className="mt-4 font-display text-4xl font-bold text-pink-700 md:text-5xl">{lp.headline || lp.title}</h1>
            <p className="mt-3 text-gray-600">{lp.subtitle}</p>
            <a href="#products" className={`${BTN} mt-6`}>{lp.ctaText}</a>
          </div>
          {lp.heroImage && <img src={lp.heroImage} alt="" className="w-full rounded-3xl object-cover shadow-lg" />}
        </div>
      </section>
      <section id="products" className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{lp.products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        <p className="mt-8 text-center text-sm"><Link href="/all-products" className="text-pink-600 hover:underline">Browse the full store →</Link></p>
      </section>
    </div>
  );
}
