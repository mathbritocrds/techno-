import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useListRoles } from '../hooks/backend/roles'
import { useOnDataChanged } from '../utils/events'
import { formatCurrencyBRL } from '../utils/format'
import { AddRoleModal } from '../components/AddRoleModal'

type RoleWithStats = {
  id: number
  name: string
  department: string
  min_salary: string
  max_salary: string
  headcount: number
  avg_salary: number | null
}

export default function Roles() {
  const { data, loading, error, trigger } = useListRoles()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    trigger()
  }, [trigger])

  useOnDataChanged(['roles', 'employees'], () => trigger({}, { skipCache: true }))

  const roles = (data ?? []) as RoleWithStats[]

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Plano de Cargos & Faixas Salariais</h3>
          <p className="text-xs text-muted-foreground">Estruturação organizacional e limites orçamentários por função</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all inline-flex items-center"
        >
          <Plus className="w-3 h-3 mr-1" /> Adicionar Cargo
        </button>
      </div>

      {loading && roles.length === 0 && <p className="text-xs text-muted-foreground">Carregando cargos...</p>}
      {error && <p className="text-xs text-destructive">Erro: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-card p-4 rounded-xl border border-border hover:border-emerald-500/40 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">{role.name}</h4>
                <p className="text-[11px] text-muted-foreground">{role.department}</p>
              </div>
              <span className="text-[10px] bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded font-mono">
                {role.headcount} pessoa{role.headcount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Faixa Mínima</p>
                <p className="font-mono text-foreground">{formatCurrencyBRL(Number(role.min_salary))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Faixa Máxima</p>
                <p className="font-mono text-foreground">{formatCurrencyBRL(Number(role.max_salary))}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-[11px] text-muted-foreground">Salário Médio Atual</p>
              <p className="font-mono text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                {role.avg_salary !== null ? formatCurrencyBRL(role.avg_salary) : '—'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AddRoleModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  )
}
