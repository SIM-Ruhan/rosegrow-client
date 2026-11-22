"use client";
import { useEffect, useState } from "react";
import { api, uploadImage } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BTN, BTN_O, INPUT, placeholder, tk } from "@/lib/config";

const empty = { title: "", subtitle: "", slug: "", description: "", images: [], price: "", comparePrice: "", stock: "", variants: "", relatedIds: [] };
const slugify = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// shrink big photos before upload (keeps ImgBB / Vercel request size small)
async function shrink(file) {
  try {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * s);
    c.height = Math.round(bmp.height * s);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob((b) => r(b || file), "image/jpeg", 0.85));
  } catch {
    return file;
  }
}

export default function LandingBuilder() {
  const { token, notify } = useStore();
  const [f, setF] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api("/api/landing", { token }).then(setList).catch(() => {});
  useEffect(() => {
    load();
    api("/api/products?limit=500").then(setProducts).catch(() => {});
  }, [token]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const onTitle = (e) => {
    const title = e.target.value;
    setF({ ...f, title, slug: editId || slugTouched ? f.slug : slugify(title) });
  };

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])].slice(0, 5 - f.images.length);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setErr("");
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadImage(await shrink(file), token));
      setF((x) => ({ ...x, images: [...x.images, ...urls].slice(0, 5) }));
    } catch (x) {
      setErr(x.message);
    }
    setUploading(false);
  };
  const removeImg = (i) => setF({ ...f, images: f.images.filter((_, n) => n !== i) });
  const makeMain = (i) => setF({ ...f, images: [f.images[i], ...f.images.filter((_, n) => n !== i)] });

  const toggleRel = (id) =>
    setF({ ...f, relatedIds: f.relatedIds.includes(id) ? f.relatedIds.filter((x) => x !== id) : f.relatedIds.length < 12 ? [...f.relatedIds, id] : f.relatedIds });

  const reset = () => { setF(empty); setEditId(null); setSlugTouched(false); setErr(""); };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const body = { ...f, variants: f.variants.split(",").map((v) => v.trim()).filter(Boolean) };
      await api(editId ? `/api/landing/${editId}` : "/api/landing", { method: editId ? "PUT" : "POST", token, body });
      notify("Landing page saved");
      reset();
      load();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  const edit = (l) => {
    setF({
      ...empty, title: l.title, subtitle: l.subtitle, slug: l.slug, description: l.description, images: l.images || [],
      price: l.price, comparePrice: l.comparePrice || "", stock: l.stock, variants: (l.variants || []).join(", "), relatedIds: l.relatedIds || [],
    });
    setEditId(l._id);
    setSlugTouched(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const del = async (l) => {
    if (!confirm(`Delete "${l.title}"?`)) return;
    await api(`/api/landing/${l._id}`, { method: "DELETE", token });
    notify("Deleted");
    load();
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shown = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="grid gap-3 rounded-2xl border border-pink-100 bg-white p-4 sm:grid-cols-2">
        <input required className={INPUT} placeholder="Title" value={f.title} onChange={onTitle} />
        <input required className={INPUT} placeholder="Subtitle (short line under the title)" value={f.subtitle} onChange={set("subtitle")} />

        <div className="sm:col-span-2">
          <input
            required
            className={INPUT}
            placeholder="Page address (slug), e.g. cerave-winter-combo"
            value={f.slug}
            onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }}
          />
          <p className="mt-1 text-xs text-gray-500">Link: {origin}/lp/{f.slug || "your-slug"}</p>
        </div>

        <input required type="number" min="1" className={INPUT} placeholder="Price (৳)" value={f.price} onChange={set("price")} />
        <input type="number" min="0" className={INPUT} placeholder="Regular price before discount (optional)" value={f.comparePrice} onChange={set("comparePrice")} />
        <input required type="number" min="0" className={INPUT} placeholder="Quantity in stock" value={f.stock} onChange={set("stock")} />
        <input className={INPUT} placeholder="Size / Shade options (comma separated, optional)" value={f.variants} onChange={set("variants")} />

        <textarea required rows={6} className={`${INPUT} sm:col-span-2`} placeholder="Description (new lines are kept)" value={f.description} onChange={set("description")} />

        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium">Photos ({f.images.length}/5) – 3 to 5 recommended, first photo is the main one</p>
          <div className="flex flex-wrap gap-3">
            {f.images.map((src, i) => (
              <div key={src} className="w-24">
                <img src={src} alt="" className="h-24 w-24 rounded-xl border border-pink-200 object-cover" />
                <div className="mt-1 flex justify-between text-xs">
                  {i === 0 ? <span className="text-pink-600">Main</span> : <button type="button" onClick={() => makeMain(i)} className="text-pink-600">Make main</button>}
                  <button type="button" onClick={() => removeImg(i)} className="text-red-500">Remove</button>
                </div>
              </div>
            ))}
            {f.images.length < 5 && (
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-pink-300 text-center text-xs text-pink-600 hover:bg-pink-50">
                {uploading ? "Uploading..." : "+ Add photos"}
                <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={onFiles} />
              </label>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium">Related products ({f.relatedIds.length} selected, up to 12)</p>
          <input className={`${INPUT} mb-2`} placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-pink-100 p-2 sm:grid-cols-2">
            {shown.map((p) => (
              <label key={p._id} className="flex cursor-pointer items-center gap-2 rounded-lg p-1 text-sm hover:bg-pink-50">
                <input type="checkbox" className="accent-pink-500" checked={f.relatedIds.includes(p._id)} onChange={() => toggleRel(p._id)} />
                <img src={p.image || placeholder} alt="" className="h-8 w-8 rounded object-cover" />
                <span className="line-clamp-1">{p.name}</span>
              </label>
            ))}
            {!shown.length && <p className="p-2 text-sm text-gray-500">No products found.</p>}
          </div>
        </div>

        {err && <p className="text-sm text-red-500 sm:col-span-2">{err}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button disabled={busy || uploading} className={BTN}>{busy ? "Saving..." : editId ? "Update Landing Page" : "Create Landing Page"}</button>
          {editId && <button type="button" onClick={reset} className={BTN_O}>Cancel</button>}
        </div>
      </form>

      {list.map((l) => (
        <div key={l._id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-pink-100 bg-white p-3">
          <img src={l.images?.[0] || placeholder} alt="" className="h-14 w-14 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 font-medium">{l.title}</p>
            <a href={`/lp/${l.slug}`} target="_blank" className="text-xs text-pink-600 hover:underline">{origin}/lp/{l.slug}</a>
            <p className="text-xs text-gray-500">{tk(l.price)} · Stock {l.stock}</p>
          </div>
          <div className="space-x-3 text-sm">
            <button onClick={() => { navigator.clipboard?.writeText(`${origin}/lp/${l.slug}`); notify("Link copied"); }} className="text-pink-600">Copy link</button>
            <button onClick={() => edit(l)} className="text-pink-600">Edit</button>
            <button onClick={() => del(l)} className="text-red-500">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}