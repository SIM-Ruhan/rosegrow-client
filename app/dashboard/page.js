"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashShell from "@/components/DashShell";
import CartView from "@/components/CartView";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BTN, INPUT, placeholder, tk } from "@/lib/config";

const TABS = [{ id: "cart", label: "My Cart" }, { id: "orders", label: "My Orders" }, { id: "reviews", label: "Waiting for Review" }];
const badge = { Pending: "bg-yellow-100 text-yellow-700", Confirmed: "bg-blue-100 text-blue-700", Shipped: "bg-purple-100 text-purple-700", Delivered: "bg-green-100 text-green-700", Cancelled: "bg-red-100 text-red-700" };

function Orders({ token }) {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api("/api/orders/mine", { token }).then(setOrders).catch(() => setOrders([])); }, [token]);
  if (!orders) return <p className="text-gray-500">Loading...</p>;
  if (!orders.length) return <p className="rounded-2xl bg-white p-8 text-center text-gray-500">No orders yet. <Link href="/all-products" className="text-pink-600">Shop now</Link></p>;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.orderId} className="rounded-2xl border border-pink-100 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="font-semibold text-pink-600">{o.orderId}</p><p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p></div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[o.status]}`}>{o.status}</span>
          </div>
          <div className="mt-3 space-y-1 text-sm">
            {o.items.map((i, n) => <p key={n}>{i.name}{i.variant && ` (${i.variant})`} × {i.qty}</p>)}
          </div>
          <p className="mt-3 text-sm">Total <b>{tk(o.total)}</b> · {o.paymentMethod === "cod" ? "COD" : "Online"} · {o.paymentStatus}</p>
        </div>
      ))}
    </div>
  );
}

function ReviewRow({ r, token, done }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const submit = async () => {
    try { await api("/api/reviews", { method: "POST", token, body: { orderId: r.orderId, productId: r.productId, rating, comment } }); done(); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-pink-100 bg-white p-4 sm:flex-row">
      <img src={r.image || placeholder} alt="" className="h-20 w-20 rounded-xl object-cover" />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">{r.name} <span className="text-xs text-gray-400">· {r.orderId}</span></p>
        <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className={`text-xl ${n <= rating ? "text-pink-500" : "text-gray-300"}`}>★</button>)}</div>
        <textarea className={INPUT} rows={2} placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
        {err && <p className="text-xs text-red-500">{err}</p>}
        <button onClick={submit} className={BTN}>Submit review</button>
      </div>
    </div>
  );
}

function Reviews({ token }) {
  const [list, setList] = useState(null);
  const load = () => api("/api/reviews/pending", { token }).then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, [token]);
  if (!list) return <p className="text-gray-500">Loading...</p>;
  if (!list.length) return <p className="rounded-2xl bg-white p-8 text-center text-gray-500">Nothing to review right now. Delivered items will appear here.</p>;
  return <div className="space-y-3">{list.map((r) => <ReviewRow key={r.orderId + r.productId} r={r} token={token} done={load} />)}</div>;
}

export default function Dashboard() {
  const { session, isPending, token, isAdmin, logout } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState("cart");
  useEffect(() => { if (!isPending && !session) router.replace("/login"); }, [isPending, session, router]);
  if (!session) return <p className="py-20 text-center text-gray-500">Loading...</p>;
  const tabs = isAdmin ? [...TABS, { id: "admin", label: "Admin Dashboard →" }] : TABS;
  return (
    <DashShell title="My Account" tabs={tabs} tab={tab} setTab={(t) => (t === "admin" ? router.push("/admin") : setTab(t))} logout={logout}>
      <h1 className="mb-4 font-display text-2xl font-bold text-pink-700">{TABS.find((t) => t.id === tab)?.label}</h1>
      {tab === "cart" && <CartView />}
      {tab === "orders" && <Orders token={token} />}
      {tab === "reviews" && <Reviews token={token} />}
    </DashShell>
  );
}
