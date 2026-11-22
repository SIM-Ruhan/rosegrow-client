"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashShell from "@/components/DashShell";
import { Overview, OrdersTable, ProductForm, ProductsTable, UsersTable } from "@/components/admin";
import LandingBuilder from "@/components/LandingBuilder";
import { useStore } from "@/lib/store";
import Link from "next/link";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "All Products" },
  { id: "add", label: "Add Product" },
  { id: "users", label: "All Users" },
  { id: "orders", label: "Orders" },
  { id: "landing", label: "Landing Page Builder" },
];

export default function Admin() {
  const { session, isPending, me, isAdmin, logout } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(null);

  useEffect(() => { if (!isPending && !session) router.replace("/login"); }, [isPending, session, router]);
  if (!session || !me) return <p className="py-20 text-center text-gray-500">Loading...</p>;
  if (!isAdmin) return <p className="py-20 text-center text-gray-500">This area is for admins only. <br></br> <div className="pt-10"><Link href={"/"} className="rounded-xl px-4 py-2 border border-pink-200 text-sm text-pink-600 hover:bg-pink-50">Return to home</Link></div></p>;

  const go = (t) => { setEditing(null); setTab(t); };
  return (
    <DashShell title="Admin" tabs={TABS} tab={tab} setTab={go} logout={logout}>
      <h1 className="mb-4 font-display text-2xl font-bold text-pink-700">{editing ? "Edit Product" : TABS.find((t) => t.id === tab)?.label}</h1>
      {tab === "overview" && <Overview />}
      {tab === "products" && <ProductsTable onEdit={(p) => { setEditing(p); setTab("add"); }} />}
      {tab === "add" && <ProductForm key={editing?._id || "new"} initial={editing} onDone={() => { setEditing(null); setTab("products"); }} />}
      {tab === "users" && <UsersTable />}
      {tab === "orders" && <OrdersTable />}
      {tab === "landing" && <LandingBuilder />}
    </DashShell>
  );
}
