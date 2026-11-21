"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authClient } from "./auth-client";
import { api } from "./api";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
export const itemKey = (i) => `${i.productId}|${i.variant || ""}`;
export const makeItem = (p, variant = "", qty = 1) => ({
  productId: p._id, name: p.name, image: p.image, price: p.price, stock: p.stock, variant, qty,
});

export function StoreProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const token = session?.session?.token || null;
  const [me, setMe] = useState(null);
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const synced = useRef(false);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("cart") || "[]")); } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    if (token && synced.current) api("/api/cart", { method: "PUT", body: { items: cart }, token }).catch(() => {});
  }, [cart, ready, token]);

  useEffect(() => {
    if (!token) { setMe(null); synced.current = false; return; }
    if (!ready) return;
    let off = false;
    (async () => {
      try {
        const [u, c] = await Promise.all([api("/api/me", { token }), api("/api/cart", { token })]);
        if (off) return;
        setMe(u);
        setCart((local) => {
          const m = new Map();
          [...c.items, ...local].forEach((i) => {
            const k = itemKey(i), e = m.get(k);
            m.set(k, e ? { ...e, qty: Math.max(e.qty, i.qty) } : i);
          });
          return [...m.values()];
        });
      } catch {}
      synced.current = true;
    })();
    return () => { off = true; };
  }, [token, ready]);

  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(""), 2200); }, []);

  const addToCart = (p, variant = "", qty = 1) => {
    setCart((c) => {
      const it = makeItem(p, variant, qty), k = itemKey(it);
      return c.some((x) => itemKey(x) === k)
        ? c.map((x) => (itemKey(x) === k ? { ...x, qty: Math.min(x.qty + qty, p.stock || 99) } : x))
        : [...c, it];
    });
    notify("Added to cart");
  };
  const setQty = (k, qty) => setCart((c) => c.map((x) => (itemKey(x) === k ? { ...x, qty: Math.max(1, Math.min(qty, x.stock || 99)) } : x)));
  const removeItem = (k) => setCart((c) => c.filter((x) => itemKey(x) !== k));
  const clearCart = () => setCart([]);
  const logout = async () => {
    synced.current = false;
    await authClient.signOut();
    setCart([]); setMe(null); localStorage.removeItem("cart");
    window.location.href = "/";
  };

  const value = {
    session, isPending, token, me, isAdmin: me?.role === "admin", cart, ready,
    count: cart.reduce((a, i) => a + i.qty, 0), addToCart, setQty, removeItem, clearCart, logout, notify,
  };
  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-pink-600 px-5 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </Ctx.Provider>
  );
}
