export const SITE = {
  name: "Rose.Glow",
  tagline: "Beauty that blooms",
  phone: "+880 1700-000000",
  email: "hello@roseglow.com",
  address: "Dhaka, Bangladesh",
};

export const CATEGORIES = [
  { name: "Skincare", emoji: "🧴" },
  { name: "Makeup", emoji: "💄" },
  { name: "Hair Care", emoji: "💆‍♀️" },
  { name: "Fragrance", emoji: "🌸" },
  { name: "Body Care", emoji: "🧼" },
  { name: "Nail & Tools", emoji: "💅" },
];

export const catHref = (c) => `/all-products?category=${encodeURIComponent(c)}`;

export const NAV_LINKS = [
  ...CATEGORIES.map((c) => ({ 
    label: c.name, href: catHref(c.name) })),
  { label: "Best Deals", href: "/all-products?deals=1" },
  { label: "New Arrivals", href: "/all-products?featured=new" },
];

export const PROMO = "Upto FLAT 50% off on selected cosmetics • Cash on Delivery available all over Bangladesh • 100% authentic products";

// Hero banners live in /public/banners. Replace the images (same file names) or edit links here.
// Add more objects to HERO.main to make the big banner auto-slide.
// hotspots = clickable areas in % of the banner (left/top/width/height).
export const HERO = {
  main: [
    {
      src: "/banners/main.jpg.webp",
      href: "/all-products?deals=1",
      hotspots: [
        { href: catHref("Makeup"), left: 76.5, top: 6.7, width: 22.8, height: 11.3, label: "Makeup" },
        { href: catHref("Skincare"), left: 76.5, top: 19.6, width: 22.8, height: 11.3, label: "Skin Care" },
        { href: catHref("Hair Care"), left: 76.5, top: 32.6, width: 22.8, height: 11.3, label: "Hair Care" },
        { href: catHref("Nail & Tools"), left: 76.5, top: 45.8, width: 22.8, height: 11.1, label: "Accessories" },
      ],
    },
  ],
  small: [
    { src: "/banners/s1.jpg", href: catHref("Makeup"), alt: "Makeup" },
    { src: "/banners/s2.jpg", href: catHref("Skincare"), alt: "Skin Care" },
    { src: "/banners/s3.jpg", href: catHref("Body Care"), alt: "Body Care" },
  ],
};

export const shippingFee = (city) => (/dhaka/i.test(city || "") ? 70 : 130);
export const tk = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;
export const placeholder = "https://placehold.co/600x600/fde2ea/be185d?text=Rose+Glow";

export const INPUT = "w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300";
export const BTN = "inline-flex items-center justify-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50";
export const BTN_O = "inline-flex items-center justify-center gap-2 rounded-full border border-pink-300 px-5 py-2.5 text-sm font-medium text-pink-600 transition hover:bg-pink-50 disabled:opacity-50";
