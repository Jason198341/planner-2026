/** Get number of days in a month (1-indexed month) */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Get day of week for first day of month (0=Sun) */
export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

/** Generate calendar grid for a month, respecting startDay offset */
export function generateMonthGrid(
  year: number,
  month: number,
  startDay: number,
): (number | null)[] {
  const days = daysInMonth(year, month)
  const first = firstDayOfMonth(year, month)
  const offset = (first - startDay + 7) % 7
  const grid: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= days; d++) grid.push(d)
  // pad to complete last row
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

/** Format date as YYYY-MM-DD */
export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Get ISO week number for a date */
export function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}

/** Get all dates in a year as YYYY-MM-DD strings */
export function getAllDatesInYear(year: number): string[] {
  const dates: string[] = []
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  const current = new Date(start)
  while (current <= end) {
    dates.push(formatDate(current.getFullYear(), current.getMonth() + 1, current.getDate()))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
]

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1]
}

const DAY_LABELS_KO = ['일', '월', '화', '수', '목', '금', '토']

export function dayLabels(startDay: number): string[] {
  const labels = [...DAY_LABELS_KO]
  for (let i = 0; i < startDay; i++) labels.push(labels.shift()!)
  return labels
}
