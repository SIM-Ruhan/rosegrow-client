"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HERO } from "@/lib/config";

function Main() {
  const [i, setI] = useState(0);
  const n = HERO.main.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 8000);
    return () => clearInterval(t);
  }, [n]);
  const b = HERO.main[i];

  return (
    <div className="relative aspect-[1360/1060] overflow-hidden rounded-2xl bg-pink-100 shadow-sm md:rounded-3xl lg:aspect-auto lg:h-[var(--hero-h)] lg:min-w-0 lg:flex-1">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
          <Link href={b.href} aria-label="Special offer">
            <img src={b.src} alt="Special offer sale" className="h-full w-full object-cover" />
          </Link>
          {b.hotspots?.map((h) => (
            <Link
              key={h.label}
              href={h.href}
              aria-label={h.label}
              className="absolute rounded-full transition hover:bg-pink-500/15 hover:ring-2 hover:ring-pink-400"
              style={{ left: `${h.left}%`, top: `${h.top}%`, width: `${h.width}%`, height: `${h.height}%` }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      {n > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
          {HERO.main.map((_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-pink-600" : "w-2 bg-white/80"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Hero() {
  return (
    <section
      className="mx-auto mt-3 grid w-[95%] gap-3 lg:flex lg:gap-4"
      style={{ "--hero-h": "min(calc(100vh - 215px), 48vw)" }}
    >
      <Main />
      <div className="grid grid-cols-3 gap-2 lg:flex lg:h-[var(--hero-h)] lg:w-[calc((var(--hero-h)-2rem)/3*600/340)] lg:shrink-0 lg:flex-col lg:gap-4">
        {HERO.small.map((b, k) => (
          <motion.div key={b.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * k }} whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-xl shadow-sm md:rounded-2xl lg:min-h-0 lg:flex-1">
            <Link href={b.href} aria-label={b.alt}>
              <img src={b.src} alt={b.alt} className="aspect-[600/340] w-full object-cover lg:h-full lg:aspect-auto" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}