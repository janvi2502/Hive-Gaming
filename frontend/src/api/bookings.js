const API_URL = "http://localhost:4000";

export async function getAvailableSlots() {
  const res = await fetch(`${API_URL}/slots`);
  return res.json();
}

export async function createBooking(data) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}
