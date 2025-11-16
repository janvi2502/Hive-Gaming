import { useState } from "react";

const API_BASE = "http://localhost:4000/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@hive.local");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // IMPORTANT: send/receive cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
      } else {
        // Go to admin dashboard
        window.location.href = "/admin";
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-slate-50">
        <h1 className="text-xl font-semibold mb-2">Hive Admin Login</h1>
        <p className="text-xs text-slate-400 mb-4">
          Only authorized staff can access this area.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-sm outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-sm outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          {message && (
            <p className="text-xs text-rose-300">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 rounded-xl bg-violet-500 hover:bg-violet-400 py-2.5 text-sm font-semibold"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
