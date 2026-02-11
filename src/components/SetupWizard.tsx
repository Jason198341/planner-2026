import { useState } from 'react'
import { User, Calendar, ChevronRight } from 'lucide-react'
import { usePlannerStore } from '@/store'

const DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export default function SetupWizard() {
  const { settings, updateSettings } = usePlannerStore()
  const [name, setName] = useState(settings.userName)
  const [year, setYear] = useState(settings.year)
  const [startDay, setStartDay] = useState(settings.startDay)
  const [step, setStep] = useState(0)

  const finish = () => {
    updateSettings({ userName: name, year, startDay, setupDone: true })
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
              <p className="text-surface-500">캘린더를 자동 생성합니다</p>
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
            <div className="text-4xl">🗓️</div>
            <div>
              <h2 className="text-2xl font-bold text-surface-800 mb-2">
                주 시작 요일
              </h2>
              <p className="text-surface-500">캘린더의 첫 요일을 선택하세요</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setStartDay(i)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    startDay === i
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors"
            >
              🎉 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
