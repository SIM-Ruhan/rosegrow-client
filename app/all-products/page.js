"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { CATEGORIES, INPUT } from "@/lib/config";

function Catalog() {
  const sp = useSearchParams();
  const [f, setF] = useState({ search: "", category: "", min: "", max: "", sort: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const featured = sp.get("featured") || "";
  const deals = sp.get("deals") || "";

  useEffect(() => {
    setF((x) => ({ ...x, search: sp.get("search") || "", category: sp.get("category") || "" }));
  }, [sp]);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ...f, featured, deals });
    [...qs.keys()].forEach((k) => !qs.get(k) && qs.delete(k));
    const t = setTimeout(() => api(`/api/products?${qs}`).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false)), 250);
    return () => clearTimeout(t);
  }, [f, featured, deals]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const heading = deals ? "Best Deals" : featured === "new" ? "New Arrivals" : featured === "trending" ? "Trending" : f.category || "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold text-pink-700">{heading}</h1>
      <div className="mt-4 grid gap-3 rounded-2xl border border-pink-100 bg-white p-3 sm:grid-cols-2 lg:grid-cols-5">
        <input className={INPUT} placeholder="Search products..." value={f.search} onChange={set("search")} />
        <select className={INPUT} value={f.category} onChange={set("category")}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input className={INPUT} type="number" placeholder="Min ৳" value={f.min} onChange={set("min")} />
          <input className={INPUT} type="number" placeholder="Max ৳" value={f.max} onChange={set("max")} />
        </div>
        <select className={INPUT} value={f.sort} onChange={set("sort")}>
          <option value="">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <button onClick={() => setF({ search: "", category: "", min: "", max: "", sort: "" })} className="rounded-lg border border-pink-200 text-sm text-pink-600 hover:bg-pink-50">Reset</button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-gray-500">Loading...</p>
      ) : products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
      ) : (
        <p className="py-16 text-center text-gray-500">No products found.</p>
      )}
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Catalog /></Suspense>;
}
