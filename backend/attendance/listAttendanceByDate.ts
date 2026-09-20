import { attendanceStatus, hoursWorkedLabel, type AttendanceRow } from '../shared/attendance'

type Params = {
  date: string
}

export type AttendanceEntry = {
  employeeId: number
  name: string
  role: string
  department: string
  entrada1: string | null
  saidaAlmoco: string | null
  retornoAlmoco: string | null
  saida2: string | null
  hoursWorked: string | null
  status: string
  occurrenceNote: string | null
}

export default async function listAttendanceByDate(req: { params: Params }) {
  const { date } = req.params
  if (!date) throw new Error('date é obrigatório')

  const result = await retoolDb.query<{
    employee_id: number
    name: string
    role: string
    department: string
    entrada1: string | null
    saida_almoco: string | null
    retorno_almoco: string | null
    saida2: string | null
    justified: boolean | null
    occurrence_note: string | null
  }>(
    `SELECT
       e.id AS employee_id,
       e.name,
       e.role,
       e.department,
       a.entrada1,
       a.saida_almoco,
       a.retorno_almoco,
       a.saida2,
       a.justified,
       a.occurrence_note
     FROM employees e
     LEFT JOIN attendance_records a ON a.employee_id = e.id AND a.work_date = $1
     WHERE e.status = 'Ativo'
     ORDER BY e.name ASC`,
    [date]
  )

  const entries: AttendanceEntry[] = result.data.map((row) => {
    const attendanceRow: AttendanceRow | null =
      row.entrada1 || row.justified
        ? {
            employee_id: row.employee_id,
            work_date: date,
            entrada1: row.entrada1,
            saida_almoco: row.saida_almoco,
            retorno_almoco: row.retorno_almoco,
            saida2: row.saida2,
            justified: !!row.justified,
            occurrence_note: row.occurrence_note,
          }
        : null

    return {
      employeeId: row.employee_id,
      name: row.name,
      role: row.role,
      department: row.department,
      entrada1: row.entrada1,
      saidaAlmoco: row.saida_almoco,
      retornoAlmoco: row.retorno_almoco,
      saida2: row.saida2,
      hoursWorked: hoursWorkedLabel({
        entrada1: row.entrada1,
        saida_almoco: row.saida_almoco,
        retorno_almoco: row.retorno_almoco,
        saida2: row.saida2,
      }),
      status: attendanceStatus(attendanceRow, date),
      occurrenceNote: row.occurrence_note,
    }
  })

  return entries
}
