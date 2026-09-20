type Params = {
  period: string // "YYYY-MM"
}

export default async function closePayroll(req: { params: Params }) {
  const { period } = req.params
  if (!/^\d{4}-\d{2}$/.test(period)) throw new Error('period deve estar no formato YYYY-MM')

  await retoolDb.query(
    `INSERT INTO payroll_periods (period, status, closed_at)
     VALUES ($1, 'Fechada', now())
     ON CONFLICT (period) DO UPDATE SET status = 'Fechada', closed_at = now()`,
    [period]
  )

  return { success: true, period, status: 'Fechada' }
}
