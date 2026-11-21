"use client";
import { useEffect, useState } from "react";
import { api, uploadImage } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BTN, BTN_O, CATEGORIES, INPUT, placeholder, tk } from "@/lib/config";

const Card = ({ children, className = "" }) => <div className={`rounded-2xl border border-pink-100 bg-white p-4 ${className}`}>{children}</div>;
const Loading = () => <p className="text-gray-500">Loading...</p>;

export function Overview() {
  const { token } = useStore();
  const [s, setS] = useState(null);
  useEffect(() => { api("/api/admin/stats", { token }).then(setS).catch(() => {}); }, [token]);
  if (!s) return <Loading />;
  const cards = [["Total Sales", tk(s.totalSales)], ["Orders", s.orders], ["Pending Orders", s.pending], ["Users", s.users], ["Products", s.products]];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {cards.map(([l, v]) => <Card key={l}><p className="text-sm text-gray-500">{l}</p><p className="mt-1 text-2xl font-semibold text-pink-600">{v}</p></Card>)}
    </div>
  );
}

export function ProductsTable({ onEdit }) {
  const { token, notify } = useStore();
  const [list, setList] = useState(null);
  const load = () => api("/api/products?limit=500").then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  const toggle = async (p, field) => { await api(`/api/products/${p._id}/toggle`, { method: "PATCH", token, body: { field } }); load(); };
  const del = async (p) => { if (confirm(`Delete "${p.name}"?`)) { await api(`/api/products/${p._id}`, { method: "DELETE", token }); notify("Deleted"); load(); } };
  if (!list) return <Loading />;
  const chip = (on) => `rounded-full px-3 py-1 text-xs ${on ? "bg-pink-500 text-white" : "border border-pink-200 text-gray-500"}`;
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase text-gray-500"><tr><th className="p-2">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>New</th><th>Trending</th><th></th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p._id} className="border-t border-pink-50">
              <td className="flex items-center gap-2 p-2"><img src={p.image || placeholder} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="line-clamp-1">{p.name}</span></td>
              <td>{p.category}</td><td>{tk(p.price)}</td><td>{p.stock}</td>
              <td><button onClick={() => toggle(p, "newArrival")} className={chip(p.newArrival)}>{p.newArrival ? "On" : "Off"}</button></td>
              <td><button onClick={() => toggle(p, "trending")} className={chip(p.trending)}>{p.trending ? "On" : "Off"}</button></td>
              <td className="space-x-3 whitespace-nowrap"><button onClick={() => onEdit(p)} className="text-pink-600 hover:underline">Edit</button><button onClick={() => del(p)} className="text-red-500 hover:underline">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <p className="p-6 text-center text-gray-500">No products yet.</p>}
    </Card>
  );
}

const empty = { name: "", category: CATEGORIES[0].name, brand: "", image: "", description: "", price: "", comparePrice: "", stock: "", variants: "", trending: false, newArrival: false };

export function ProductForm({ initial, onDone }) {
  const { token, notify } = useStore();
  const [f, setF] = useState(initial ? { ...empty, ...initial, variants: (initial.variants || []).join(", ") } : empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr("");
    try { setF({ ...f, image: await uploadImage(file, token) }); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const body = { ...f, variants: f.variants.split(",").map((v) => v.trim()).filter(Boolean) };
    try {
      await api(initial ? `/api/products/${initial._id}` : "/api/products", { method: initial ? "PUT" : "POST", token, body });
      notify(initial ? "Product updated" : "Product added");
      setF(empty); onDone();
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <Card>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <input required className={INPUT} placeholder="Product name" value={f.name} onChange={set("name")} />
        <select className={INPUT} value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</select>
        <input className={INPUT} placeholder="Brand" value={f.brand} onChange={set("brand")} />
        <input className={INPUT} placeholder="Variants / sizes / shades (comma separated, optional)" value={f.variants} onChange={set("variants")} />
        <input required type="number" min="0" className={INPUT} placeholder="Price (৳)" value={f.price} onChange={set("price")} />
        <input type="number" min="0" className={INPUT} placeholder="Regular price before discount (optional)" value={f.comparePrice} onChange={set("comparePrice")} />
        <input required type="number" min="0" className={INPUT} placeholder="Available stock" value={f.stock} onChange={set("stock")} />
        <div className="flex items-center gap-3">
          {f.image && <img src={f.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
          <input type="file" accept="image/*" onChange={upload} className="text-xs" />
        </div>
        <textarea rows={4} className={`${INPUT} sm:col-span-2`} placeholder="Description / details" value={f.description} onChange={set("description")} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.newArrival} onChange={set("newArrival")} className="accent-pink-500" /> New Arrival</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.trending} onChange={set("trending")} className="accent-pink-500" /> Trending</label>
        {err && <p className="text-sm text-red-500 sm:col-span-2">{err}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button disabled={busy} className={BTN}>{busy ? "Working..." : initial ? "Update Product" : "Add Product"}</button>
          {initial && <button type="button" onClick={onDone} className={BTN_O}>Cancel</button>}
        </div>
      </form>
    </Card>
  );
}

export function UsersTable() {
  const { token } = useStore();
  const [u, setU] = useState(null);
  useEffect(() => { api("/api/admin/users", { token }).then(setU).catch(() => setU([])); }, [token]);
  if (!u) return <Loading />;
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="text-xs uppercase text-gray-500"><tr><th className="p-2">Name</th><th>Email</th><th>Joined</th></tr></thead>
        <tbody>{u.map((x) => <tr key={x._id} className="border-t border-pink-50"><td className="p-2">{x.name}</td><td>{x.email}</td><td>{x.createdAt ? new Date(x.createdAt).toLocaleDateString() : "-"}</td></tr>)}</tbody>
      </table>
    </Card>
  );
}

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
export function OrdersTable() {
  const { token, notify } = useStore();
  const [o, setO] = useState(null);
  const load = () => api("/api/admin/orders", { token }).then(setO).catch(() => setO([]));
  useEffect(() => { load(); }, [token]);
  const setStatus = async (id, status) => { await api(`/api/admin/orders/${id}/status`, { method: "PATCH", token, body: { status } }); notify("Status updated"); load(); };
  if (!o) return <Loading />;
  if (!o.length) return <Card className="text-center text-gray-500">No orders yet.</Card>;
  return (
    <div className="space-y-3">
      {o.map((x) => (
        <Card key={x.orderId}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="font-semibold text-pink-600">{x.orderId}</p><p className="text-xs text-gray-500">{new Date(x.createdAt).toLocaleString()}</p></div>
            <select value={x.status} onChange={(e) => setStatus(x.orderId, e.target.value)} className="rounded-lg border border-pink-200 px-2 py-1 text-sm">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
            <div>{x.items.map((i, n) => <p key={n}>{i.name}{i.variant && ` (${i.variant})`} × {i.qty}</p>)}</div>
            <div className="text-gray-600">
              <p>{x.shipping.name} · {x.shipping.phone}</p><p>{x.shipping.address}, {x.shipping.city}</p>
              <p>{x.paymentMethod === "cod" ? "COD" : "Online"} · {x.paymentStatus} · <b>{tk(x.total)}</b></p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

const lpEmpty = { title: "", slug: "", headline: "", subtitle: "", heroImage: "", offerText: "", ctaText: "Order Now", productIds: [], active: true };
export function LandingBuilder() {
  const { token, notify } = useStore();
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [f, setF] = useState(lpEmpty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");
  const load = () => api("/api/landing", { token }).then(setList).catch(() => {});
  useEffect(() => { load(); api("/api/products?limit=500").then(setProducts).catch(() => {}); }, [token]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pick = (id) => setF({ ...f, productIds: f.productIds.includes(id) ? f.productIds.filter((x) => x !== id) : [...f.productIds, id] });

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (file) try { setF({ ...f, heroImage: await uploadImage(file, token) }); } catch (x) { setErr(x.message); }
  };
  const save = async (e) => {
    e.preventDefault(); setErr("");
    try {
      await api(editId ? `/api/landing/${editId}` : "/api/landing", { method: editId ? "PUT" : "POST", token, body: f });
      notify("Landing page saved"); setF(lpEmpty); setEditId(null); load();
    } catch (x) { setErr(x.message); }
  };
  const del = async (id) => { if (confirm("Delete this landing page?")) { await api(`/api/landing/${id}`, { method: "DELETE", token }); load(); } };
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <input required className={INPUT} placeholder="Campaign title" value={f.title} onChange={set("title")} />
          <input className={INPUT} placeholder="URL slug (auto from title)" value={f.slug} onChange={set("slug")} />
          <input className={INPUT} placeholder="Headline" value={f.headline} onChange={set("headline")} />
          <input className={INPUT} placeholder="Offer badge (e.g. FLAT 40% OFF)" value={f.offerText} onChange={set("offerText")} />
          <input className={`${INPUT} sm:col-span-2`} placeholder="Subtitle" value={f.subtitle} onChange={set("subtitle")} />
          <input className={INPUT} placeholder="Button text" value={f.ctaText} onChange={set("ctaText")} />
          <div className="flex items-center gap-3">
            {f.heroImage && <img src={f.heroImage} alt="" className="h-12 w-12 rounded-lg object-cover" />}
            <input type="file" accept="image/*" onChange={upload} className="text-xs" />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium">Products on this page</p>
            <div className="grid max-h-48 gap-1 overflow-y-auto rounded-lg border border-pink-100 p-2 sm:grid-cols-2">
              {products.map((p) => (
                <label key={p._id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.productIds.includes(p._id)} onChange={() => pick(p._id)} className="accent-pink-500" /> {p.name}</label>
              ))}
            </div>
          </div>
          {err && <p className="text-sm text-red-500 sm:col-span-2">{err}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button className={BTN}>{editId ? "Update Page" : "Create Landing Page"}</button>
            {editId && <button type="button" onClick={() => { setF(lpEmpty); setEditId(null); }} className={BTN_O}>Cancel</button>}
          </div>
        </form>
      </Card>
      {list.map((l) => (
        <Card key={l._id} className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="font-medium">{l.title}</p><a href={`/lp/${l.slug}`} target="_blank" className="text-xs text-pink-600 hover:underline">{origin}/lp/{l.slug}</a></div>
          <div className="space-x-3 text-sm">
            <button onClick={() => { navigator.clipboard?.writeText(`${origin}/lp/${l.slug}`); notify("Link copied"); }} className="text-pink-600">Copy link</button>
            <button onClick={() => { setF({ ...lpEmpty, ...l }); setEditId(l._id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-pink-600">Edit</button>
            <button onClick={() => del(l._id)} className="text-red-500">Delete</button>
          </div>
        </Card>
      ))}
    </div>
  );
}
