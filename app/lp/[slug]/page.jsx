"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { makeItem } from "@/lib/store";
import { BTN, placeholder, tk } from "@/lib/config";

export default function LandingPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [lp, setLp] = useState(null);
  const [err, setErr] = useState("");
  const [img, setImg] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api(`/api/landing/${slug}`)
      .then((x) => { setLp(x); setVariant(x.product.variants?.[0] || ""); })
      .catch((e) => setErr(e.message));
  }, [slug]);

  if (err) return <p className="py-24 text-center text-gray-500">{err}</p>;
  if (!lp) return <p className="py-24 text-center text-gray-500">Loading...</p>;

  const p = lp.product;
  const images = lp.images?.length ? lp.images : [p.image || placeholder];
  const off = p.comparePrice > p.price ? Math.round(100 - (p.price / p.comparePrice) * 100) : 0;
  const out = p.stock <= 0;

  const buyNow = () => {
    sessionStorage.setItem("buynow", JSON.stringify([makeItem(p, variant, qty)]));
    router.push("/checkout?mode=buy");
  };
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-8 md:grid-cols-2">
        {/* gallery */}
        <div>
          <div
            onMouseMove={onMove}
            onMouseLeave={() => setZoom(null)}
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-pink-100 bg-white"
          >
            <img
              src={images[img]}
              alt={lp.title}
              className="h-full w-full object-cover"
              style={{ transform: zoom ? "scale(2)" : "scale(1)", transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center", transition: "transform .15s ease-out" }}
            />
            {!zoom && <span className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white md:block">Hover to zoom</span>}
            {off > 0 && <span className="absolute left-3 top-3 rounded-full bg-pink-600 px-3 py-1 text-sm font-medium text-white">Save {off}%</span>}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((src, i) => (
                <button key={src} onClick={() => setImg(i)} className={`aspect-square overflow-hidden rounded-xl border-2 ${i === img ? "border-pink-500" : "border-pink-100"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* details */}
        <div>
          <h1 className="font-display text-2xl font-bold leading-snug md:text-3xl">{lp.title}</h1>
          {lp.subtitle && <p className="mt-2 text-gray-600">{lp.subtitle}</p>}
          <hr className="my-4 border-pink-100" />

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-pink-600">{tk(p.price)}</span>
            {off > 0 && <span className="text-gray-400 line-through">{tk(p.comparePrice)}</span>}
          </div>
          <p className={`mt-2 text-sm ${out ? "text-red-500" : "text-green-600"}`}>{out ? "Out of stock" : p.stock > 10 ? "In stock – more than 10 available" : `Only ${p.stock} left`}</p>

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
            <span className="text-sm font-medium">Quantity</span>
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 rounded-full border border-pink-200">−</button>
            <span className="w-8 text-center">{qty}</span>
            <button onClick={() => setQty(Math.min(p.stock || 1, qty + 1))} className="h-9 w-9 rounded-full border border-pink-200">+</button>
          </div>

          <button disabled={out} onClick={buyNow} className={`${BTN} mt-6 w-full py-3.5 text-base`}>Buy Now</button>
          <p className="mt-3 text-center text-xs text-gray-500">Cash on Delivery · Online payment (bKash / Nagad / Card) · 100% authentic</p>
        </div>
      </div>

      {/* description */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-pink-100 bg-white">
        <div className="border-b border-pink-100 bg-pink-500 px-5 py-3 text-sm font-medium text-white">Description</div>
        <p className="whitespace-pre-line p-5 text-sm leading-relaxed text-gray-600">{lp.description}</p>
      </div>

      {/* related */}
      {lp.related?.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-bold text-pink-700">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {lp.related.map((r) => <ProductCard key={r._id} p={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}