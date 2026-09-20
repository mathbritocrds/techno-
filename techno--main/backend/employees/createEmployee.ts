type Params = {
  name: string
  role: string
  department: string
  baseSalary: number
  weeklyHours?: string
  email?: string
  isAdmin?: boolean
  workplaceLat?: number
  workplaceLng?: number
  workplaceRadiusM?: number
}

export default async function createEmployee(req: { params: Params }) {
  const { name, role, department, baseSalary, weeklyHours, email, isAdmin, workplaceLat, workplaceLng, workplaceRadiusM } = req.params
  if (!name?.trim() || !role?.trim() || !department?.trim()) {
    throw new Error('Nome, cargo e setor são obrigatórios')
  }
  if (!Number.isFinite(baseSalary) || baseSalary <= 0) {
    throw new Error('Salário base inválido')
  }

  const result = await retoolDb.query(
    `INSERT INTO employees (name, role, department, base_salary, weekly_hours, email, is_admin, workplace_lat, workplace_lng, workplace_radius_m)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 200))
     RETURNING id, name, role, department, base_salary, weekly_hours, status, admission_date, created_at, email, is_admin, workplace_lat, workplace_lng, workplace_radius_m`,
    [
      name.trim(),
      role.trim(),
      department.trim(),
      baseSalary,
      weeklyHours?.trim() || '44h Semanais',
      email?.trim().toLowerCase() || null,
      isAdmin ?? false,
      workplaceLat ?? null,
      workplaceLng ?? null,
      workplaceRadiusM ?? null,
    ]
  )
  return result.data[0]
}
