"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BTN, BTN_O, tk } from "@/lib/config";

function Success() {
  const id = useSearchParams().get("orderId");
  const { clearCart } = useStore();
  const [o, setO] = useState(null);

  useEffect(() => {
    if (!id) return;
    api(`/api/order-status/${id}`).then(setO).catch(() => {});
    if (sessionStorage.getItem("clearCart") === id) { clearCart(); sessionStorage.removeItem("clearCart"); }
  }, [id]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto text-pink-500" size={64} />
      <h1 className="mt-4 font-display text-3xl font-bold text-pink-700">Thank you for your order!</h1>
      <p className="mt-2 text-gray-600">Your order has been placed successfully.</p>
      <div className="mt-6 rounded-2xl border border-pink-100 bg-white p-5 text-left text-sm">
        <p className="text-gray-500">Order ID</p>
        <p className="text-xl font-semibold tracking-wide text-pink-600">{id}</p>
        {o && (
          <div className="mt-3 space-y-1">
            <p>Total: <b>{tk(o.total)}</b></p>
            <p>Payment: {o.paymentMethod === "cod" ? "Cash on Delivery" : "Online"} – {o.paymentStatus}</p>
            <p>Status: {o.status}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/all-products" className={BTN}>Continue shopping</Link>
        <Link href="/dashboard" className={BTN_O}>My orders</Link>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Success /></Suspense>;
}
