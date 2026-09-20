import { useState, useEffect } from 'react'
import { Fingerprint } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../lib/shadcn/dialog'
import { useListEmployees } from '../hooks/backend/employees'
import { useRecordPunch } from '../hooks/backend/attendance'
import { emitDataChanged } from '../utils/events'
import { toast } from '../lib/shadcn/sonner'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PUNCH_TYPES = [
  { value: 'Entrada 1', label: 'Entrada 1 (Turno da Manhã)' },
  { value: 'Saída Almoço', label: 'Saída para Almoço' },
  { value: 'Retorno Almoço', label: 'Retorno do Almoço' },
  { value: 'Saída 2', label: 'Saída 2 (Fim de Expediente)' },
] as const

export function PunchModal({ open, onOpenChange }: Props) {
  const { data: employees, trigger: fetchEmployees } = useListEmployees()
  const { trigger: recordPunch, loading } = useRecordPunch()

  const [employeeId, setEmployeeId] = useState<string>('')
  const [punchType, setPunchType] = useState<string>(PUNCH_TYPES[0].value)

  useEffect(() => {
    if (open) fetchEmployees({})
  }, [open, fetchEmployees])

  useEffect(() => {
    const first = employees?.[0]
    if (first && !employeeId) {
      setEmployeeId(String(first.id))
    }
  }, [employees, employeeId])

  async function handleConfirm() {
    if (!employeeId) {
      toast.error('Selecione um colaborador')
      return
    }
    try {
      await recordPunch({ employeeId: Number(employeeId), punchType }).result
      toast.success('Ponto registrado com sucesso!')
      emitDataChanged('attendance')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar ponto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-sm p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
          <Fingerprint className="w-5 h-5" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wide text-center">
            Registro de Ponto Bio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 text-center">
            Selecione o colaborador para registrar o batimento no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="text-left space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Colaborador</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
            >
              {(employees ?? []).map((emp: { id: number; name: string }) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Tipo de Marcação</label>
            <select
              value={punchType}
              onChange={(e) => setPunchType(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
            >
              {PUNCH_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex space-x-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-1/2 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="w-1/2 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-lg transition-all"
          >
            {loading ? 'Registrando...' : 'Confirmar Ponto'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
