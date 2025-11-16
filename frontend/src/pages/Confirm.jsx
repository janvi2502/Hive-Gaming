import { useSearchParams } from "react-router-dom";

export default function Confirm() {
  const [params] = useSearchParams();
  const booking = params.get("booking");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold">Booking Confirmed 🎉</h1>
      <p className="mt-4 text-xl">Your booking ID: <b>{booking}</b></p>

      <p className="mt-8 text-gray-400">You'll receive a notification soon.</p>
    </div>
  );
}
