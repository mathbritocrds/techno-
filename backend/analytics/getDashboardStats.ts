import { attendanceStatus, isBusinessDay, type AttendanceRow } from '../shared/attendance'

export type DashboardStats = {
  totalEmployees: number
  presenceToday: {
    presentCount: number
    expectedCount: number
    pct: number | null
    isBusinessDay: boolean
    date: string
  }
  occurrencesToday: {
    lateCount: number
    absentUnjustifiedCount: number
    absentJustifiedCount: number
    total: number
  }
  estimatedPayroll: {
    total: number
    average: number
  }
  departmentBreakdown: Array<{ department: string; count: number; pct: number }>
  recentPunches: Array<{
    employeeId: number
    name: string
    entrada1: string | null
    saidaAlmoco: string | null
    retornoAlmoco: string | null
    saida2: string | null
    status: string
    date: string
  }>
}

export default async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10)

  const employeesRes = await retoolDb.query<{ id: number; base_salary: string; department: string }>(
    `SELECT id, base_salary, department FROM employees WHERE status = 'Ativo'`
  )
  const employees = employeesRes.data
  const totalEmployees = employees.length

  const totalPayroll = employees.reduce((sum, e) => sum + Number(e.base_salary), 0)

  const deptCounts = new Map<string, number>()
  for (const e of employees) {
    deptCounts.set(e.department, (deptCounts.get(e.department) ?? 0) + 1)
  }
  const departmentBreakdown = Array.from(deptCounts.entries())
    .map(([department, count]) => ({
      department,
      count,
      pct: totalEmployees > 0 ? Math.round((count / totalEmployees) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Most recent date (<= today) that has any attendance activity, used for the "recent punches" widget.
  const latestDateRes = await retoolDb.query<{ work_date: string }>(
    `SELECT work_date FROM attendance_records WHERE work_date <= $1 ORDER BY work_date DESC LIMIT 1`,
    [today]
  )
  const latestDate = latestDateRes.data[0]?.work_date ?? today

  const attendanceTodayRes = await retoolDb.query<{
    employee_id: number
    name: string
    entrada1: string | null
    saida_almoco: string | null
    retorno_almoco: string | null
    saida2: string | null
    justified: boolean | null
    occurrence_note: string | null
  }>(
    `SELECT e.id AS employee_id, e.name, a.entrada1, a.saida_almoco, a.retorno_almoco, a.saida2, a.justified, a.occurrence_note
     FROM employees e
     LEFT JOIN attendance_records a ON a.employee_id = e.id AND a.work_date = $1
     WHERE e.status = 'Ativo'
     ORDER BY e.name ASC`,
    [today]
  )

  let presentCount = 0
  let lateCount = 0
  let absentUnjustifiedCount = 0
  let absentJustifiedCount = 0
  const businessDayToday = isBusinessDay(today)

  for (const row of attendanceTodayRes.data) {
    const attendanceRow: AttendanceRow | null =
      row.entrada1 || row.justified
        ? {
            employee_id: row.employee_id,
            work_date: today,
            entrada1: row.entrada1,
            saida_almoco: row.saida_almoco,
            retorno_almoco: row.retorno_almoco,
            saida2: row.saida2,
            justified: !!row.justified,
            occurrence_note: row.occurrence_note,
          }
        : null
    const status = attendanceStatus(attendanceRow, today)
    if (status === 'Presente' || status === 'Atraso') presentCount++
    if (status === 'Atraso') lateCount++
    if (status === 'Falta') absentUnjustifiedCount++
    if (status === 'Falta Justificada') absentJustifiedCount++
  }

  const expectedCount = businessDayToday ? totalEmployees : 0

  const recentRes = await retoolDb.query<{
    employee_id: number
    name: string
    entrada1: string | null
    saida_almoco: string | null
    retorno_almoco: string | null
    saida2: string | null
    justified: boolean | null
    occurrence_note: string | null
  }>(
    `SELECT e.id AS employee_id, e.name, a.entrada1, a.saida_almoco, a.retorno_almoco, a.saida2, a.justified, a.occurrence_note
     FROM employees e
     LEFT JOIN attendance_records a ON a.employee_id = e.id AND a.work_date = $1
     WHERE e.status = 'Ativo'
     ORDER BY a.entrada1 DESC NULLS LAST, e.name ASC
     LIMIT 6`,
    [latestDate]
  )

  const recentPunches = recentRes.data.map((row) => {
    const attendanceRow: AttendanceRow | null =
      row.entrada1 || row.justified
        ? {
            employee_id: row.employee_id,
            work_date: latestDate,
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
      entrada1: row.entrada1,
      saidaAlmoco: row.saida_almoco,
      retornoAlmoco: row.retorno_almoco,
      saida2: row.saida2,
      status: attendanceStatus(attendanceRow, latestDate),
      date: latestDate,
    }
  })

  return {
    totalEmployees,
    presenceToday: {
      presentCount,
      expectedCount,
      pct: expectedCount > 0 ? Math.round((presentCount / expectedCount) * 1000) / 10 : null,
      isBusinessDay: businessDayToday,
      date: today,
    },
    occurrencesToday: {
      lateCount,
      absentUnjustifiedCount,
      absentJustifiedCount,
      total: lateCount + absentUnjustifiedCount + absentJustifiedCount,
    },
    estimatedPayroll: {
      total: Math.round(totalPayroll * 100) / 100,
      average: totalEmployees > 0 ? Math.round((totalPayroll / totalEmployees) * 100) / 100 : 0,
    },
    departmentBreakdown,
    recentPunches,
  }
}
