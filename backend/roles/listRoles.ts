export type RoleWithStats = {
  id: number
  name: string
  department: string
  min_salary: string
  max_salary: string
  created_at: string
  headcount: number
  avg_salary: number | null
}

export default async function listRoles() {
  const result = await retoolDb.query<RoleWithStats>(
    `SELECT
       r.id,
       r.name,
       r.department,
       r.min_salary,
       r.max_salary,
       r.created_at,
       COUNT(e.id)::int AS headcount,
       AVG(e.base_salary)::float AS avg_salary
     FROM roles r
     LEFT JOIN employees e ON e.role = r.name AND e.status = 'Ativo'
     GROUP BY r.id, r.name, r.department, r.min_salary, r.max_salary, r.created_at
     ORDER BY r.department ASC, r.name ASC`
  )
  return result.data
}
