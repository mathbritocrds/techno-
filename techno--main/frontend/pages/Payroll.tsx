import { useState, useEffect, useCallback } from 'react'
import { CheckCheck, Lock } from 'lucide-react'
import { useGetPayrollSummary, useClosePayroll } from '../hooks/backend/payroll'
import { useOnDataChanged, emitDataChanged } from '../utils/events'
import { formatCurrencyBRL, currentPeriod, formatPeriodLabel } from '../utils/format'
import { toast } from '../lib/shadcn/sonner'

type PayrollLine = {
  employeeId: number
  name: string
  role: string
  baseSalary: number
  extraEarnings: number
  absenceDeduction: number
  inss: number
  irrf: number
  totalDeductions: number
  netPay: number
  unjustifiedAbsences: number
}

type PayrollSummary = {
  period: string
  status: string
  lines: PayrollLine[]
  totals: { gross: number; employerCharges: number; net: number }
}

export default function Payroll() {
  const { data, loading, error, trigger } = useGetPayrollSummary()
  const { trigger: closePayroll, loading: closing } = useClosePayroll()
  const [period] = useState(currentPeriod())

  const runQuery = useCallback(() => {
    trigger({ period })
  }, [trigger, period])

  useEffect(() => {
    runQuery()
  }, [runQuery])

  useOnDataChanged(['payroll', 'employees', 'attendance'], runQuery)

  const summary = data as PayrollSummary | null

  async function handleClose() {
    try {
      await closePayroll({ period }).result
      toast.success('Folha fechada e enviada para o banco!')
      emitDataChanged('payroll')
      runQuery()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fechar a folha')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Folha Mensal & Proventos</h3>
          <p className="text-xs text-muted-foreground">
            {formatPeriodLabel(period)} — Proventos, descontos de INSS/IRRF estimados e folha consolidada
          </p>
        </div>
        <button
          onClick={handleClose}
          disabled={closing || summary?.status === 'Fechada'}
          className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-lg transition-all inline-flex items-center"
        >
          {summary?.status === 'Fechada' ? (
            <>
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Folha Fechada
            </>
          ) : (
            <>
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> {closing ? 'Fechando...' : 'Fechar Folha'}
            </>
          )}
        </button>
      </div>

      {loading && !summary && <p className="text-xs text-muted-foreground">Carregando folha de pagamento...</p>}
      {error && <p className="text-xs text-destructive">Erro: {error}</p>}

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">Total Bruto</p>
              <h4 className="text-xl font-bold font-mono text-foreground mt-1">{formatCurrencyBRL(summary.totals.gross)}</h4>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Base sem adicionais</span>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">Encargos Estimados (FGTS/INSS)</p>
              <h4 className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrencyBRL(summary.totals.employerCharges)}
              </h4>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-500/80">Projeção patronal</span>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">Total Líquido do Mês</p>
              <h4 className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrencyBRL(summary.totals.net)}</h4>
              <span className="text-[10px] text-muted-foreground">
                {summary.status === 'Fechada' ? 'Folha fechada' : 'Pronto para bancarização'}
              </span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="px-4 py-3">Colaborador</th>
                    <th className="px-4 py-3">Cargo</th>
                    <th className="px-4 py-3 font-mono">Salário Base</th>
                    <th className="px-4 py-3 font-mono">Faltas Não Just.</th>
                    <th className="px-4 py-3 font-mono">Descontos Est.</th>
                    <th className="px-4 py-3 font-mono">Líquido</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {summary.lines.map((line) => (
                    <tr key={line.employeeId}>
                      <td className="px-4 py-3 font-medium text-foreground">{line.name}</td>
                      <td className="px-4 py-3">{line.role}</td>
                      <td className="px-4 py-3 font-mono">{formatCurrencyBRL(line.baseSalary)}</td>
                      <td className="px-4 py-3 font-mono">
                        {line.unjustifiedAbsences > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">{line.unjustifiedAbsences}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-destructive">{formatCurrencyBRL(line.totalDeductions)}</td>
                      <td className="px-4 py-3 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrencyBRL(line.netPay)}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            summary.status === 'Fechada'
                              ? 'bg-muted text-muted-foreground border-border'
                              : 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                          }`}
                        >
                          {summary.status === 'Fechada' ? 'Fechado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
