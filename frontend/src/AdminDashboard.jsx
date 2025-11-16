import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = "http://localhost:4000/api";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [zoneId, setZoneId] = useState("");
  const [status, setStatus] = useState("");
  const [zones, setZones] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const date = selectedDate.toISOString().split("T")[0];

  useEffect(() => {
    // load zones for filter
    fetch(`${API_BASE}/zones`)
      .then((r) => r.json())
      .then(setZones)
      .catch(console.error);
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("date", date);
      if (zoneId) params.set("zoneId", zoneId);
      if (status) params.set("status", status);

      const res = await fetch(`${API_BASE}/admin/bookings?` + params.toString(), {
        credentials: "include", // <- send cookies (admin_token)
      });

      // If not authenticated, send admin to login screen
      if (res.status === 401) {
        setLoading(false); // stop spinner
        window.location.href = "/admin/login";
        return;
      }

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [date, zoneId, status]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-6">
      {/* top bar */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-violet-500 flex items-center justify-center font-bold shadow-lg shadow-violet-500/40">
            H
          </div>
          <div>
            <h1 className="text-xl font-semibold">Hive Admin</h1>
            <p className="text-xs text-slate-400">
              Manage today&apos;s bookings and availability.
            </p>
          </div>
        </div>
      </header>

      {/* filters */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 mb-5 flex flex-wrap gap-4 items-center">
        <div className="space-y-1">
          <div className="text-xs uppercase text-slate-400">Date</div>
          <DatePicker
            selected={selectedDate}
            onChange={(d) => d && setSelectedDate(d)}
            dateFormat="dd/MM/yyyy"
            className="px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-sm outline-none"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase text-slate-400">Zone</div>
          <select
            className="px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-sm"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
          >
            <option value="">All zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase text-slate-400">Status</div>
          <select
            className="px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button
          onClick={loadBookings}
          className="ml-auto px-4 py-2 rounded-xl bg-violet-500 text-sm font-medium hover:bg-violet-400"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 text-xs uppercase text-slate-400">
          Bookings for {date}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90">
              <tr className="text-slate-400 text-xs uppercase">
                <th className="text-left px-4 py-2">Time</th>
                <th className="text-left px-4 py-2">Zone</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-center text-xs text-slate-500"
                  >
                    No bookings for this filter.
                  </td>
                </tr>
              )}

              {bookings.map((b) => {
                let badgeColor =
                  b.status === "CONFIRMED"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : b.status === "COMPLETED"
                    ? "bg-sky-500/15 text-sky-300"
                    : "bg-rose-500/15 text-rose-300";

                return (
                  <tr
                    key={b.id}
                    className="border-t border-slate-800 hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-2">
                      {b.startTime}–{b.endTime}
                    </td>
                    <td className="px-4 py-2">{b.zone?.name}</td>
                    <td className="px-4 py-2">{b.user?.name}</td>
                    <td className="px-4 py-2">{b.user?.phone}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
