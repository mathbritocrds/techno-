export type Employee = {
  id: number
  name: string
  role: string
  department: string
  base_salary: string
  weekly_hours: string
  status: string
  admission_date: string
  created_at: string
  email: string | null
  is_admin: boolean
  workplace_lat: number | null
  workplace_lng: number | null
  workplace_radius_m: number
}

type Params = {
  search?: string
  department?: string
}

export default async function listEmployees(req: { params: Params }) {
  const { search, department } = req.params
  const conditions: string[] = []
  const values: unknown[] = []

  if (search && search.trim().length > 0) {
    values.push(`%${search.trim()}%`)
    conditions.push(`(name ILIKE $${values.length} OR role ILIKE $${values.length} OR CAST(id AS TEXT) ILIKE $${values.length})`)
  }
  if (department && department.trim().length > 0) {
    values.push(department.trim())
    conditions.push(`department = $${values.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const result = await retoolDb.query<Employee>(
    `SELECT id, name, role, department, base_salary, weekly_hours, status, admission_date, created_at,
            email, is_admin, workplace_lat, workplace_lng, workplace_radius_m
     FROM employees
     ${where}
     ORDER BY name ASC`,
    values
  )
  return result.data
}
