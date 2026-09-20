type Params = {
  id: number
  name?: string
  role?: string
  department?: string
  baseSalary?: number
  weeklyHours?: string
  status?: 'Ativo' | 'Inativo'
  email?: string | null
  isAdmin?: boolean
  workplaceLat?: number | null
  workplaceLng?: number | null
  workplaceRadiusM?: number
}

export default async function updateEmployee(req: { params: Params }) {
  const { id, name, role, department, baseSalary, weeklyHours, status, email, isAdmin, workplaceLat, workplaceLng, workplaceRadiusM } = req.params
  if (!id) throw new Error('id é obrigatório')

  const fields: string[] = []
  const values: unknown[] = []

  function set(column: string, value: unknown) {
    values.push(value)
    fields.push(`${column} = $${values.length}`)
  }

  if (name !== undefined) set('name', name.trim())
  if (role !== undefined) set('role', role.trim())
  if (department !== undefined) set('department', department.trim())
  if (baseSalary !== undefined) set('base_salary', baseSalary)
  if (weeklyHours !== undefined) set('weekly_hours', weeklyHours.trim())
  if (status !== undefined) set('status', status)
  if (email !== undefined) set('email', email ? email.trim().toLowerCase() : null)
  if (isAdmin !== undefined) set('is_admin', isAdmin)
  if (workplaceLat !== undefined) set('workplace_lat', workplaceLat)
  if (workplaceLng !== undefined) set('workplace_lng', workplaceLng)
  if (workplaceRadiusM !== undefined) set('workplace_radius_m', workplaceRadiusM)

  if (fields.length === 0) throw new Error('Nenhum campo para atualizar')

  values.push(id)
  const result = await retoolDb.query(
    `UPDATE employees SET ${fields.join(', ')} WHERE id = $${values.length}
     RETURNING id, name, role, department, base_salary, weekly_hours, status, admission_date, created_at, email, is_admin, workplace_lat, workplace_lng, workplace_radius_m`,
    values
  )
  return result.data[0]
}
