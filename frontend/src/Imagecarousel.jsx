// frontend/src/ImageCarousel.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  { src: "/hive-1.png", caption: "LAN party vibes at Hive" },
  { src: "/hive-2.png", caption: "Clutch moments on PC" },
  { src: "/hive-3.png", caption: "Esports-ready setups" },
  { src: "/hive-4.png", caption: "Chill zone – snooker & more" },
  { src: "/hive-5.png", caption: "Gaming" },
  { src: "/hive-6.png", caption: "Games" },
  { src: "/hive-7.png", caption: "Chill zone" }


];

export default function ImageCarousel() {
  const [index, setIndex] = useState(0);

  // auto-advance every 6s
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  const current = slides[index];

  return (
    <div className="mt-2 mb-3">
      <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/5">
        <div className="aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4]">
          <AnimatePresence mode="wait">
            <motion.img
              key={current.src}
              src={current.src}
              alt={current.caption}
              className="h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
        </div>

        {/* subtle gradient at bottom for caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-3">
          <p className="text-[11px] sm:text-xs text-slate-200/90 drop-shadow">
            {current.caption}
          </p>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-violet-400" : "w-2 bg-slate-500/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
