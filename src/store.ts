import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, Todo, Settings, ViewType } from './types'
import { DEFAULT_CATEGORIES } from './types'

interface PlannerState {
  // Settings
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void

  // Categories
  categories: Category[]
  addCategory: (cat: Category) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  removeCategory: (id: string) => void

  // Todos
  todos: Todo[]
  addTodo: (todo: Todo) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  updateTodo: (id: string, patch: Partial<Todo>) => void

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

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      // Settings
      settings: {
        userName: '',
        year: 2026,
        startDay: 1, // Monday
        setupDone: false,
      },
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // Categories
      categories: DEFAULT_CATEGORIES,
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, cat] })),
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          todos: s.todos.filter((t) => t.categoryId !== id),
        })),

      // Todos
      todos: [],
      addTodo: (todo) => set((s) => ({ todos: [...s.todos, todo] })),
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        })),
      removeTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      updateTodo: (id, patch) =>
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

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
      name: 'planner-2026',
      partialize: (state) => ({
        settings: state.settings,
        categories: state.categories,
        todos: state.todos,
      }),
    },
  ),
)
