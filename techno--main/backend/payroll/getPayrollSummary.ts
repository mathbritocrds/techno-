import { estimateInss, estimateIrrf, estimateEmployerCharges } from '../shared/payroll'

type Params = {
  period: string // "YYYY-MM"
}

export type PayrollLine = {
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

export type PayrollSummary = {
  period: string
  status: string
  lines: PayrollLine[]
  totals: {
    gross: number
    employerCharges: number
    net: number
  }
}

export default async function getPayrollSummary(req: { params: Params }): Promise<PayrollSummary> {
  const { period } = req.params
  if (!/^\d{4}-\d{2}$/.test(period)) throw new Error('period deve estar no formato YYYY-MM')

  const employeesRes = await retoolDb.query<{ id: number; name: string; role: string; base_salary: string }>(
    `SELECT id, name, role, base_salary FROM employees WHERE status = 'Ativo' ORDER BY name ASC`
  )

  const absencesRes = await retoolDb.query<{ employee_id: number; unjustified_count: number }>(
    `SELECT
       e.id AS employee_id,
       COUNT(a.id) FILTER (WHERE a.entrada1 IS NULL AND NOT a.justified) AS unjustified_count
     FROM employees e
     LEFT JOIN attendance_records a ON a.employee_id = e.id AND to_char(a.work_date, 'YYYY-MM') = $1
     WHERE e.status = 'Ativo'
     GROUP BY e.id`,
    [period]
  )
  const absenceByEmployee = new Map(absencesRes.data.map((r) => [r.employee_id, r]))

  // Count business days (Mon-Fri) in the target month, computed in JS to avoid repeated placeholders.
  const [year, month] = period.split('-').map(Number) as [number, number]
  let monthBusinessDays = 0
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(Date.UTC(year, month - 1, d)).getUTCDay()
    if (dow !== 0 && dow !== 6) monthBusinessDays++
  }

  const periodRes = await retoolDb.query<{ status: string }>(`SELECT status FROM payroll_periods WHERE period = $1`, [period])
  const status = periodRes.data[0]?.status ?? 'Aberta'

  let gross = 0
  let employerCharges = 0
  let net = 0

  const lines: PayrollLine[] = employeesRes.data.map((emp) => {
    const baseSalary = Number(emp.base_salary)
    const absenceInfo = absenceByEmployee.get(emp.id)
    const unjustifiedAbsences = Number(absenceInfo?.unjustified_count ?? 0)
    const extraEarnings = 0
    const absenceDeduction = Math.round(((baseSalary / monthBusinessDays) * unjustifiedAbsences) * 100) / 100
    const adjustedGross = baseSalary + extraEarnings - absenceDeduction
    const inss = estimateInss(adjustedGross)
    const irrf = estimateIrrf(adjustedGross, inss)
    const totalDeductions = Math.round((inss + irrf + absenceDeduction) * 100) / 100
    const netPay = Math.round((baseSalary + extraEarnings - inss - irrf - absenceDeduction) * 100) / 100

    gross += baseSalary
    employerCharges += estimateEmployerCharges(baseSalary)
    net += netPay

    return {
      employeeId: emp.id,
      name: emp.name,
      role: emp.role,
      baseSalary,
      extraEarnings,
      absenceDeduction,
      inss,
      irrf,
      totalDeductions,
      netPay,
      unjustifiedAbsences,
    }
  })

  return {
    period,
    status,
    lines,
    totals: {
      gross: Math.round(gross * 100) / 100,
      employerCharges: Math.round(employerCharges * 100) / 100,
      net: Math.round(net * 100) / 100,
    },
  }
}
