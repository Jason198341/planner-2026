import type { StudyEntry, ReviewTask, Retention } from '@/types'
import { REVIEW_INTERVALS, RETENTION_CONFIG } from '@/types'

/** Add N days to a YYYY-MM-DD string */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Generate 4 ReviewTasks (D+1, D+4, D+7, D+14) for a StudyEntry */
export function generateReviewTasks(entry: StudyEntry): ReviewTask[] {
  return REVIEW_INTERVALS.map((interval) => ({
    id: crypto.randomUUID(),
    entryId: entry.id,
    dueDate: addDays(entry.studiedAt, interval),
    interval,
    completed: false,
  }))
}

/** Get reviews due on a specific date */
export function getTodayReviews(tasks: ReviewTask[], date: string): ReviewTask[] {
  return tasks.filter((t) => t.dueDate === date)
}

/** Get overdue incomplete reviews (dueDate < date, not completed) */
export function getOverdueReviews(tasks: ReviewTask[], date: string): ReviewTask[] {
  return tasks.filter((t) => !t.completed && t.dueDate < date)
}

/** Retention → numeric score */
export function getRetentionScore(retention: Retention): number {
  return RETENTION_CONFIG[retention].score
}

/** Calculate consecutive study days ending at today */
export function getStudyStreak(entries: StudyEntry[], todayStr: string): number {
  const studyDates = new Set(entries.map((e) => e.studiedAt))
  let streak = 0
  let current = todayStr

  while (studyDates.has(current)) {
    streak++
    current = addDays(current, -1)
  }

  return streak
}

/** Format elapsed ms as mm:ss */
export function formatTimer(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Get today as YYYY-MM-DD */
export function getTodayStr(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
