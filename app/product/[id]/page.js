"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { makeItem, useStore } from "@/lib/store";
import { BTN, BTN_O, placeholder, tk } from "@/lib/config";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, notify } = useStore();
  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");

  useEffect(() => {
    api(`/api/products/${id}`).then((x) => { setP(x); setVariant(x.variants?.[0] || ""); }).catch((e) => setErr(e.message));
    api(`/api/products/${id}/reviews`).then(setReviews).catch(() => {});
  }, [id]);

  if (err) return <p className="py-20 text-center text-gray-500">{err}</p>;
  if (!p) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  const off = p.comparePrice > p.price ? Math.round(100 - (p.price / p.comparePrice) * 100) : 0;
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
  const out = p.stock <= 0;

  const buyNow = () => {
    sessionStorage.setItem("buynow", JSON.stringify([makeItem(p, variant, qty)]));
    router.push("/checkout?mode=buy");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <img src={p.image || placeholder} alt={p.name} className="w-full rounded-3xl border border-pink-100 bg-pink-50 object-cover" />
        <div>
          <p className="text-sm text-pink-500">{p.category}{p.brand && ` · ${p.brand}`}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{p.name}</h1>
          {avg && <p className="mt-1 flex items-center gap-1 text-sm text-gray-600"><Star size={16} className="fill-pink-400 text-pink-400" /> {avg} ({reviews.length} reviews)</p>}
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-pink-600">{tk(p.price)}</span>
            {off > 0 && <><span className="text-gray-400 line-through">{tk(p.comparePrice)}</span><span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">Save {off}%</span></>}
          </div>
          <p className={`mt-2 text-sm ${out ? "text-red-500" : "text-green-600"}`}>{out ? "Out of stock" : `In stock (${p.stock} available)`}</p>

          {p.variants?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Size / Shade</p>
              <div className="flex flex-wrap gap-2">
                {p.variants.map((v) => (
                  <button key={v} onClick={() => setVariant(v)} className={`rounded-full border px-4 py-1.5 text-sm ${variant === v ? "border-pink-500 bg-pink-500 text-white" : "border-pink-200 hover:bg-pink-50"}`}>{v}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-medium">Qty</span>
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-8 w-8 rounded-full border border-pink-200">−</button>
            <span className="w-6 text-center">{qty}</span>
            <button onClick={() => setQty(Math.min(p.stock || 1, qty + 1))} className="h-8 w-8 rounded-full border border-pink-200">+</button>
          </div>

          <div className="mt-6 flex gap-3">
            <button disabled={out} onClick={() => addToCart(p, variant, qty)} className={`${BTN_O} flex-1`}>Add to Cart</button>
            <button disabled={out} onClick={buyNow} className={`${BTN} flex-1`}>Buy Now</button>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 font-semibold">Product Details</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{p.description || "No description."}</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-3 font-display text-xl font-bold text-pink-700">Customer Reviews</h2>
        {reviews.length ? (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-xl border border-pink-100 bg-white p-4">
                <p className="text-sm font-medium">{r.userName} <span className="ml-2 text-pink-500">{"★".repeat(r.rating)}</span></p>
                <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-500">No reviews yet.</p>}
      </div>
    </div>
  );
}
