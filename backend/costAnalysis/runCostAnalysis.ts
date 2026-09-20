/**
 * Runs a cost/profit analysis and persists the result.
 *
 * TODO (pending Retool Workflow): once a Retool Workflow with a Python code block is published,
 * replace the `computeLocally` call below with a call to that workflow's webhook (connected here
 * as a REST API resource), sending the same input and using its returned totals instead.
 */

interface Params {
  name: string
  rawMaterialCost: number
  taxes: number
  operationalCosts: number
  revenue: number
}

interface CostAnalysisResult {
  id: number
  name: string
  raw_material_cost: number
  taxes: number
  operational_costs: number
  revenue: number
  total_cost: number
  net_profit: number
  margin_pct: number
  created_at: string
}

function computeLocally(params: Params) {
  const totalCost = params.rawMaterialCost + params.taxes + params.operationalCosts
  const netProfit = params.revenue - totalCost
  const marginPct = params.revenue !== 0 ? (netProfit / params.revenue) * 100 : 0
  return { totalCost, netProfit, marginPct }
}

export default async function (req: { params: Params }) {
  const { name, rawMaterialCost, taxes, operationalCosts, revenue } = req.params

  const { totalCost, netProfit, marginPct } = computeLocally({
    name,
    rawMaterialCost,
    taxes,
    operationalCosts,
    revenue,
  })

  const result = await retoolDb.insert<CostAnalysisResult>({
    tableName: 'cost_analyses',
    changeset: {
      name,
      raw_material_cost: rawMaterialCost,
      taxes,
      operational_costs: operationalCosts,
      revenue,
      total_cost: totalCost,
      net_profit: netProfit,
      margin_pct: marginPct,
    },
  })

  return result.data[0]
}
