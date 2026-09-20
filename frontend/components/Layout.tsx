import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  ChartPie,
  Users,
  History,
  Layers,
  Receipt,
  GitBranch,
  Fingerprint,
  Plus,
  UserCog,
  ChevronRight,
  Calculator,
  ShieldAlert,
} from 'lucide-react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useModals } from '../context/ModalsContext'
import { useAccess } from '../context/AccessContext'
import { getInitials } from '../utils/format'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Painel de Controle', icon: ChartPie },
  { to: '/colaboradores', label: 'Colaboradores', icon: Users },
  { to: '/frequencia', label: 'Frequência & Ponto', icon: History },
  { to: '/cargos', label: 'Cargos & Salários', icon: Layers },
  { to: '/folha', label: 'Folha de Pagamento', icon: Receipt },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Painel de Controle',
  '/colaboradores': 'Colaboradores',
  '/frequencia': 'Frequência & Ponto',
  '/cargos': 'Cargos & Salários',
  '/folha': 'Folha de Pagamento',
  '/integracao': 'Integração API / Sync',
  '/analise-custos': 'Análise de Custo & Lucro',
}

export function Layout() {
  const { user } = useCurrentUser()
  const { openAddEmployee, openPunch } = useModals()
  const { bootstrap } = useAccess()
  const location = useLocation()

  const currentPath = location.pathname
  const pageTitle = PAGE_TITLES[currentPath] ?? 'Painel de Controle'

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden font-sans antialiased">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-border justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm tracking-wide leading-tight">Gestão de Pessoal</h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-mono">v2.4 • Sistema Ativo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Páginas Principais
          </div>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-btn flex items-center px-3 py-2.5 text-xs font-medium rounded-lg transition-all border ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-2.5" />
              {label}
            </NavLink>
          ))}
          <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Sistema
          </div>
          <NavLink
            to="/integracao"
            className={({ isActive }) =>
              `nav-btn flex items-center px-3 py-2.5 text-xs font-medium rounded-lg transition-all border ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
              }`
            }
          >
            <GitBranch className="w-4 h-4 mr-2.5" />
            Integração API / Sync
          </NavLink>
          <NavLink
            to="/analise-custos"
            className={({ isActive }) =>
              `nav-btn flex items-center px-3 py-2.5 text-xs font-medium rounded-lg transition-all border ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
              }`
            }
          >
            <Calculator className="w-4 h-4 mr-2.5" />
            Análise de Custo & Lucro
          </NavLink>
        </nav>

        <div className="p-3 border-t border-border bg-card/60 space-y-3">
          <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono text-foreground">Banco de Dados: Conectado</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/50">
              200 OK
            </span>
          </div>

          <div className="flex items-center space-x-3 px-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-400">
              {user ? getInitials(user.fullName) : '—'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.fullName ?? 'Usuário'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-mono">
              <span>Sistema</span>
              <ChevronRight className="w-2.5 h-2.5" />
              <span className="text-emerald-700 dark:text-emerald-400">{pageTitle}</span>
            </div>
            <h2 className="text-base font-bold text-foreground tracking-tight">{pageTitle}</h2>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <button
              onClick={openPunch}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Registrar Ponto</span>
            </button>

            <button
              onClick={() => openAddEmployee()}
              className="inline-flex items-center space-x-1.5 bg-muted hover:bg-accent text-foreground text-xs font-medium px-3 py-2 rounded-lg border border-border transition-all"
            >
              <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Novo Colaborador</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {bootstrap ? (
            <div className="bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200/90">
                Nenhum administrador foi configurado ainda — você está com acesso total temporário. Va em{' '}
                <strong>Colaboradores</strong> e vincule seu e-mail ({user?.email}) a um cadastro marcado como
                administrador para manter o acesso permanentemente.
              </p>
            </div>
          ) : null}
          <Outlet />
        </div>
      </main>
    </div>
  )
}

// Kept for pages that navigate programmatically (e.g. "Ver Histórico Completo →" links).
export function useGoTo() {
  const navigate = useNavigate()
  return navigate
}
