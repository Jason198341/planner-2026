import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject, StudyEntry, ReviewTask, Settings, ViewType, TimerState, Retention } from './types'
import { DEFAULT_SUBJECTS } from './types'
import { generateReviewTasks, getTodayStr } from './utils/review'

interface PlannerState {
  // Settings
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void

  // Subjects (기존 Categories)
  subjects: Subject[]
  addSubject: (sub: Subject) => void
  updateSubject: (id: string, patch: Partial<Subject>) => void
  removeSubject: (id: string) => void

  // Study Entries
  studyEntries: StudyEntry[]
  addStudyEntry: (entry: StudyEntry) => void
  removeStudyEntry: (id: string) => void

  // Review Tasks
  reviewTasks: ReviewTask[]
  completeReview: (id: string, retention: Retention) => void
  uncompleteReview: (id: string) => void

  // Timer (stopwatch)
  timer: TimerState
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void

  // UI
  view: ViewType
  setView: (v: ViewType) => void
  selectedDate: string
  setSelectedDate: (d: string) => void
  selectedMonth: number
  setSelectedMonth: (m: number) => void
  showSettings: boolean
  setShowSettings: (s: boolean) => void
}

const todayStr = getTodayStr()
const today = new Date()

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: {
        userName: '',
        year: 2026,
        startDay: 1,
        setupDone: false,
      },
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // Subjects
      subjects: DEFAULT_SUBJECTS,
      addSubject: (sub) =>
        set((s) => ({ subjects: [...s.subjects, sub] })),
      updateSubject: (id, patch) =>
        set((s) => ({
          subjects: s.subjects.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeSubject: (id) =>
        set((s) => {
          const entryIds = new Set(s.studyEntries.filter((e) => e.subjectId === id).map((e) => e.id))
          return {
            subjects: s.subjects.filter((c) => c.id !== id),
            studyEntries: s.studyEntries.filter((e) => e.subjectId !== id),
            reviewTasks: s.reviewTasks.filter((r) => !entryIds.has(r.entryId)),
          }
        }),

      // Study Entries
      studyEntries: [],
      addStudyEntry: (entry) =>
        set((s) => ({
          studyEntries: [...s.studyEntries, entry],
          reviewTasks: [...s.reviewTasks, ...generateReviewTasks(entry)],
        })),
      removeStudyEntry: (id) =>
        set((s) => ({
          studyEntries: s.studyEntries.filter((e) => e.id !== id),
          reviewTasks: s.reviewTasks.filter((r) => r.entryId !== id),
        })),

      // Review Tasks
      reviewTasks: [],
      completeReview: (id, retention) =>
        set((s) => ({
          reviewTasks: s.reviewTasks.map((r) =>
            r.id === id
              ? { ...r, completed: true, completedAt: getTodayStr(), retention }
              : r,
          ),
        })),
      uncompleteReview: (id) =>
        set((s) => ({
          reviewTasks: s.reviewTasks.map((r) =>
            r.id === id
              ? { ...r, completed: false, completedAt: undefined, retention: undefined }
              : r,
          ),
        })),

      // Timer
      timer: { running: false, elapsed: 0 },
      startTimer: () =>
        set({ timer: { running: true, startedAt: Date.now(), elapsed: get().timer.elapsed } }),
      stopTimer: () => {
        const t = get().timer
        const now = Date.now()
        const added = t.startedAt ? now - t.startedAt : 0
        set({ timer: { running: false, startedAt: undefined, elapsed: t.elapsed + added } })
      },
      resetTimer: () =>
        set({ timer: { running: false, startedAt: undefined, elapsed: 0 } }),

      // UI
      view: 'calendar',
      setView: (v) => set({ view: v }),
      selectedDate: todayStr,
      setSelectedDate: (d) => set({ selectedDate: d }),
      selectedMonth: today.getMonth() + 1,
      setSelectedMonth: (m) => set({ selectedMonth: m }),
      showSettings: false,
      setShowSettings: (s) => set({ showSettings: s }),
    }),
    {
      name: 'review-calendar-2026',
      partialize: (state) => ({
        settings: state.settings,
        subjects: state.subjects,
        studyEntries: state.studyEntries,
        reviewTasks: state.reviewTasks,
      }),
    },
  ),
)
