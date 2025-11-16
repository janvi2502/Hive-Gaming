const zoneSelect = document.getElementById("zoneSelect");
const dateInput = document.getElementById("dateInput");
const checkAvailabilityBtn = document.getElementById("checkAvailabilityBtn");
const slotsContainer = document.getElementById("slotsContainer");
const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const selectedSlotInput = document.getElementById("selectedSlotInput");
const bookBtn = document.getElementById("bookBtn");
const messageDiv = document.getElementById("message");
const yearSpan = document.getElementById("year");

yearSpan.textContent = new Date().getFullYear();

let selectedSlot = null;

// API base URL (same server)
const API_BASE = "";

// Load zones on page load
async function loadZones() {
  try {
    const res = await fetch(`${API_BASE}/api/zones`);
    const data = await res.json();

    zoneSelect.innerHTML = '<option value="">Select a zone</option>';
    data.forEach((zone) => {
      const option = document.createElement("option");
      option.value = zone.id;
      option.textContent = `${zone.name} (₹${zone.pricePerHour}/hr)`;
      zoneSelect.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    zoneSelect.innerHTML =
      '<option value="">Error loading zones</option>';
  }
}

// Load availability
async function loadAvailability() {
  messageDiv.textContent = "";
  selectedSlot = null;
  selectedSlotInput.value = "";

  const zoneId = zoneSelect.value;
  const date = dateInput.value;

  if (!zoneId || !date) {
    alert("Please select a zone and date first.");
    return;
  }

  slotsContainer.innerHTML = "<p>Loading slots...</p>";

  try {
    const res = await fetch(
      `${API_BASE}/api/availability?zoneId=${zoneId}&date=${date}`
    );
    const data = await res.json();

    slotsContainer.innerHTML = "";

    if (!data.slots || data.slots.length === 0) {
      slotsContainer.innerHTML = "<p>No slots found.</p>";
      return;
    }

    data.slots.forEach((slot) => {
      const btn = document.createElement("button");
      btn.classList.add("slot-btn");
      btn.textContent = `${slot.startTime} - ${slot.endTime}`;

      if (slot.status === "booked") {
        btn.disabled = true;
        btn.classList.add("slot-booked");
      } else {
        btn.classList.add("slot-available");
        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".slot-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectedSlot = slot;
          selectedSlotInput.value = `${data.date} | ${slot.startTime} - ${slot.endTime}`;
        });
      }

      slotsContainer.appendChild(btn);
    });
  } catch (err) {
    console.error(err);
    slotsContainer.innerHTML = "<p>Error loading slots.</p>";
  }
}

// Book a slot
async function bookSlot() {
  messageDiv.textContent = "";
  messageDiv.className = "message";

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const zoneId = parseInt(zoneSelect.value, 10);
  const date = dateInput.value;

  if (!name || !phone || !zoneId || !date || !selectedSlot) {
    messageDiv.textContent = "Please fill all fields and select a slot.";
    messageDiv.classList.add("error");
    return;
  }

  const payload = {
    name,
    phone,
    zoneId,
    date,
    startTime: selectedSlot.startTime
  };

  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      messageDiv.textContent = data.message || "Booking failed.";
      messageDiv.classList.add("error");
      return;
    }

    messageDiv.textContent = data.message;
    messageDiv.classList.add("success");

    // Reload availability so the slot becomes booked
    loadAvailability();
  } catch (err) {
    console.error(err);
    messageDiv.textContent = "Something went wrong.";
    messageDiv.classList.add("error");
  }
}

checkAvailabilityBtn.addEventListener("click", loadAvailability);
bookBtn.addEventListener("click", bookSlot);

// Set default date to today
const today = new Date().toISOString().split("T")[0];
dateInput.value = today;

// Init
loadZones();
