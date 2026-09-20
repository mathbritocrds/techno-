import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { useListEmployees, useDeleteEmployee } from '../hooks/backend/employees'
import { useModals } from '../context/ModalsContext'
import { useOnDataChanged } from '../utils/events'
import { emitDataChanged } from '../utils/events'
import { formatCurrencyBRL, getInitials } from '../utils/format'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { toast } from '../lib/shadcn/sonner'
import type { EditableEmployee } from '../components/AddEmployeeModal'

const DEPARTMENTS = ['Tecnologia', 'Recursos Humanos', 'Financeiro', 'Vendas', 'Operações']

type Employee = {
  id: number
  name: string
  role: string
  department: string
  base_salary: string
  weekly_hours: string
  status: string
  email: string | null
  is_admin: boolean
  workplace_lat: string | null
  workplace_lng: string | null
  workplace_radius_m: number | string
}

export default function Collaborators() {
  const { data, loading, error, trigger } = useListEmployees()
  const { trigger: deleteEmployee, loading: deleting } = useDeleteEmployee()
  const { openAddEmployee } = useModals()

  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)

  const runQuery = useCallback(() => {
    trigger({ search, department })
  }, [trigger, search, department])

  useEffect(() => {
    runQuery()
  }, [runQuery])

  useOnDataChanged(['employees'], runQuery)

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteEmployee({ id: deleteTarget.id }).result
      toast.success('Colaborador removido com sucesso!')
      emitDataChanged('employees')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover colaborador')
    }
  }

  const employees = (data ?? []) as Employee[]

  return (
    <section className="space-y-4">
      <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, ID ou cargo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-emerald-500/60"
          >
            <option value="">Todos os Setores</option>
            {DEPARTMENTS.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <button
            onClick={() => openAddEmployee()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap inline-flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> Cadastrar
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3">Cargo / Função</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Salário Base</th>
                <th className="px-4 py-3">Jornada</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3">Acesso</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading && employees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando colaboradores...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-destructive">
                    Erro: {error}
                  </td>
                </tr>
              )}
              {!loading && employees.length === 0 && !error && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] text-emerald-700 dark:text-emerald-400">
                        {getInitials(emp.name)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground">EMP-{String(emp.id).padStart(2, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{emp.role}</td>
                  <td className="px-4 py-3">{emp.department}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrencyBRL(Number(emp.base_salary))}</td>
                  <td className="px-4 py-3">{emp.weekly_hours}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        emp.status === 'Ativo'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {emp.is_admin ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : emp.email ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border">
                        Funcionário
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-background text-muted-foreground/70 border-border">
                        Sem e-mail
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        aria-label="Editar colaborador"
                        onClick={() =>
                          openAddEmployee({
                            id: emp.id,
                            name: emp.name,
                            role: emp.role,
                            department: emp.department,
                            base_salary: emp.base_salary,
                            weekly_hours: emp.weekly_hours,
                            email: emp.email,
                            is_admin: emp.is_admin,
                            workplace_lat: emp.workplace_lat,
                            workplace_lng: emp.workplace_lng,
                            workplace_radius_m: emp.workplace_radius_m,
                          } as EditableEmployee)
                        }
                        className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        aria-label="Remover colaborador"
                        onClick={() => setDeleteTarget(emp)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remover colaborador"
        description={`Tem certeza que deseja remover "${deleteTarget?.name}"? Todos os registros de ponto associados também serão removidos. Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </section>
  )
}
