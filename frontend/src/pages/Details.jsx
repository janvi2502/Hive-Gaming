import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Details() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const slot = params.get("slot");
  const zone = params.get("zone");
  const date = params.get("date");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    people: 1,
    note: "",
  });

  const submit = async () => {
    const res = await fetch("http://localhost:4000/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slot, zone, date })
    });

    const data = await res.json();
    navigate(`/confirm?booking=${data.id}`);
  };

  return (
    <div className="p-8 text-white max-w-xl mx-auto bg-black/50 rounded-xl">
      <h1 className="text-3xl font-bold mb-6">Enter Details</h1>

      <input placeholder="Name"
        className="w-full mb-4 p-3 rounded text-black"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input placeholder="Phone"
        className="w-full mb-4 p-3 rounded text-black"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
      />

      <input type="number" placeholder="People"
        className="w-full mb-4 p-3 rounded text-black"
        value={form.people}
        onChange={e => setForm({ ...form, people: e.target.value })}
      />

      <textarea placeholder="Any notes..."
        className="w-full mb-4 p-3 rounded text-black"
        value={form.note}
        onChange={e => setForm({ ...form, note: e.target.value })}
      />

      <button onClick={submit}
        className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 w-full">
        Continue to Confirmation
      </button>
    </div>
  );
}
