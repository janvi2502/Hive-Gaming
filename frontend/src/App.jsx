// frontend/src/App.jsx
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import confetti from "canvas-confetti";
import "react-datepicker/dist/react-datepicker.css";

import HeroCarousel from "./HeroCarousel";

const API_BASE = "http://localhost:4000/api";

export default function App() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const date = useMemo(
    () => selectedDate.toISOString().split("T")[0],
    [selectedDate]
  );

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(null);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const currentStep = useMemo(() => {
    if (!zoneId || !date) return 1;
    if (!selectedSlot) return 2;
    return 3;
  }, [zoneId, date, selectedSlot]);

  // load zones once
  useEffect(() => {
    async function loadZones() {
      try {
        setLoadingZones(true);
        const res = await fetch(`${API_BASE}/zones`);
        const data = await res.json();
        setZones(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load zones.");
      } finally {
        setLoadingZones(false);
      }
    }
    loadZones();
  }, []);

  async function loadSlots() {
    if (!zoneId || !date) {
      setMessage("Select zone and date first.");
      return;
    }
    try {
      setLoadingSlots(true);
      setMessage(null);
      setSelectedSlot(null);
      setErrors((prev) => ({ ...prev, slot: undefined }));

      const res = await fetch(
        `${API_BASE}/availability?zoneId=${zoneId}&date=${date}`
      );
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load availability.");
    } finally {
      setLoadingSlots(false);
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!zoneId) newErrors.zoneId = "Please select a zone.";
    if (!date) newErrors.date = "Please pick a date.";
    if (!selectedSlot) newErrors.slot = "Please choose a time slot.";
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!/^\d{10}$/.test(phone))
      newErrors.phone = "Enter a valid 10-digit phone number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleBooking() {
    if (!validateForm()) {
      setMessage("Please fix the highlighted fields.");
      return;
    }

    try {
      setBookingLoading(true);
      setMessage(null);

      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          zoneId: Number(zoneId),
          date,
          startTime: selectedSlot.startTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Booking failed.");
        return;
      }

      setMessage("Booking confirmed! 🎉");

      // reset form
      setName("");
      setPhone("");
      setZoneId("");
      setSelectedSlot(null);
      setSlots([]);
      setErrors({});
      setSelectedDate(new Date());

      // confetti
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while booking.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-50">
      {/* full-width hero */}
      <HeroCarousel onBookClick={() => setShowBooking(true)} />

      {/* booking section */}
      <AnimatePresence>
      {showBooking && (
        <motion.section
          id="booking"
          key="booking"
          className="relative z-10 flex justify-center px-4 pb-14 -mt-10 sm:-mt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35 }}
        >
        {/* glow behind card */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
          <div className="h-40 w-[26rem] sm:w-[32rem] rounded-full bg-violet-500/15 blur-3xl translate-y-10" />
        </div>

        <motion.div
          className="w-full max-w-2xl rounded-3xl border border-white/5 
                     bg-slate-900/70 backdrop-blur-2xl 
                     shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* header */}
          <div className="px-6 pt-5 pb-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-9 w-9 rounded-2xl bg-violet-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-violet-500/40"
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                H
              </motion.div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Book your slot
                </h2>
                <p className="text-xs sm:text-sm text-slate-300/80">
                  Choose zone, time &amp; drop in. Payment will come later.
                </p>
              </div>
            </div>
          </div>

          {/* stepper */}
          <div className="px-6 pt-3 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
              {["Zone & Date", "Slot", "Details"].map((label, idx) => {
                const step = idx + 1;
                const active = currentStep === step;
                const done = currentStep > step;
                return (
                  <div key={label} className="flex-1 flex items-center">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="flex items-center justify-center rounded-full border w-5 h-5 text-[10px] cursor-default"
                        initial={false}
                        animate={{
                          backgroundColor: active
                            ? "rgba(129, 140, 248, 1)"
                            : done
                            ? "rgba(16, 185, 129, 1)"
                            : "rgba(15,23,42,1)",
                          borderColor: active || done
                            ? "rgba(248, 250, 252, 0.9)"
                            : "rgba(148, 163, 184, 1)",
                          color:
                            active || done
                              ? "rgba(15,23,42,1)"
                              : "rgba(148,163,184,1)",
                          scale: active ? 1.1 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        {done ? "✓" : step}
                      </motion.div>
                      <span
                        className={
                          active
                            ? "text-violet-200"
                            : done
                            ? "text-emerald-200"
                            : "text-slate-400"
                        }
                      >
                        {label}
                      </span>
                    </div>
                    {step < 3 && (
                      <div className="flex-1 h-px ml-2 bg-gradient-to-r from-slate-600/60 to-slate-600/10" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* body */}
          <div className="px-6 pb-6 pt-4 space-y-6">
            {/* 1. zone + date */}
            <section className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wide text-slate-400">
                    Gaming Zone
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-sm outline-none focus:ring-2 focus:ring-violet-500/70 focus:border-violet-400"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                  >
                    <option value="">Select zone</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                  {errors.zoneId && (
                    <p className="text-xs text-red-400 mt-1">{errors.zoneId}</p>
                  )}
                  {loadingZones && (
                    <p className="text-[11px] text-slate-400">Loading zones…</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wide text-slate-400">
                    Date
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(d) => d && setSelectedDate(d)}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    maxDate={new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    )}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-sm outline-none focus:ring-2 focus:ring-violet-500/70 focus:border-violet-400"
                  />
                  {errors.date && (
                    <p className="text-xs text-red-400 mt-1">{errors.date}</p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, translateY: -2 }}
                whileTap={{ scale: 0.97 }}
                className="mt-1 w-full rounded-xl bg-violet-500 hover:bg-violet-400 transition-colors py-2.5 text-sm font-semibold shadow-lg shadow-violet-500/30"
                onClick={loadSlots}
                disabled={loadingSlots}
              >
                {loadingSlots ? "Checking…" : "Check Availability"}
              </motion.button>
            </section>

            {/* 2. slots */}
            <AnimatePresence mode="wait">
              {currentStep >= 2 && (
                <motion.section
                  key="step-slots"
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Available Slots
                  </p>
                  <div className="min-h-[44px]">
                    <AnimatePresence mode="popLayout">
                      {slots.length === 0 && (
                        <motion.p
                          className="text-[11px] text-slate-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          No slots loaded yet. Pick a zone &amp; date and tap
                          “Check Availability”.
                        </motion.p>
                      )}
                      {slots.length > 0 && (
                        <motion.div
                          className="flex flex-wrap gap-2"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { staggerChildren: 0.03 },
                            },
                          }}
                        >
                          {slots.map((slot) => {
                            const disabled = slot.status === "booked";
                            const isSelected =
                              selectedSlot?.startTime === slot.startTime &&
                              selectedSlot?.endTime === slot.endTime;
                            return (
                              <motion.button
                                key={slot.startTime}
                                type="button"
                                onClick={() =>
                                  !disabled && setSelectedSlot(slot)
                                }
                                disabled={disabled}
                                className={[
                                  "px-3 py-1.5 rounded-full text-xs border transition",
                                  disabled
                                    ? "bg-slate-800/70 text-slate-500 line-through cursor-not-allowed border-slate-700"
                                    : isSelected
                                    ? "bg-amber-400 text-black border-amber-300 shadow-md"
                                    : "bg-emerald-500/90 border-emerald-400 hover:bg-emerald-400 text-black",
                                ].join(" ")}
                                variants={{
                                  hidden: { opacity: 0, y: 8 },
                                  visible: { opacity: 1, y: 0 },
                                }}
                                whileHover={
                                  !disabled ? { scale: 1.05 } : undefined
                                }
                                whileTap={
                                  !disabled ? { scale: 0.95 } : undefined
                                }
                              >
                                {slot.startTime}–{slot.endTime}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errors.slot && (
                      <p className="text-xs text-red-400 mt-2">
                        {errors.slot}
                      </p>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* 3. details */}
            <AnimatePresence mode="wait">
              {currentStep >= 3 && (
                <motion.section
                  key="step-details"
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Your Details
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-sm outline-none focus:ring-2 focus:ring-violet-500/70 focus:border-violet-400"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-400 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-sm outline-none focus:ring-2 focus:ring-violet-500/70 focus:border-violet-400"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "");
                          setPhone(onlyDigits.slice(0, 10));
                        }}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-400 mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedSlot && (
                      <motion.p
                        className="text-[11px] text-emerald-300/90"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        Selected:{" "}
                        <b>
                          {selectedSlot.startTime}–{selectedSlot.endTime}
                        </b>{" "}
                        on <b>{date}</b>
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-colors py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                  >
                    {bookingLoading
                      ? "Booking…"
                      : "Confirm Booking (no payment yet)"}
                  </motion.button>
                </motion.section>
              )}
            </AnimatePresence>

            {message && (
              <AnimatePresence>
                <motion.p
                  key={message}
                  className="text-[12px] text-amber-300 border-t border-white/5 pt-3"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                >
                  {message}
                </motion.p>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.section>
      )}
      </AnimatePresence>

      {/* success popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900/90 border border-emerald-400/40 rounded-2xl px-6 py-5 text-center shadow-xl max-w-sm mx-auto"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="text-3xl mb-2">🎉</div>
              <h2 className="text-lg font-semibold mb-1">
                Booking Confirmed
              </h2>
              <p className="text-sm text-slate-300 mb-3">
                Your slot is locked. You&apos;ll receive a confirmation shortly.
              </p>
              <p className="text-xs text-emerald-300/90">
                (Payment step will come here later.)
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
