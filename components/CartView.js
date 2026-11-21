"use client";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { itemKey, useStore } from "@/lib/store";
import { BTN, placeholder, tk } from "@/lib/config";

export default function CartView() {
  const { cart, ready, setQty, removeItem } = useStore();
  if (!ready) return null;
  if (!cart.length)
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-10 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/all-products" className={`${BTN} mt-4`}>Start shopping</Link>
      </div>
    );
  const sub = cart.reduce((a, i) => a + i.price * i.qty, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        {cart.map((i) => {
          const k = itemKey(i);
          return (
            <div key={k} className="flex gap-3 rounded-2xl border border-pink-100 bg-white p-3">
              <img src={i.image || placeholder} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <Link href={`/product/${i.productId}`} className="text-sm font-medium hover:text-pink-600">{i.name}</Link>
                {i.variant && <p className="text-xs text-gray-500">{i.variant}</p>}
                <p className="text-sm font-semibold text-pink-600">{tk(i.price)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <button onClick={() => setQty(k, i.qty - 1)} className="rounded-full border border-pink-200 p-1"><Minus size={14} /></button>
                  <span className="w-6 text-center text-sm">{i.qty}</span>
                  <button onClick={() => setQty(k, i.qty + 1)} className="rounded-full border border-pink-200 p-1"><Plus size={14} /></button>
                </div>
              </div>
              <button onClick={() => removeItem(k)} className="self-start text-gray-400 hover:text-pink-600" aria-label="Remove"><Trash2 size={18} /></button>
            </div>
          );
        })}
      </div>
      <div className="h-fit rounded-2xl border border-pink-100 bg-white p-4">
        <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">{tk(sub)}</span></div>
        <p className="mt-1 text-xs text-gray-500">Shipping calculated at checkout.</p>
        <Link href="/checkout" className={`${BTN} mt-4 w-full`}>Proceed to Checkout</Link>
      </div>
    </div>
  );
}
