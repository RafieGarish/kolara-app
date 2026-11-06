/** "Today" is pinned to Mon, Nov 2 2026 to match the design. */
export const TODAY = new Date(2026, 10, 2);
export const MS_DAY = 86400000;
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const d = (m: number, day: number) => new Date(2026, m, day);
export const dayDiff = (date: Date) => Math.round((date.getTime() - TODAY.getTime()) / MS_DAY);
export const dueLabel = (date: Date) => {
  const n = dayDiff(date);
  return n === 0 ? "Today" : n === 1 ? "Tomorrow" : `${MONTHS[date.getMonth()]} ${date.getDate()}`;
};
export const shortDate = (dt: Date) => `${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
