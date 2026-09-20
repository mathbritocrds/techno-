import { useState, type FormEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../lib/shadcn/dialog'
import { useCreateRole } from '../hooks/backend/roles'
import { emitDataChanged } from '../utils/events'
import { toast } from '../lib/shadcn/sonner'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEPARTMENTS = ['Tecnologia', 'Recursos Humanos', 'Financeiro', 'Vendas', 'Operações']

export function AddRoleModal({ open, onOpenChange }: Props) {
  const { trigger: createRole, loading } = useCreateRole()
  const [name, setName] = useState('')
  const [department, setDepartment] = useState(DEPARTMENTS[0]!)
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')

  function reset() {
    setName('')
    setDepartment(DEPARTMENTS[0]!)
    setMinSalary('')
    setMaxSalary('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      await createRole({
        name,
        department,
        minSalary: Number(minSalary),
        maxSalary: Number(maxSalary),
      }).result
      toast.success('Cargo cadastrado com sucesso!')
      emitDataChanged('roles')
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar cargo')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
            Adicionar Cargo
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Nome do Cargo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Analista de Marketing"
              className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Setor</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
            >
              {DEPARTMENTS.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Salário Mínimo</label>
              <input
                type="number"
                required
                min={1}
                step="0.01"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="3000"
                className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Salário Máximo</label>
              <input
                type="number"
                required
                min={1}
                step="0.01"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="6000"
                className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-lg transition-all"
            >
              {loading ? 'Salvando...' : 'Salvar Cargo'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
