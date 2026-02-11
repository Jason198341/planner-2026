import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePlannerStore } from '@/store'
import { generateMonthGrid, formatDate, dayLabels, monthName } from '@/utils/calendar'

export default function CalendarView() {
  const {
    settings,
    selectedMonth,
    setSelectedMonth,
    selectedDate,
    setSelectedDate,
    todos,
  } = usePlannerStore()

  const year = settings.year
  const grid = useMemo(
    () => generateMonthGrid(year, selectedMonth, settings.startDay),
    [year, selectedMonth, settings.startDay],
  )
  const labels = useMemo(() => dayLabels(settings.startDay), [settings.startDay])

  const todoCounts = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {}
    for (const t of todos) {
      if (!map[t.date]) map[t.date] = { total: 0, done: 0 }
      map[t.date].total++
      if (t.completed) map[t.date].done++
    }
    return map
  }, [todos])

  const prevMonth = () => setSelectedMonth(selectedMonth === 1 ? 12 : selectedMonth - 1)
  const nextMonth = () => setSelectedMonth(selectedMonth === 12 ? 1 : selectedMonth + 1)

  const today = new Date()
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-surface-500" />
        </button>
        <h3 className="text-lg font-bold text-surface-800">
          {year}년 {monthName(selectedMonth)}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-surface-500" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {labels.map((l, i) => (
          <div
            key={i}
            className={`text-center text-xs font-semibold py-1 ${
              l === '일' ? 'text-pastel-rose' : l === '토' ? 'text-pastel-blue' : 'text-surface-400'
            }`}
          >
            {l}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((day, i) => {
          if (day === null) return <div key={i} />
          const dateStr = formatDate(year, selectedMonth, day)
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === todayStr
          const counts = todoCounts[dateStr]
          const allDone = counts && counts.total > 0 && counts.done === counts.total

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(dateStr)}
              className={`relative aspect-square rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5 ${
                isSelected
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
                  : isToday
                    ? 'bg-brand-50 text-brand-600 ring-2 ring-brand-300'
                    : 'hover:bg-surface-100 text-surface-700'
              }`}
            >
              <span>{day}</span>
              {counts && counts.total > 0 && (
                <div className="flex gap-0.5">
                  {allDone ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-pastel-green" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-pastel-orange" />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
