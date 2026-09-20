import { useEffect, useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, Workflow } from 'lucide-react'
import { toast } from '../lib/shadcn/sonner'
import { useListCostAnalyses, useRunCostAnalysis } from '../hooks/backend/costAnalysis'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface FormState {
  name: string
  rawMaterialCost: string
  taxes: string
  operationalCosts: string
  revenue: string
}

const EMPTY_FORM: FormState = {
  name: '',
  rawMaterialCost: '',
  taxes: '',
  operationalCosts: '',
  revenue: '',
}

export default function CostAnalysis() {
  const { data: history, loading: loadingHistory, trigger: fetchHistory } = useListCostAnalyses()
  const { loading: running, trigger: runAnalysis } = useRunCostAnalysis()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const rawMaterialCost = Number(form.rawMaterialCost)
    const taxes = Number(form.taxes)
    const operationalCosts = Number(form.operationalCosts)
    const revenue = Number(form.revenue)

    if (!form.name.trim()) {
      toast.error('Informe um nome para a análise')
      return
    }
    if ([rawMaterialCost, taxes, operationalCosts, revenue].some((v) => Number.isNaN(v) || v < 0)) {
      toast.error('Preencha todos os valores com números válidos')
      return
    }

    try {
      await runAnalysis({ name: form.name.trim(), rawMaterialCost, taxes, operationalCosts, revenue })
      toast.success('Análise calculada e salva!')
      setForm(EMPTY_FORM)
      fetchHistory(undefined, { skipCache: true })
    } catch {
      toast.error('Não foi possível calcular a análise')
    }
  }

  return (
    <section className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-300 dark:border-amber-800/40 flex items-start gap-3">
        <Workflow className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-muted-foreground">
          O cálculo abaixo usa uma fórmula local por enquanto. Assim que um Retool Workflow com Python for publicado
          e conectado (via webhook), ele passará a processar consumo de matéria-prima, impostos e custos
          operacionais antes de salvar o resultado aqui.
        </p>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border space-y-4">
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground">Nova Análise de Custo &amp; Lucro</h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-mono text-muted-foreground uppercase">Nome da Análise</label>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Ex: Lote 042 — Agosto/2026"
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground uppercase">Consumo de Matéria-Prima (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.rawMaterialCost}
              onChange={(e) => updateField('rawMaterialCost', e.target.value)}
              placeholder="0,00"
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground uppercase">Impostos (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.taxes}
              onChange={(e) => updateField('taxes', e.target.value)}
              placeholder="0,00"
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground uppercase">Custos Operacionais (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.operationalCosts}
              onChange={(e) => updateField('operationalCosts', e.target.value)}
              placeholder="0,00"
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground uppercase">Receita (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.revenue}
              onChange={(e) => updateField('revenue', e.target.value)}
              placeholder="0,00"
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={running}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>{running ? 'Calculando…' : 'Calcular e Salvar'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Histórico de Análises</h3>
        </div>

        {loadingHistory ? (
          <div className="p-6 text-xs text-muted-foreground font-mono">Carregando…</div>
        ) : !history || history.length === 0 ? (
          <div className="p-6 text-xs text-muted-foreground font-mono">Nenhuma análise registrada ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-mono text-muted-foreground uppercase border-b border-border">
                  <th className="text-left px-6 py-2.5">Nome</th>
                  <th className="text-right px-4 py-2.5">Matéria-Prima</th>
                  <th className="text-right px-4 py-2.5">Impostos</th>
                  <th className="text-right px-4 py-2.5">Custos Op.</th>
                  <th className="text-right px-4 py-2.5">Receita</th>
                  <th className="text-right px-4 py-2.5">Custo Total</th>
                  <th className="text-right px-4 py-2.5">Lucro Líquido</th>
                  <th className="text-right px-6 py-2.5">Margem</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row: Record<string, unknown>) => {
                  const netProfit = Number(row['net_profit'])
                  const isPositive = netProfit >= 0
                  return (
                    <tr key={String(row['id'])} className="border-b border-border last:border-0">
                      <td className="text-left px-6 py-2.5 text-foreground font-medium">{String(row['name'])}</td>
                      <td className="text-right px-4 py-2.5 text-muted-foreground font-mono">
                        {formatCurrency(Number(row['raw_material_cost']))}
                      </td>
                      <td className="text-right px-4 py-2.5 text-muted-foreground font-mono">
                        {formatCurrency(Number(row['taxes']))}
                      </td>
                      <td className="text-right px-4 py-2.5 text-muted-foreground font-mono">
                        {formatCurrency(Number(row['operational_costs']))}
                      </td>
                      <td className="text-right px-4 py-2.5 text-muted-foreground font-mono">
                        {formatCurrency(Number(row['revenue']))}
                      </td>
                      <td className="text-right px-4 py-2.5 text-foreground font-mono">
                        {formatCurrency(Number(row['total_cost']))}
                      </td>
                      <td
                        className={`text-right px-4 py-2.5 font-mono font-semibold ${
                          isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatCurrency(netProfit)}
                        </span>
                      </td>
                      <td
                        className={`text-right px-6 py-2.5 font-mono font-semibold ${
                          isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'
                        }`}
                      >
                        {Number(row['margin_pct']).toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
