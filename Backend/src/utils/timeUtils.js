// Convert HH:mm time string to total minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes from midnight back to HH:mm string format
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}`;
};

// Calculate endTime given startTime (HH:mm) and duration in minutes
const calculateEndTime = (startTime, durationMinutes) => {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + Number(durationMinutes);
  return minutesToTime(endMins);
};

// Check if two time ranges overlap
// existingStart < newEnd AND existingEnd > newStart
const isTimeOverlapping = (existingStart, existingEnd, newStart, newEnd) => {
  const exStart = timeToMinutes(existingStart);
  const exEnd = timeToMinutes(existingEnd);
  const nStart = timeToMinutes(newStart);
  const nEnd = timeToMinutes(newEnd);

  return exStart < nEnd && exEnd > nStart;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
  isTimeOverlapping,
};
