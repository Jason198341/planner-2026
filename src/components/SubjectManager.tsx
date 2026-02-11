import { useState } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import { usePlannerStore } from '@/store'
import { PASTEL_COLORS } from '@/types'

const EMOJI_OPTIONS = ['📖', '🔢', '🌍', '🔬', '🏛️', '💻', '📜', '📌', '🎨', '🎮', '🧘', '🌱']

export default function SubjectManager() {
  const { subjects, addSubject, updateSubject, removeSubject } = usePlannerStore()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(PASTEL_COLORS[0].value)
  const [icon, setIcon] = useState(EMOJI_OPTIONS[0])

  const handleAdd = () => {
    if (!name.trim()) return
    addSubject({
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      icon,
    })
    setName('')
    setAdding(false)
  }

  const startEdit = (sub: typeof subjects[0]) => {
    setEditingId(sub.id)
    setName(sub.name)
    setColor(sub.color)
    setIcon(sub.icon)
  }

  const saveEdit = () => {
    if (!editingId || !name.trim()) return
    updateSubject(editingId, { name: name.trim(), color, icon })
    setEditingId(null)
    setName('')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-surface-800">📚 과목</h3>
        <button
          onClick={() => { setAdding(!adding); setEditingId(null); setName('') }}
          className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
        >
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Subject list */}
      <div className="space-y-2 mb-3">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-50 transition-colors group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ backgroundColor: sub.color + '40' }}
            >
              {sub.icon}
            </div>
            <span className="flex-1 text-sm font-medium text-surface-700">{sub.name}</span>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: sub.color }}
            />
            <button
              onClick={() => startEdit(sub)}
              className="p-1 opacity-0 group-hover:opacity-100 text-surface-400 hover:text-brand-500 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add / Edit form */}
      {(adding || editingId) && (
        <div className="border-t border-surface-100 pt-3 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="과목 이름"
            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none"
            autoFocus
          />

          {/* Color picker */}
          <div>
            <p className="text-xs text-surface-400 mb-1.5">색상</p>
            <div className="flex flex-wrap gap-2">
              {PASTEL_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-brand-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <p className="text-xs text-surface-400 mb-1.5">아이콘</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                    icon === e
                      ? 'bg-brand-100 ring-2 ring-brand-400'
                      : 'bg-surface-50 hover:bg-surface-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingId ? saveEdit : handleAdd}
              disabled={!name.trim()}
              className="flex-1 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-40"
            >
              {editingId ? '저장' : '추가'}
            </button>
            {editingId && (
              <button
                onClick={() => { removeSubject(editingId); setEditingId(null); setName('') }}
                className="px-3 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
