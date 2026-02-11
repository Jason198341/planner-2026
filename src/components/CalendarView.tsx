import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePlannerStore } from '@/store'
import { generateMonthGrid, formatDate, dayLabels, monthName } from '@/utils/calendar'
import { getTodayStr } from '@/utils/review'

export default function CalendarView() {
  const {
    settings,
    selectedMonth,
    setSelectedMonth,
    selectedDate,
    setSelectedDate,
    studyEntries,
    reviewTasks,
  } = usePlannerStore()

  const year = settings.year
  const grid = useMemo(
    () => generateMonthGrid(year, selectedMonth, settings.startDay),
    [year, selectedMonth, settings.startDay],
  )
  const labels = useMemo(() => dayLabels(settings.startDay), [settings.startDay])

  const todayStr = getTodayStr()

  // Build status map for each date
  const dateStatus = useMemo(() => {
    const map: Record<string, { hasStudy: boolean; reviewTotal: number; reviewDone: number; hasOverdue: boolean }> = {}

    // Mark study entries
    for (const e of studyEntries) {
      if (!map[e.studiedAt]) map[e.studiedAt] = { hasStudy: false, reviewTotal: 0, reviewDone: 0, hasOverdue: false }
      map[e.studiedAt].hasStudy = true
    }

    // Mark review tasks
    for (const r of reviewTasks) {
      if (!map[r.dueDate]) map[r.dueDate] = { hasStudy: false, reviewTotal: 0, reviewDone: 0, hasOverdue: false }
      map[r.dueDate].reviewTotal++
      if (r.completed) map[r.dueDate].reviewDone++
      // Mark overdue
      if (!r.completed && r.dueDate < todayStr) {
        map[r.dueDate].hasOverdue = true
      }
    }

    return map
  }, [studyEntries, reviewTasks, todayStr])

  const prevMonth = () => setSelectedMonth(selectedMonth === 1 ? 12 : selectedMonth - 1)
  const nextMonth = () => setSelectedMonth(selectedMonth === 12 ? 1 : selectedMonth + 1)

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
          const status = dateStatus[dateStr]

          // Determine dot color: red > orange > green > blue
          let dotColor: string | null = null
          if (status) {
            if (status.hasOverdue) {
              dotColor = '#e74c3c' // red - overdue
            } else if (status.reviewTotal > 0 && status.reviewDone < status.reviewTotal) {
              dotColor = '#f5cba7' // orange - reviews pending
            } else if (status.hasStudy) {
              dotColor = '#a9dfbf' // green - has study
            } else if (status.reviewTotal > 0 && status.reviewDone === status.reviewTotal) {
              dotColor = '#a8d8ea' // blue - all reviews done
            }
          }

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
              {dotColor && (
                <div className="flex gap-0.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : dotColor }}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-surface-400">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#a9dfbf' }} /> 학습</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#a8d8ea' }} /> 복습완료</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#f5cba7' }} /> 복습예정</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#e74c3c' }} /> 기한초과</span>
      </div>
    </div>
  )
}
