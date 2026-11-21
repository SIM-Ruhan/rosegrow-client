"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BTN, INPUT, placeholder, shippingFee, tk } from "@/lib/config";

function Checkout() {
  const sp = useSearchParams();
  const router = useRouter();
  const { cart, ready, session, token, clearCart } = useStore();
  const buyMode = sp.get("mode") === "buy";
  const [buyItems, setBuyItems] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "Dhaka", note: "" });
  const [pay, setPay] = useState("cod");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(
    sp.get("payment") === "failed" ? "Payment failed. Please try again." : sp.get("payment") === "cancelled" ? "Payment was cancelled." : ""
  );

  useEffect(() => {
    if (buyMode) { try { setBuyItems(JSON.parse(sessionStorage.getItem("buynow") || "[]")); } catch { setBuyItems([]); } }
  }, [buyMode]);
  useEffect(() => {
    const u = session?.user;
    if (u) setForm((f) => ({ ...f, name: f.name || u.name || "", email: f.email || u.email || "" }));
  }, [session]);

  const items = buyMode ? buyItems : ready ? cart : null;
  if (!items) return <p className="py-20 text-center text-gray-500">Loading...</p>;
  if (!items.length) return <p className="py-20 text-center text-gray-500">{err || "Nothing to checkout."}</p>;

  const sub = items.reduce((a, i) => a + i.price * i.qty, 0);
  const fee = shippingFee(form.city);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await api("/api/orders", {
        method: "POST", token,
        body: { items: items.map(({ productId, qty, variant }) => ({ productId, qty, variant })), shipping: form, paymentMethod: pay },
      });
      if (r.gatewayUrl) {
        if (!buyMode) sessionStorage.setItem("clearCart", r.orderId);
        window.location.href = r.gatewayUrl;
        return;
      }
      if (!buyMode) clearCart();
      router.push(`/order-success?orderId=${r.orderId}`);
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-pink-700">Checkout</h1>
        {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</p>}
        <div className="grid gap-3 rounded-2xl border border-pink-100 bg-white p-4 sm:grid-cols-2">
          <input required className={INPUT} placeholder="Full name" value={form.name} onChange={set("name")} />
          <input required className={INPUT} placeholder="Phone (01XXXXXXXXX)" value={form.phone} onChange={set("phone")} />
          <input required type="email" className={`${INPUT} sm:col-span-2`} placeholder="Email" value={form.email} onChange={set("email")} />
          <input required className={`${INPUT} sm:col-span-2`} placeholder="Full address" value={form.address} onChange={set("address")} />
          <input required className={INPUT} placeholder="City / District (e.g. Dhaka)" value={form.city} onChange={set("city")} />
          <input className={INPUT} placeholder="Order note (optional)" value={form.note} onChange={set("note")} />
        </div>
        <div className="space-y-2 rounded-2xl border border-pink-100 bg-white p-4">
          <p className="font-medium">Payment method</p>
          {[["online", "Online Payment (bKash / Nagad / Card via SSLCOMMERZ)"], ["cod", "Cash on Delivery"]].map(([v, l]) => (
            <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${pay === v ? "border-pink-500 bg-pink-50" : "border-pink-100"}`}>
              <input type="radio" name="pay" checked={pay === v} onChange={() => setPay(v)} className="accent-pink-500" /> {l}
            </label>
          ))}
        </div>
      </div>

      <div className="h-fit space-y-3 rounded-2xl border border-pink-100 bg-white p-4">
        <p className="font-medium">Order summary</p>
        {items.map((i) => (
          <div key={`${i.productId}${i.variant}`} className="flex gap-2 text-sm">
            <img src={i.image || placeholder} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1"><p className="line-clamp-1">{i.name}</p><p className="text-xs text-gray-500">{i.variant} × {i.qty}</p></div>
            <span>{tk(i.price * i.qty)}</span>
          </div>
        ))}
        <hr className="border-pink-100" />
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{tk(sub)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{tk(fee)}</span></div>
        <div className="flex justify-between font-semibold"><span>Total</span><span className="text-pink-600">{tk(sub + fee)}</span></div>
        <button disabled={busy} className={`${BTN} w-full`}>{busy ? "Please wait..." : pay === "cod" ? "Place Order" : "Pay Now"}</button>
      </div>
    </form>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Checkout /></Suspense>;
}
