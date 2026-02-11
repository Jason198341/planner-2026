import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Trash2, Clock, Play, Square, RotateCcw, AlertTriangle, BookOpen } from 'lucide-react'
import { usePlannerStore } from '@/store'
import { getTodayReviews, getOverdueReviews, formatTimer, getTodayStr } from '@/utils/review'
import { IMPORTANCE_COLORS, RETENTION_CONFIG } from '@/types'
import type { Importance, Retention } from '@/types'

export default function StudyPanel() {
  const {
    selectedDate, subjects, studyEntries, reviewTasks,
    addStudyEntry, removeStudyEntry, completeReview, uncompleteReview,
    timer, startTimer, stopTimer, resetTimer,
  } = usePlannerStore()

  const [topic, setTopic] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [importance, setImportance] = useState<Importance>('green')
  const [memo, setMemo] = useState('')
  const [toast, setToast] = useState('')
  const [selectingRetention, setSelectingRetention] = useState<string | null>(null)

  // Live timer display
  const [displayMs, setDisplayMs] = useState(timer.elapsed)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!timer.running) {
      setDisplayMs(timer.elapsed)
      return
    }
    const tick = () => {
      const now = Date.now()
      setDisplayMs(timer.elapsed + (timer.startedAt ? now - timer.startedAt : 0))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [timer.running, timer.elapsed, timer.startedAt])

  const todayStr = getTodayStr()

  // Reviews for selected date
  const todayReviews = useMemo(
    () => getTodayReviews(reviewTasks, selectedDate),
    [reviewTasks, selectedDate],
  )

  // Overdue reviews (only show when viewing today)
  const overdueReviews = useMemo(
    () => selectedDate === todayStr ? getOverdueReviews(reviewTasks, todayStr) : [],
    [reviewTasks, selectedDate, todayStr],
  )

  // Study entries for selected date
  const dayEntries = useMemo(
    () => studyEntries.filter((e) => e.studiedAt === selectedDate),
    [studyEntries, selectedDate],
  )

  const getSubject = (id: string) => subjects.find((s) => s.id === id)
  const getEntry = (entryId: string) => studyEntries.find((e) => e.id === entryId)

  // Parse date for display
  const [y, m, d] = selectedDate.split('-')
  const dateLabel = `${Number(m)}월 ${Number(d)}일`

  const handleAdd = () => {
    if (!topic.trim()) return
    const elapsed = timer.elapsed + (timer.running && timer.startedAt ? Date.now() - timer.startedAt : 0)
    addStudyEntry({
      id: crypto.randomUUID(),
      subjectId,
      topic: topic.trim(),
      studiedAt: selectedDate,
      importance,
      focusMinutes: Math.round(elapsed / 60000),
      memo: memo.trim() || undefined,
    })
    setTopic('')
    setMemo('')
    resetTimer()
    setToast('D+1, D+4, D+7, D+14 복습이 자동 생성되었습니다!')
    setTimeout(() => setToast(''), 3000)
  }

  const handleRetention = (reviewId: string, retention: Retention) => {
    completeReview(reviewId, retention)
    setSelectingRetention(null)
  }

  const completedToday = todayReviews.filter((r) => r.completed).length
  const totalToday = todayReviews.length

  return (
    <div className="space-y-4">
      {/* ── Toast ── */}
      {toast && (
        <div className="bg-pastel-green/40 text-green-800 text-sm font-medium px-4 py-2.5 rounded-xl text-center animate-pulse">
          {toast}
        </div>
      )}

      {/* ── Today's Reviews ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-surface-800">
            <BookOpen className="w-5 h-5 inline-block mr-1.5 text-brand-500" />
            {dateLabel} 복습
            <span className="text-sm font-normal text-surface-400 ml-1">({y})</span>
          </h3>
          {totalToday > 0 && (
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                completedToday === totalToday
                  ? 'bg-pastel-green/50 text-green-700'
                  : 'bg-surface-100 text-surface-500'
              }`}
            >
              {completedToday}/{totalToday}
            </span>
          )}
        </div>

        {/* Overdue warning */}
        {overdueReviews.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> 기한 지난 복습 {overdueReviews.length}건
            </p>
            <div className="space-y-1.5">
              {overdueReviews.slice(0, 5).map((review) => {
                const entry = getEntry(review.entryId)
                const sub = entry ? getSubject(entry.subjectId) : null
                return (
                  <div key={review.id} className="flex items-center gap-2 text-sm">
                    <span>{sub?.icon}</span>
                    <span className="text-red-700 flex-1 truncate">{entry?.topic}</span>
                    <span className="text-xs text-red-400">D+{review.interval} ({review.dueDate})</span>
                    {!review.completed && (
                      <div className="flex gap-1">
                        {(Object.keys(RETENTION_CONFIG) as Retention[]).map((ret) => (
                          <button
                            key={ret}
                            onClick={() => handleRetention(review.id, ret)}
                            className="text-base hover:scale-125 transition-transform"
                            title={RETENTION_CONFIG[ret].label}
                          >
                            {RETENTION_CONFIG[ret].emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              {overdueReviews.length > 5 && (
                <p className="text-xs text-red-400">...외 {overdueReviews.length - 5}건</p>
              )}
            </div>
          </div>
        )}

        {/* Review list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {todayReviews.length === 0 && overdueReviews.length === 0 ? (
            <p className="text-center text-surface-400 text-sm py-6">
              이 날짜에 예정된 복습이 없어요
            </p>
          ) : (
            todayReviews.map((review) => {
              const entry = getEntry(review.entryId)
              const sub = entry ? getSubject(entry.subjectId) : null
              const isSelecting = selectingRetention === review.id

              return (
                <div
                  key={review.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    review.completed
                      ? 'bg-surface-50 opacity-70'
                      : 'bg-white border border-surface-100'
                  }`}
                >
                  {/* Subject icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: (sub?.color ?? '#e2e8f0') + '40' }}
                  >
                    {sub?.icon ?? '📘'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${review.completed ? 'line-through text-surface-400' : 'text-surface-700'}`}>
                      {entry?.topic ?? '삭제된 항목'}
                    </p>
                    <span className="text-xs text-surface-400">
                      D+{review.interval} 복습
                      {review.retention && ` · ${RETENTION_CONFIG[review.retention].emoji}`}
                    </span>
                  </div>

                  {/* Actions */}
                  {review.completed ? (
                    <button
                      onClick={() => uncompleteReview(review.id)}
                      className="text-xs text-surface-400 hover:text-surface-600 px-2 py-1 rounded"
                    >
                      되돌리기
                    </button>
                  ) : isSelecting ? (
                    <div className="flex gap-1.5">
                      {(Object.keys(RETENTION_CONFIG) as Retention[]).map((ret) => (
                        <button
                          key={ret}
                          onClick={() => handleRetention(review.id, ret)}
                          className="text-xl hover:scale-125 transition-transform"
                          title={RETENTION_CONFIG[ret].label}
                        >
                          {RETENTION_CONFIG[ret].emoji}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectingRetention(review.id)}
                      className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors"
                    >
                      완료
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Study entries for this date ── */}
      {dayEntries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
          <h3 className="text-sm font-semibold text-surface-500 mb-3">
            {dateLabel} 학습 기록 ({dayEntries.length}건)
          </h3>
          <div className="space-y-2">
            {dayEntries.map((entry) => {
              const sub = getSubject(entry.subjectId)
              return (
                <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                    style={{ backgroundColor: (sub?.color ?? '#e2e8f0') + '40' }}
                  >
                    {sub?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700 font-medium truncate">{entry.topic}</p>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: IMPORTANCE_COLORS[entry.importance].bg }}
                      />
                      {entry.focusMinutes > 0 && <span>{entry.focusMinutes}분</span>}
                      {entry.memo && <span>· 메모</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => removeStudyEntry(entry.id)}
                    className="p-1 text-surface-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── New Study Entry Input ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
        <h3 className="text-sm font-semibold text-surface-500 mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> 새 학습 기록
        </h3>

        <div className="space-y-3">
          {/* Subject + Topic */}
          <div className="flex gap-2">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white focus:border-brand-400 outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="학습 주제 (예: 이차방정식 풀이)"
              className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none"
            />
          </div>

          {/* Importance buttons */}
          <div>
            <p className="text-xs text-surface-400 mb-1.5">중요도</p>
            <div className="flex gap-2">
              {(Object.keys(IMPORTANCE_COLORS) as Importance[]).map((imp) => (
                <button
                  key={imp}
                  onClick={() => setImportance(imp)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    importance === imp
                      ? 'ring-2 ring-offset-1 ring-brand-400 shadow-sm'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: IMPORTANCE_COLORS[imp].bg }}
                >
                  {IMPORTANCE_COLORS[imp].label}
                </button>
              ))}
            </div>
          </div>

          {/* Stopwatch */}
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <Clock className="w-4 h-4 text-surface-400" />
            <span className="text-lg font-mono font-bold text-surface-700 tabular-nums">
              {formatTimer(displayMs)}
            </span>
            <div className="flex gap-1.5 ml-auto">
              {!timer.running ? (
                <button
                  onClick={startTimer}
                  className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                  title="시작"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="정지"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={resetTimer}
                className="p-2 bg-surface-200 text-surface-500 rounded-lg hover:bg-surface-300 transition-colors"
                title="리셋"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Memo */}
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 (선택)"
            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none"
          />

          {/* Submit */}
          <button
            onClick={handleAdd}
            disabled={!topic.trim()}
            className="w-full py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            기록 완료
          </button>
        </div>
      </div>
    </div>
  )
}
