import { useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { usePlannerStore } from '@/store'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = usePlannerStore()
  const [name, setName] = useState(settings.userName)
  const [year, setYear] = useState(settings.year)

  const save = () => {
    updateSettings({ userName: name, year })
    onClose()
  }

  const reset = () => {
    if (confirm('모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?')) {
      localStorage.removeItem('review-calendar-2026')
      location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-800">⚙️ 설정</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-surface-600 mb-1 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-200 focus:border-brand-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-surface-600 mb-1 block">연도</label>
            <div className="flex gap-2">
              {[2025, 2026, 2027].map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    year === y
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              className="flex-1 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors"
            >
              저장
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> 초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
