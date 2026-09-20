import { PUNCH_COLUMN_BY_TYPE, type PunchType } from '../shared/attendance'

type Params = {
  employeeId: number
  punchType: PunchType
  date?: string
  time?: string
}

export default async function recordPunch(req: { params: Params }) {
  const { employeeId, punchType, date, time } = req.params
  if (!employeeId) throw new Error('employeeId é obrigatório')
  const column = PUNCH_COLUMN_BY_TYPE[punchType]
  if (!column) throw new Error('Tipo de marcação inválido')

  const workDate = date ?? new Date().toISOString().slice(0, 10)
  const punchTime = time ?? new Date().toISOString().slice(11, 19)

  await retoolDb.query(
    `INSERT INTO attendance_records (employee_id, work_date, ${column})
     VALUES ($1, $2, $3)
     ON CONFLICT (employee_id, work_date)
     DO UPDATE SET ${column} = $4`,
    [employeeId, workDate, punchTime, punchTime]
  )

  const result = await retoolDb.query(
    `SELECT employee_id, work_date, entrada1, saida_almoco, retorno_almoco, saida2, justified, occurrence_note
     FROM attendance_records WHERE employee_id = $1 AND work_date = $2`,
    [employeeId, workDate]
  )
  return result.data[0]
}
