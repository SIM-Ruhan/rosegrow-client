import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCart from "@/components/FloatingCart";
import MobileNav from "@/components/MobileNav";

export const metadata = {
  title: "Rose Glow – Cosmetics & Beauty Store",
  description: "Authentic skincare, makeup, hair care and fragrance delivered across Bangladesh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <div className="h-16 md:hidden" />
          <FloatingCart />
          <MobileNav />
        </StoreProvider>
      </body>
    </html>
  );
}
