import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { usePlannerStore } from '@/store'
import { getWeekNumber, getAllDatesInYear } from '@/utils/calendar'
import { getStudyStreak, getTodayStr } from '@/utils/review'
import { TrendingUp, PieChart as PieIcon, Grid3X3 } from 'lucide-react'

const CHART_COLORS = ['#a8d8ea', '#f5b7b1', '#a9dfbf', '#d2b4de', '#f9e79f', '#f5cba7', '#a3e4d7', '#f1948a']

export default function DashboardView() {
  const { settings, studyEntries, reviewTasks, subjects } = usePlannerStore()
  const year = settings.year
  const todayStr = getTodayStr()

  // ── Weekly review completion data ──
  const weeklyData = useMemo(() => {
    const weeks: Record<number, { total: number; done: number }> = {}
    for (const r of reviewTasks) {
      if (!r.dueDate.startsWith(String(year))) continue
      const w = getWeekNumber(r.dueDate)
      if (!weeks[w]) weeks[w] = { total: 0, done: 0 }
      weeks[w].total++
      if (r.completed) weeks[w].done++
    }
    return Object.entries(weeks)
      .map(([week, data]) => ({
        name: `${week}주`,
        달성률: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0,
        완료: data.done,
        전체: data.total,
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name))
  }, [reviewTasks, year])

  // ── Subject distribution data ──
  const subjectData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of studyEntries) {
      if (!e.studiedAt.startsWith(String(year))) continue
      counts[e.subjectId] = (counts[e.subjectId] || 0) + 1
    }
    return subjects
      .filter((s) => counts[s.id])
      .map((s) => ({
        name: `${s.icon} ${s.name}`,
        value: counts[s.id],
        color: s.color,
      }))
  }, [studyEntries, subjects, year])

  // ── Annual heatmap data ──
  const heatmapData = useMemo(() => {
    const allDates = getAllDatesInYear(year)
    const dateMap: Record<string, number> = {}

    // Count study entries
    for (const e of studyEntries) {
      if (!e.studiedAt.startsWith(String(year))) continue
      dateMap[e.studiedAt] = (dateMap[e.studiedAt] || 0) + 1
    }
    // Count completed reviews
    for (const r of reviewTasks) {
      if (!r.completed || !r.completedAt?.startsWith(String(year))) continue
      dateMap[r.completedAt] = (dateMap[r.completedAt] || 0) + 1
    }

    return allDates.map((date) => ({
      date,
      count: dateMap[date] ?? 0,
    }))
  }, [studyEntries, reviewTasks, year])

  // Overall stats
  const yearEntries = studyEntries.filter((e) => e.studiedAt.startsWith(String(year)))
  const yearReviews = reviewTasks.filter((r) => r.dueDate.startsWith(String(year)))
  const totalStudy = yearEntries.length
  const completedReviews = yearReviews.filter((r) => r.completed).length
  const reviewRate = yearReviews.length > 0 ? Math.round((completedReviews / yearReviews.length) * 100) : 0
  const streak = getStudyStreak(studyEntries, todayStr)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 학습" value={totalStudy} icon="📚" color="bg-pastel-blue/30" />
        <StatCard label="복습 완료" value={completedReviews} icon="✅" color="bg-pastel-green/30" />
        <StatCard label="복습률" value={`${reviewRate}%`} icon="📊" color="bg-pastel-purple/30" />
        <StatCard label="연속 학습일" value={`${streak}일`} icon="🔥" color="bg-pastel-orange/30" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly review chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-surface-800">주차별 복습 달성률</h3>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="달성률" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Subject distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-pastel-purple" />
            <h3 className="text-base font-bold text-surface-800">과목별 학습 비중</h3>
          </div>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-xs text-surface-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {/* Annual heatmap */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="w-5 h-5 text-heat-3" />
          <h3 className="text-base font-bold text-surface-800">{year}년 학습 히트맵</h3>
        </div>
        <AnnualHeatmap data={heatmapData} year={year} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: string
  color: string
}) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-2xl font-bold text-surface-800">{value}</p>
      <p className="text-xs text-surface-500">{label}</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-[260px] flex items-center justify-center text-surface-300 text-sm">
      학습 데이터가 쌓이면 차트가 나타납니다
    </div>
  )
}

// ── GitHub-style annual heatmap ──
function AnnualHeatmap({
  data,
  year,
}: {
  data: { date: string; count: number }[]
  year: number
}) {
  const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  const weeks: { date: string; count: number; day: number }[][] = []
  let currentWeek: typeof weeks[0] = []

  const startDate = new Date(year, 0, 1)
  const firstDay = startDate.getDay()
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: '', count: -1, day: i })
  }

  for (const d of data) {
    const date = new Date(d.date)
    const day = date.getDay()
    if (day === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push({ ...d, day })
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const monthPositions: { label: string; col: number }[] = []
  let colIndex = 0
  for (const week of weeks) {
    for (const cell of week) {
      if (cell.date && cell.day === 0) {
        const month = parseInt(cell.date.split('-')[1])
        const lastMonth = monthPositions.length > 0 ? monthPositions[monthPositions.length - 1].label : ''
        if (MONTH_LABELS[month - 1] !== lastMonth) {
          monthPositions.push({ label: MONTH_LABELS[month - 1], col: colIndex })
        }
      }
    }
    colIndex++
  }

  const getColor = (count: number) => {
    if (count < 0) return 'transparent'
    if (count === 0) return 'var(--color-heat-0)'
    if (count <= 1) return 'var(--color-heat-1)'
    if (count <= 3) return 'var(--color-heat-2)'
    if (count <= 5) return 'var(--color-heat-3)'
    return 'var(--color-heat-4)'
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex mb-1 ml-8" style={{ gap: 0 }}>
        {monthPositions.map((mp, i) => (
          <div
            key={i}
            className="text-xs text-surface-400"
            style={{
              position: 'relative',
              left: `${mp.col * 13}px`,
              width: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {mp.label}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        <div className="flex flex-col gap-0.5 mr-1 pt-0.5">
          {['', '월', '', '수', '', '금', ''].map((l, i) => (
            <div key={i} className="text-[10px] text-surface-400 h-[11px] leading-[11px]">
              {l}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }).map((_, di) => {
              const cell = week.find((c) => c.day === di)
              if (!cell || cell.count < 0) {
                return <div key={di} className="w-[11px] h-[11px]" />
              }
              return (
                <div
                  key={di}
                  className="w-[11px] h-[11px] rounded-sm transition-colors"
                  style={{ backgroundColor: getColor(cell.count) }}
                  title={`${cell.date}: ${cell.count}건 활동`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-1 mt-3 text-xs text-surface-400">
        <span>적음</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-[11px] h-[11px] rounded-sm"
            style={{ backgroundColor: `var(--color-heat-${level})` }}
          />
        ))}
        <span>많음</span>
      </div>
    </div>
  )
}
