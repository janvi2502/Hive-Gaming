// frontend/src/HeroCarousel.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  { src: "/hive-1.png", caption: "LAN party vibes at Hive" },
  { src: "/hive-2.png", caption: "Clutch moments on PC" },
  { src: "/hive-3.png", caption: "Esports-ready setups" },
  { src: "/hive-4.png", caption: "Chill zone – snooker & pool" },
  { src: "/hive-5.png", caption: "Casual sessions with friends" },
  { src: "/hive-6.png", caption: "All about the clutch moments" },
  { src: "/hive-7.png", caption: "Late-night gaming energy" },
];

export default function HeroCarousel({ onBookClick }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  const current = slides[index];

  function scrollToBooking() {
    const el = document.getElementById("booking");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden bg-black text-slate-50">
      {/* background image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current.src}
          src={current.src}
          alt={current.caption}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/10" />

      {/* top glow bar */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[40rem] rounded-full bg-violet-500/20 blur-3xl" />

      {/* content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 flex flex-col md:flex-row items-center gap-10">
        {/* left: hero text */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-violet-300 mb-3">
              Hive Gaming Zone
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight mb-4">
              Lock your{" "}
              <span className="text-violet-300">perfect slot</span> for
              gaming, snooker &amp; more.
            </h1>
            <p className="text-sm sm:text-base text-slate-200/85 max-w-xl mb-6">
              High-refresh gaming PCs, snooker &amp; pool tables, cozy vibes.
              Pick a zone, choose a time, walk in ready to play.
            </p>

            <div className="flex flex-wrap items-center gap-3">
            <button
                onClick={() => {
                    onBookClick();
                    setTimeout(() => scrollToBooking(), 100); // smooth scroll after reveal
                }}
                className="px-5 py-2.5 rounded-full bg-violet-500 hover:bg-violet-400 text-sm font-semibold shadow-lg shadow-violet-500/40 transition-colors"
            >
            Book a slot
            </button>   
            <button
                onClick={() => {
                    onBookClick();
                    setTimeout(() => scrollToBooking(), 100);
                    }}
                className="px-4 py-2.5 rounded-full border border-slate-500/70 text-sm text-slate-100 hover:bg-slate-900/60 transition-colors"
            >
            Check availability
            </button>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              Open daily • Slots released 7 days in advance • Pay at venue (for now)
            </p>
          </motion.div>
        </div>

        {/* right: slide caption + dots (desktop only) */}
        <motion.div
          className="hidden md:flex flex-col items-end gap-3 flex-1"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="px-4 py-3 rounded-2xl bg-black/55 border border-white/10 max-w-sm backdrop-blur-md">
            <p className="text-xs text-slate-100 mb-1">
              {current.caption}
            </p>
            <p className="text-[11px] text-slate-400">
              Slide {index + 1} of {slides.length}
            </p>
          </div>

          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-violet-400" : "w-2 bg-slate-500/60"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
