import { ShieldAlert } from 'lucide-react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { ThemeToggle } from '../components/ThemeToggle'

export default function NoAccess() {
  const { user } = useCurrentUser()

  return (
    <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center p-6 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">Sem acesso a este sistema</h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Sua conta ({user?.email ?? 'desconhecida'}) ainda não está vinculada a um cadastro de colaborador. Peça
            ao administrador de RH para adicionar seu e-mail no cadastro correspondente.
          </p>
        </div>
      </div>
    </div>
  )
}
