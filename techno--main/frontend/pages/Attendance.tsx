import { useState, useEffect, useCallback } from 'react'
import { FileDown, Fingerprint } from 'lucide-react'
import { useListAttendanceByDate } from '../hooks/backend/attendance'
import { useModals } from '../context/ModalsContext'
import { useOnDataChanged } from '../utils/events'
import { formatTime, attendanceStatusStyle } from '../utils/format'
import { toast } from '../lib/shadcn/sonner'

type AttendanceEntry = {
  employeeId: number
  name: string
  role: string
  department: string
  entrada1: string | null
  saidaAlmoco: string | null
  retornoAlmoco: string | null
  saida2: string | null
  hoursWorked: string | null
  status: string
  occurrenceNote: string | null
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function Attendance() {
  const { data, loading, error, trigger } = useListAttendanceByDate()
  const { openPunch } = useModals()
  const [date, setDate] = useState(todayIso())

  const runQuery = useCallback(() => {
    trigger({ date })
  }, [trigger, date])

  useEffect(() => {
    runQuery()
  }, [runQuery])

  useOnDataChanged(['attendance', 'employees'], runQuery)

  const entries = (data ?? []) as AttendanceEntry[]

  return (
    <section className="space-y-4">
      <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-emerald-500/60 font-mono"
          />
          <span className="text-xs text-muted-foreground">Espelho de Ponto Eletrônico Diário</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toast.info('Relatório de Ponto exportado em formato CSV')}
            className="px-3 py-1.5 text-xs bg-muted hover:bg-accent text-foreground rounded-lg font-medium border border-border transition-all inline-flex items-center"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Exportar CSV
          </button>
          <button
            onClick={openPunch}
            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all inline-flex items-center"
          >
            <Fingerprint className="w-3.5 h-3.5 mr-1" /> Registrar Marcação
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3 font-mono">Entrada 1</th>
                <th className="px-4 py-3 font-mono">Saída Alm.</th>
                <th className="px-4 py-3 font-mono">Retorno Alm.</th>
                <th className="px-4 py-3 font-mono">Saída 2</th>
                <th className="px-4 py-3 font-mono">Horas Trab.</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ocorrência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading && entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando frequência...
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
              {entries.map((entry) => {
                const style = attendanceStatusStyle(entry.status)
                return (
                  <tr key={entry.employeeId}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{entry.name}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.role}</p>
                    </td>
                    <td className="px-4 py-3 font-mono">{formatTime(entry.entrada1)}</td>
                    <td className="px-4 py-3 font-mono">{formatTime(entry.saidaAlmoco)}</td>
                    <td className="px-4 py-3 font-mono">{formatTime(entry.retornoAlmoco)}</td>
                    <td className="px-4 py-3 font-mono">{formatTime(entry.saida2)}</td>
                    <td className="px-4 py-3 font-mono">{entry.hoursWorked ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.className}`}>{style.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{entry.occurrenceNote ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
