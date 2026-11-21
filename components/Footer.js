import Link from "next/link";
import { CATEGORIES, SITE, catHref } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-pink-100 bg-pink-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-pink-600">{SITE.name}</h3>
          <p className="mt-2 text-sm text-gray-600">{SITE.tagline}. Authentic cosmetics delivered across Bangladesh.</p>
          <p className="mt-3 text-sm text-gray-600">📍 {SITE.address}<br />📞 {SITE.phone}<br />✉️ {SITE.email}</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {CATEGORIES.map((c) => <li key={c.name}><Link className="hover:text-pink-600" href={catHref(c.name)}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Customer Care</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link className="hover:text-pink-600" href="/all-products">All Products</Link></li>
            <li><Link className="hover:text-pink-600" href="/dashboard">My Orders</Link></li>
            <li><Link className="hover:text-pink-600" href="/cart">My Cart</Link></li>
            <li>Delivery &amp; Exchange</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">We Accept</h4>
          <p className="text-sm text-gray-600">Cash on Delivery<br />bKash · Nagad · Cards (via SSLCOMMERZ)</p>
        </div>
      </div>
      <p className="border-t border-pink-100 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
    </footer>
  );
}
