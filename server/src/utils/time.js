function startOfUTCDay(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(date, days) {
  const d = new Date(date);
  const res = new Date(d.getTime());
  res.setUTCDate(res.getUTCDate() + days);
  return res;
}

function toISODate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function clampDateRange(fromStr, toStr) {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime())) return { error: "Invalid 'from' date" };
  if (isNaN(to.getTime())) return { error: "Invalid 'to' date" };
  const fromStart = startOfUTCDay(from);
  const toEnd = new Date(startOfUTCDay(to).getTime() + 24 * 60 * 60 * 1000 - 1);
  if (fromStart > toEnd) return { error: "'from' must be before 'to'" };
  return { from: fromStart, to: toEnd };
}

function generateDayKeys(from, to) {
  const res = [];
  let cur = startOfUTCDay(from);
  const end = startOfUTCDay(to);
  while (cur <= end) {
    res.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return res;
}

function getRangeStart(range, now = new Date()) {
  const todayStart = startOfUTCDay(now);
  if (range === 'day') return todayStart;
  if (range === 'week') return addDays(todayStart, -6); // today + previous 6 days
  if (range === 'month') return addDays(todayStart, -29); // today + previous 29 days
  return todayStart;
}

module.exports = {
  startOfUTCDay,
  addDays,
  toISODate,
  clampDateRange,
  generateDayKeys,
  getRangeStart
};
