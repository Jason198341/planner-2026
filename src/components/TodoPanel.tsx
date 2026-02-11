import { useState, useMemo } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { usePlannerStore } from '@/store'

export default function TodoPanel() {
  const { selectedDate, todos, categories, addTodo, toggleTodo, removeTodo } =
    usePlannerStore()
  const [text, setText] = useState('')
  const [catId, setCatId] = useState(categories[0]?.id ?? '')

  const dayTodos = useMemo(
    () => todos.filter((t) => t.date === selectedDate),
    [todos, selectedDate],
  )

  const handleAdd = () => {
    if (!text.trim()) return
    addTodo({
      id: crypto.randomUUID(),
      date: selectedDate,
      text: text.trim(),
      categoryId: catId,
      completed: false,
    })
    setText('')
  }

  const getCat = (id: string) => categories.find((c) => c.id === id)

  // Parse date for display
  const [y, m, d] = selectedDate.split('-')
  const dateLabel = `${Number(m)}월 ${Number(d)}일`

  const completed = dayTodos.filter((t) => t.completed).length
  const total = dayTodos.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-surface-800">
          📝 {dateLabel} <span className="text-sm font-normal text-surface-400">({y})</span>
        </h3>
        {total > 0 && (
          <span
            className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
              pct === 100
                ? 'bg-pastel-green/50 text-green-700'
                : 'bg-surface-100 text-surface-500'
            }`}
          >
            {completed}/{total} ({pct}%)
          </span>
        )}
      </div>

      {/* Add todo */}
      <div className="flex gap-2 mb-4">
        <select
          value={catId}
          onChange={(e) => setCatId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white focus:border-brand-400 outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="할 일 추가..."
          className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Todo list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {dayTodos.length === 0 ? (
          <p className="text-center text-surface-400 text-sm py-8">
            아직 할 일이 없어요. 위에서 추가해보세요!
          </p>
        ) : (
          dayTodos.map((todo) => {
            const cat = getCat(todo.categoryId)
            return (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  todo.completed ? 'bg-surface-50 opacity-60' : 'bg-white border border-surface-100'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: cat?.color ?? '#cbd5e1',
                    backgroundColor: todo.completed ? cat?.color ?? '#cbd5e1' : 'transparent',
                  }}
                >
                  {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      todo.completed ? 'line-through text-surface-400' : 'text-surface-700'
                    }`}
                  >
                    {todo.text}
                  </p>
                  {cat && (
                    <span
                      className="inline-block text-xs px-1.5 py-0.5 rounded mt-1"
                      style={{ backgroundColor: cat.color + '33', color: cat.color }}
                    >
                      {cat.icon} {cat.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="p-1 text-surface-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
