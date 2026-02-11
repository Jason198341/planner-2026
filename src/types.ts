// ── Subject (기존 Category 대체) ──
export interface Subject {
  id: string
  name: string
  color: string
  icon: string
}

// ── Importance: 형광펜 4색 ──
export type Importance = 'green' | 'yellow' | 'orange' | 'pink'

// ── Retention: 3단계 기억 평가 ──
export type Retention = 'great' | 'okay' | 'forgot'

// ── StudyEntry (기존 Todo 대체) ──
export interface StudyEntry {
  id: string
  subjectId: string
  topic: string
  studiedAt: string          // YYYY-MM-DD
  importance: Importance
  focusMinutes: number
  memo?: string
}

// ── ReviewTask (자동 생성) ──
export interface ReviewTask {
  id: string
  entryId: string            // → StudyEntry.id
  dueDate: string            // YYYY-MM-DD
  interval: 1 | 4 | 7 | 14
  completed: boolean
  completedAt?: string       // YYYY-MM-DD
  retention?: Retention
}

// ── Timer (스톱워치) ──
export interface TimerState {
  running: boolean
  startedAt?: number         // Date.now()
  elapsed: number            // ms
}

// ── Settings ──
export interface Settings {
  userName: string
  year: number
  startDay: number           // 0=Sun, 1=Mon, ...
  setupDone: boolean
}

export type ViewType = 'calendar' | 'dashboard'

// ── Constants ──
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

export const IMPORTANCE_COLORS: Record<Importance, { bg: string; label: string }> = {
  green:  { bg: '#a9dfbf', label: '보통' },
  yellow: { bg: '#f9e79f', label: '중요' },
  orange: { bg: '#f5cba7', label: '핵심' },
  pink:   { bg: '#f5b7b1', label: '필수' },
}

export const RETENTION_CONFIG: Record<Retention, { emoji: string; label: string; score: number }> = {
  great:  { emoji: '\u{1F604}', label: '잘 기억남', score: 100 },
  okay:   { emoji: '\u{1F610}', label: '보통',      score: 60  },
  forgot: { emoji: '\u{1F630}', label: '거의 잊음', score: 20  },
}

export const REVIEW_INTERVALS = [1, 4, 7, 14] as const

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'korean',  name: '국어',   color: '#f5b7b1', icon: '📖' },
  { id: 'math',    name: '수학',   color: '#a8d8ea', icon: '🔢' },
  { id: 'english', name: '영어',   color: '#a9dfbf', icon: '🌍' },
  { id: 'science', name: '과학',   color: '#d2b4de', icon: '🔬' },
  { id: 'social',  name: '사회',   color: '#f9e79f', icon: '🏛️' },
  { id: 'coding',  name: '코딩',   color: '#a3e4d7', icon: '💻' },
  { id: 'cert',    name: '자격증', color: '#f5cba7', icon: '📜' },
  { id: 'etc',     name: '기타',   color: '#f1948a', icon: '📌' },
]
