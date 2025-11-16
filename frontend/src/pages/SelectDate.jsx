import { useState } from "react";
import DatePicker from "react-date-picker";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SelectDate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const zone = params.get("zone");

  const [date, setDate] = useState(new Date());

  const checkSlots = () => {
    navigate(`/slots?zone=${zone}&date=${date.toISOString()}`);
  };

  return (
    <div className="p-8 text-white max-w-xl mx-auto bg-black/40 backdrop-blur-xl rounded-xl">
      <h1 className="text-3xl font-bold mb-6">Choose Date</h1>

      <div className="mb-6">
        <DatePicker
          value={date}
          onChange={setDate}
          className="text-black px-3 py-2 rounded"
        />
      </div>

      <button onClick={checkSlots}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
        Check Availability
      </button>
    </div>
  );
}
