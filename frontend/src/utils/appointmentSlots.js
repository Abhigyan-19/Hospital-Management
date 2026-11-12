const fallbackSlots = ['09:30', '11:00', '14:15', '16:00'];

export function getDoctorTimeSlots(doctor, date) {
  if (!doctor || !date) return fallbackSlots;
  const day = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
  if (doctor.workingDays?.length && !doctor.workingDays.includes(day)) return [];
  if (doctor.leaveDates?.includes(date)) return [];
  if (!doctor.startTime || !doctor.endTime || !doctor.slotMinutes) return fallbackSlots;
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  const from = toMinutes(doctor.startTime);
  const until = toMinutes(doctor.endTime);
  const duration = Number(doctor.slotMinutes);
  const result = [];
  for (let minute = from; minute + duration <= until; minute += duration) {
    result.push(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`);
  }
  return result;
}
