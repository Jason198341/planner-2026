import { useState } from 'react'
import { User, Calendar, ChevronRight } from 'lucide-react'
import { usePlannerStore } from '@/store'
import { DEFAULT_SUBJECTS } from '@/types'
import type { Subject } from '@/types'

export default function SetupWizard() {
  const { settings, updateSettings, subjects, addSubject, removeSubject } = usePlannerStore()
  const [name, setName] = useState(settings.userName)
  const [year, setYear] = useState(settings.year)
  const [step, setStep] = useState(0)

  // Track selected subject IDs
  const selectedIds = new Set(subjects.map((s) => s.id))

  const toggleSubject = (sub: Subject) => {
    if (selectedIds.has(sub.id)) {
      removeSubject(sub.id)
    } else {
      addSubject(sub)
    }
  }

  const finish = () => {
    updateSettings({ userName: name, year, startDay: 1, setupDone: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-pastel-blue/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i <= step ? 'bg-brand-500' : 'bg-surface-200'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-800 mb-2">
                안녕하세요! 👋
              </h2>
              <p className="text-surface-500">이름을 알려주세요</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력"
              className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-center text-lg"
              autoFocus
            />
            <button
              onClick={() => name.trim() && setStep(1)}
              disabled={!name.trim()}
              className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              다음 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-pastel-green/50 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-800 mb-2">
                플래닝 연도 선택
              </h2>
              <p className="text-surface-500">복습 캘린더를 자동 생성합니다</p>
            </div>
            <div className="flex gap-3 justify-center">
              {[2025, 2026, 2027].map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    year === y
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-200'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
            >
              다음 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6">
            <div className="text-4xl">📚</div>
            <div>
              <h2 className="text-2xl font-bold text-surface-800 mb-2">
                공부할 과목 선택
              </h2>
              <p className="text-surface-500">나중에 언제든 추가/삭제할 수 있어요</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_SUBJECTS.map((sub) => {
                const isSelected = selectedIds.has(sub.id)
                return (
                  <button
                    key={sub.id}
                    onClick={() => toggleSubject(sub)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-400 shadow-sm'
                        : 'bg-surface-50 text-surface-500 hover:bg-surface-100'
                    }`}
                  >
                    <span className="text-lg">{sub.icon}</span>
                    <span>{sub.name}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={finish}
              disabled={subjects.length === 0}
              className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors disabled:opacity-40"
            >
              🧠 복습 캘린더 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
