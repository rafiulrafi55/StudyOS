export const getNextClass = (schedule: any[]) => {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const getMinutes = (t: string) => {
    const [time, period] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  return schedule
    .filter(item => {
      if (item.day.toLowerCase() !== dayName.toLowerCase()) return false;
      return getMinutes(item.time) >= currentTime;
    })
    .sort((a, b) => getMinutes(a.time) - getMinutes(b.time))[0];
};
