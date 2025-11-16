import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Slots() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const zone = params.get("zone");
  const date = params.get("date");

  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/slots?zone=${zone}&date=${date}`)
      .then(r => r.json())
      .then(setSlots);
  }, []);

  return (
    <div className="p-10 text-white max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Available Slots</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {slots.map(s => (
          <div 
            key={s.id}
            className="bg-black/50 p-4 rounded-xl cursor-pointer hover:bg-green-600"
            onClick={() => navigate(`/details?slot=${s.id}&zone=${zone}&date=${date}`)}
          >
            <p className="text-xl">{s.time}</p>
            <p className="text-sm text-green-400">Available</p>
          </div>
        ))}
      </div>
    </div>
  );
}
