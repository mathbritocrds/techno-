type Params = {
  name: string
  department: string
  minSalary: number
  maxSalary: number
}

export default async function createRole(req: { params: Params }) {
  const { name, department, minSalary, maxSalary } = req.params
  if (!name?.trim() || !department?.trim()) {
    throw new Error('Nome e setor são obrigatórios')
  }
  if (!Number.isFinite(minSalary) || !Number.isFinite(maxSalary) || minSalary <= 0 || maxSalary < minSalary) {
    throw new Error('Faixa salarial inválida')
  }

  const result = await retoolDb.query(
    `INSERT INTO roles (name, department, min_salary, max_salary)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, department, min_salary, max_salary, created_at`,
    [name.trim(), department.trim(), minSalary, maxSalary]
  )
  return result.data[0]
}
