import { Fingerprint } from 'lucide-react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { getInitials } from '../utils/format'
import { ThemeToggle } from './ThemeToggle'
import MyPunch from '../pages/MyPunch'

export function EmployeeShell() {
  const { user } = useCurrentUser()

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden font-sans antialiased">
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h1 className="font-bold text-foreground text-sm tracking-wide">Registro de Ponto</h1>
        </div>
        <div className="flex items-center space-x-2.5">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-400">
            {user ? getInitials(user.fullName) : '—'}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">{user?.fullName}</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <MyPunch />
      </main>
    </div>
  )
}
