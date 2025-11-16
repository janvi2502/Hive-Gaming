function buildDateFromYMD(ymd) {
  // ymd = "2025-11-15"
  return new Date(ymd + "T00:00:00.000Z");
}

function generateSlots(openHour = 10, closeHour = 22) {
  const slots = [];
  for (let h = openHour; h < closeHour; h++) {
    const start = `${h.toString().padStart(2, '0')}:00`;
    const end = `${(h + 1).toString().padStart(2, '0')}:00`;
    slots.push({ startTime: start, endTime: end });
  }
  return slots;
}

function slotsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

module.exports = { buildDateFromYMD, generateSlots, slotsOverlap };
