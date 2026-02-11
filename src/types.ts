export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface Todo {
  id: string
  date: string          // YYYY-MM-DD
  text: string
  categoryId: string
  completed: boolean
}

export interface Settings {
  userName: string
  year: number
  startDay: number      // 0=Sun, 1=Mon, ...
  setupDone: boolean
}

export type ViewType = 'calendar' | 'dashboard'

export const PASTEL_COLORS = [
  { value: '#a8d8ea', label: '블루' },
  { value: '#f5b7b1', label: '핑크' },
  { value: '#a9dfbf', label: '그린' },
  { value: '#d2b4de', label: '퍼플' },
  { value: '#f9e79f', label: '옐로우' },
  { value: '#f5cba7', label: '오렌지' },
  { value: '#a3e4d7', label: '민트' },
  { value: '#f1948a', label: '로즈' },
] as const

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: '업무', color: '#a8d8ea', icon: '💼' },
  { id: 'exercise', name: '운동', color: '#a9dfbf', icon: '🏃' },
  { id: 'family', name: '가족', color: '#f5b7b1', icon: '👨‍👩‍👧' },
  { id: 'study', name: '공부', color: '#d2b4de', icon: '📚' },
  { id: 'hobby', name: '취미', color: '#f9e79f', icon: '🎨' },
]
