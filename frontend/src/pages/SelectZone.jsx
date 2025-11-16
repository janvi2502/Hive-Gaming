import { useNavigate } from "react-router-dom";

const zones = [
  { id: "pc", name: "PC Gaming", img: "/pc.png" },
  { id: "snooker", name: "Snooker", img: "/snooker.png" },
  { id: "pool", name: "Pool", img: "/pool.png" },
  { id: "simulator", name: "Simulator", img: "/sim.png" }
];

export default function SelectZone() {
  const navigate = useNavigate();

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Choose Your Zone</h1>

      <div className="grid grid-cols-2 gap-6">
        {zones.map(z => (
          <div key={z.id}
            className="bg-black/40 backdrop-blur-xl rounded-xl shadow-lg cursor-pointer hover:scale-105 transition p-6 flex flex-col items-center"
            onClick={() => navigate(`/select-date?zone=${z.id}`)}
          >
            <img src={z.img} className="h-32 object-contain mb-4" />
            <h2 className="text-xl font-semibold">{z.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
