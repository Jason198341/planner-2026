import { useMemo, useEffect, useState } from 'react'
import { usePlannerStore } from '@/store'
import { getTodayReviews } from '@/utils/review'

const CONFETTI_COLORS = ['#a8d8ea', '#f5b7b1', '#a9dfbf', '#d2b4de', '#f9e79f', '#f5cba7']

export default function ReviewGauge() {
  const { selectedDate, reviewTasks } = usePlannerStore()
  const [showCelebration, setShowCelebration] = useState(false)
  const [prevPct, setPrevPct] = useState(0)

  const todayReviews = useMemo(
    () => getTodayReviews(reviewTasks, selectedDate),
    [reviewTasks, selectedDate],
  )

  const total = todayReviews.length
  const completed = todayReviews.filter((r) => r.completed).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  useEffect(() => {
    if (pct === 100 && prevPct < 100 && total > 0) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
    setPrevPct(pct)
  }, [pct, total, prevPct])

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
        <h3 className="text-sm font-semibold text-surface-400 mb-3">🧠 오늘의 복습 달성률</h3>
        <div className="text-center py-4 text-surface-300 text-sm">
          이 날짜에 예정된 복습이 없어요
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5 relative overflow-hidden">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute confetti-piece w-2 h-2 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 30}%`,
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${Math.random() * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-400">🧠 오늘의 복습 달성률</h3>
        <span
          className={`text-2xl font-bold ${
            pct === 100 ? 'text-green-500 celebrate' : 'text-brand-500'
          }`}
        >
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div className="relative h-12 mb-2">
        <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-surface-200 rounded" />

        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-1">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div
              key={mark}
              className="w-0.5 h-2 bg-surface-200"
              style={{ marginLeft: mark === 0 ? 0 : undefined }}
            />
          ))}
        </div>

        <div
          className="absolute bottom-2 left-0 h-1 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #a9dfbf, #40c463)'
              : 'linear-gradient(90deg, #a8d8ea, #818cf8)',
          }}
        />

        <div
          className={`absolute bottom-3 transition-all duration-500 ease-out ${
            pct > 0 && pct < 100 ? 'runner-bounce' : ''
          }`}
          style={{
            left: `calc(${Math.min(pct, 96)}% - 12px)`,
          }}
        >
          <span className="text-2xl">
            {pct === 100 ? '🏆' : pct >= 75 ? '🏃' : pct >= 50 ? '🚶' : pct > 0 ? '🚶' : '🧍'}
          </span>
        </div>

        <div className="absolute bottom-3 right-0">
          <span className="text-lg">🏁</span>
        </div>
      </div>

      <p className={`text-center text-sm font-medium ${pct === 100 ? 'text-green-600' : 'text-surface-500'}`}>
        {pct === 100
          ? '🎉 완벽! 오늘 복습을 모두 마쳤어요!'
          : pct >= 75
            ? '거의 다 왔어요! 조금만 더!'
            : pct >= 50
              ? '절반 완료! 좋은 페이스입니다 💪'
              : pct > 0
                ? '좋은 시작이에요! 계속 복습해보세요 🧠'
                : '첫 복습을 완료해보세요!'}
      </p>

      <div className="flex justify-center gap-4 mt-3 text-xs text-surface-400">
        <span>완료 <strong className="text-brand-500">{completed}</strong></span>
        <span>남음 <strong className="text-pastel-orange">{total - completed}</strong></span>
        <span>전체 <strong className="text-surface-600">{total}</strong></span>
      </div>
    </div>
  )
}
