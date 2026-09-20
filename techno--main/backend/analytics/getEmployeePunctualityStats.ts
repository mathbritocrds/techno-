import { attendanceStatus, workedMinutes, type AttendanceRow } from '../shared/attendance'

type Params = {
  days?: number
}

export type EmployeePunctualityStats = {
  employeeId: number
  name: string
  department: string
  businessDays: number
  presentCount: number
  lateCount: number
  absentUnjustifiedCount: number
  absentJustifiedCount: number
  attendanceRate: number
  punctualityRate: number
  avgWorkedHoursLabel: string | null
}

export default async function getEmployeePunctualityStats(req: { params: Params }) {
  const days = req.params.days ?? 30

  const rowsRes = await retoolDb.query<{
    employee_id: number
    name: string
    department: string
    work_date: string
    entrada1: string | null
    saida_almoco: string | null
    retorno_almoco: string | null
    saida2: string | null
    justified: boolean | null
    occurrence_note: string | null
  }>(
    `SELECT e.id AS employee_id, e.name, e.department, a.work_date, a.entrada1, a.saida_almoco, a.retorno_almoco, a.saida2, a.justified, a.occurrence_note
     FROM employees e
     JOIN attendance_records a ON a.employee_id = e.id
     WHERE e.status = 'Ativo' AND a.work_date >= (CURRENT_DATE - ($1 || ' days')::interval)
     ORDER BY e.name ASC, a.work_date ASC`,
    [days]
  )

  const byEmployee = new Map<number, { name: string; department: string; rows: typeof rowsRes.data }>()
  for (const row of rowsRes.data) {
    const entry = byEmployee.get(row.employee_id)
    if (entry) {
      entry.rows.push(row)
    } else {
      byEmployee.set(row.employee_id, { name: row.name, department: row.department, rows: [row] })
    }
  }

  const stats: EmployeePunctualityStats[] = []
  for (const [employeeId, { name, department, rows }] of byEmployee) {
    let presentCount = 0
    let lateCount = 0
    let absentUnjustifiedCount = 0
    let absentJustifiedCount = 0
    let workedTotal = 0
    let workedDays = 0

    for (const row of rows) {
      const attendanceRow: AttendanceRow = {
        employee_id: employeeId,
        work_date: row.work_date,
        entrada1: row.entrada1,
        saida_almoco: row.saida_almoco,
        retorno_almoco: row.retorno_almoco,
        saida2: row.saida2,
        justified: !!row.justified,
        occurrence_note: row.occurrence_note,
      }
      const status = attendanceStatus(attendanceRow, row.work_date)
      if (status === 'Presente') presentCount++
      if (status === 'Atraso') {
        presentCount++
        lateCount++
      }
      if (status === 'Falta') absentUnjustifiedCount++
      if (status === 'Falta Justificada') absentJustifiedCount++

      const minutes = workedMinutes(attendanceRow)
      if (minutes !== null) {
        workedTotal += minutes
        workedDays++
      }
    }

    const businessDays = rows.length
    const avgMinutes = workedDays > 0 ? Math.round(workedTotal / workedDays) : null
    stats.push({
      employeeId,
      name,
      department,
      businessDays,
      presentCount,
      lateCount,
      absentUnjustifiedCount,
      absentJustifiedCount,
      attendanceRate: businessDays > 0 ? Math.round((presentCount / businessDays) * 1000) / 10 : 0,
      punctualityRate: presentCount > 0 ? Math.round(((presentCount - lateCount) / presentCount) * 1000) / 10 : 0,
      avgWorkedHoursLabel:
        avgMinutes !== null ? `${Math.floor(avgMinutes / 60)}h ${(avgMinutes % 60).toString().padStart(2, '0')}m` : null,
    })
  }

  return stats.sort((a, b) => a.name.localeCompare(b.name))
}
