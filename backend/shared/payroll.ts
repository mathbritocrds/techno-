// Shared payroll domain logic: simplified Brazilian INSS/IRRF estimates and employer charges.
// These brackets approximate common public tables and are meant for estimation/demo purposes,
// matching the "Estimado"/"Projeção" labeling already used across the payroll UI.

type Bracket = { ceiling: number; rate: number }

const INSS_BRACKETS: Bracket[] = [
  { ceiling: 1412.0, rate: 0.075 },
  { ceiling: 2666.68, rate: 0.09 },
  { ceiling: 4000.03, rate: 0.12 },
  { ceiling: 7786.02, rate: 0.14 },
]

type IrrfBracket = { ceiling: number; rate: number; deduction: number }

const IRRF_BRACKETS: IrrfBracket[] = [
  { ceiling: 2259.2, rate: 0, deduction: 0 },
  { ceiling: 2826.65, rate: 0.075, deduction: 169.44 },
  { ceiling: 3751.05, rate: 0.15, deduction: 381.44 },
  { ceiling: 4664.68, rate: 0.225, deduction: 662.77 },
  { ceiling: Infinity, rate: 0.275, deduction: 896.0 },
]

/** Progressive INSS estimate for a gross monthly salary. */
export function estimateInss(grossSalary: number): number {
  let total = 0
  let previousCeiling = 0
  const cap = INSS_BRACKETS[INSS_BRACKETS.length - 1]!.ceiling
  const base = Math.min(grossSalary, cap)
  for (const bracket of INSS_BRACKETS) {
    if (base > previousCeiling) {
      const slice = Math.min(base, bracket.ceiling) - previousCeiling
      total += slice * bracket.rate
    }
    previousCeiling = bracket.ceiling
  }
  return Math.round(total * 100) / 100
}

/** Simplified IRRF estimate applied to the salary net of INSS. */
export function estimateIrrf(grossSalary: number, inss: number): number {
  const base = grossSalary - inss
  const bracket = IRRF_BRACKETS.find((b) => base <= b.ceiling) ?? IRRF_BRACKETS[IRRF_BRACKETS.length - 1]!
  const value = base * bracket.rate - bracket.deduction
  return Math.round(Math.max(0, value) * 100) / 100
}

/** Estimated employer charges (FGTS + employer INSS share), commonly ~26.8% of gross salary. */
export function estimateEmployerCharges(grossSalary: number): number {
  return Math.round(grossSalary * 0.268 * 100) / 100
}
