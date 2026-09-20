import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserCheck, TriangleAlert, Vault, RefreshCw } from 'lucide-react'
import { useGetDashboardStats } from '../hooks/backend/analytics'
import { useOnDataChanged } from '../utils/events'
import { formatCurrencyBRL, formatTime, attendanceStatusStyle } from '../utils/format'

export default function Dashboard() {
  const { data, loading, error, trigger } = useGetDashboardStats()
  const navigate = useNavigate()

  useEffect(() => {
    trigger()
  }, [trigger])

  useOnDataChanged(['employees', 'attendance'], () => trigger({}, { skipCache: true }))

  if (loading && !data) {
    return <div className="p-4 text-xs text-muted-foreground">Carregando painel...</div>
  }
  if (error) {
    return <div className="p-4 text-xs text-destructive">Erro ao carregar painel: {error}</div>
  }
  if (!data) return null

  const presencePct = data.presenceToday.pct
  const presenceLabel = data.presenceToday.isBusinessDay
    ? presencePct !== null
      ? `${presencePct}%`
      : '—'
    : 'Sem expediente'
  const presenceSub = data.presenceToday.isBusinessDay
    ? `${data.presenceToday.presentCount} de ${data.presenceToday.expectedCount} apresentaram registro`
    : 'Fim de semana — sem expediente hoje'

  return (
    <section className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total de Colaboradores</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mt-2 font-mono">{data.totalEmployees}</h3>
          <div className="mt-2 flex items-center text-[11px] text-emerald-700 dark:text-emerald-400">
            <span>100% Cadastrados ativamente</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Presença Hoje</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mt-2 font-mono">{presenceLabel}</h3>
          <p className="text-[11px] text-muted-foreground mt-2">{presenceSub}</p>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Atrasos / Ocorrências</p>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <TriangleAlert className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono">{data.occurrencesToday.total}</h3>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 mt-2">
            {data.occurrencesToday.lateCount} atraso(s) | {data.occurrencesToday.absentUnjustifiedCount} falta(s) |{' '}
            {data.occurrencesToday.absentJustifiedCount} justificada(s)
          </p>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Folha de Pagamento Estimada</p>
            <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <Vault className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mt-2 font-mono">{formatCurrencyBRL(data.estimatedPayroll.total)}</h3>
          <p className="text-[11px] text-muted-foreground mt-2">Média: {formatCurrencyBRL(data.estimatedPayroll.average)} / pessoa</p>
        </div>
      </div>

      {/* Sync Widget */}
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Barramento de Integração de Ponto e Folha</h4>
            <p className="text-[11px] text-muted-foreground">
              Dispositivos relógio e sistemas ERP sincronizados em tempo real via protocolo REST.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/integracao')}
          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/40 transition-all whitespace-nowrap"
        >
          Status dos Connectors &rarr;
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-xs font-bold text-foreground tracking-wide uppercase">Marcações Recentes do Dia</h3>
              <p className="text-[11px] text-muted-foreground">Últimos batimentos validados biometricamente</p>
            </div>
            <button onClick={() => navigate('/frequencia')} className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-medium">
              Ver Histórico Completo &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border font-mono text-[11px]">
                  <th className="pb-2">Colaborador</th>
                  <th className="pb-2">Entrada 1</th>
                  <th className="pb-2">Saída Alm.</th>
                  <th className="pb-2">Retorno Alm.</th>
                  <th className="pb-2">Saída 2</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {(data.recentPunches as Array<{
                  employeeId: number
                  name: string
                  entrada1: string | null
                  saidaAlmoco: string | null
                  retornoAlmoco: string | null
                  saida2: string | null
                  status: string
                }>).map((p) => {
                  const style = attendanceStatusStyle(p.status)
                  return (
                    <tr key={p.employeeId}>
                      <td className="py-2 font-medium text-foreground">{p.name}</td>
                      <td className="py-2 font-mono">{formatTime(p.entrada1)}</td>
                      <td className="py-2 font-mono">{formatTime(p.saidaAlmoco)}</td>
                      <td className="py-2 font-mono">{formatTime(p.retornoAlmoco)}</td>
                      <td className="py-2 font-mono">{formatTime(p.saida2)}</td>
                      <td className="py-2 text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.className}`}>{style.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-xs font-bold text-foreground tracking-wide uppercase">Distribuição por Setor</h3>
            <p className="text-[11px] text-muted-foreground">Alocação de pessoal por departamento</p>
          </div>
          <div className="space-y-3">
            {(data.departmentBreakdown as Array<{ department: string; count: number; pct: number }>).map((d) => (
              <div key={d.department}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground">{d.department}</span>
                  <span className="text-muted-foreground font-mono">
                    {d.count} ({d.pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
