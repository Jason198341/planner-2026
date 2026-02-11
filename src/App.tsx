import { Calendar, BarChart3, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePlannerStore } from '@/store'
import SetupWizard from '@/components/SetupWizard'
import CalendarView from '@/components/CalendarView'
import TodoPanel from '@/components/TodoPanel'
import CategoryManager from '@/components/CategoryManager'
import RunnerGauge from '@/components/RunnerGauge'
import DashboardView from '@/components/DashboardView'
import SettingsModal from '@/components/SettingsModal'

export default function App() {
  const { settings, view, setView, showSettings, setShowSettings } = usePlannerStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!settings.setupDone) {
    return <SetupWizard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50/20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-bold text-surface-800">
              📋 <span className="text-brand-500">{settings.year}</span> 플래너
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500 hidden sm:block">
              안녕하세요, <strong className="text-surface-700">{settings.userName}</strong>님! 👋
            </span>

            {/* View tabs */}
            <div className="flex bg-surface-100 rounded-lg p-0.5 ml-3">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'calendar'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">캘린더</span>
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'dashboard'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">대시보드</span>
              </button>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors ml-1"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'calendar' ? (
          <div className="flex gap-6">
            {/* Sidebar (categories) - desktop always, mobile toggled */}
            <aside
              className={`${
                sidebarOpen ? 'block' : 'hidden'
              } lg:block w-full lg:w-72 flex-shrink-0 fixed lg:static inset-0 top-14 z-20 bg-surface-50/95 lg:bg-transparent p-4 lg:p-0 overflow-y-auto`}
            >
              <div className="space-y-4">
                <CategoryManager />
              </div>
            </aside>

            {/* Calendar + Todos */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <CalendarView />
                <RunnerGauge />
              </div>
              <div>
                <TodoPanel />
              </div>
            </div>
          </div>
        ) : (
          <DashboardView />
        )}
      </main>

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
