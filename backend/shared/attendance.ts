// Shared attendance domain logic: expected schedule, punctuality and worked-hours calculations.

export type PunchType = 'Entrada 1' | 'Saída Almoço' | 'Retorno Almoço' | 'Saída 2'

export const PUNCH_COLUMN_BY_TYPE: Record<PunchType, string> = {
  'Entrada 1': 'entrada1',
  'Saída Almoço': 'saida_almoco',
  'Retorno Almoço': 'retorno_almoco',
  'Saída 2': 'saida2',
}

/** Great-circle distance between two lat/lng points, in meters. */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const EXPECTED_ENTRY = { hour: 8, minute: 0 }
export const LATE_TOLERANCE_MINUTES = 10

export type AttendanceRow = {
  employee_id: number
  work_date: string
  entrada1: string | null
  saida_almoco: string | null
  retorno_almoco: string | null
  saida2: string | null
  justified: boolean
  occurrence_note: string | null
}

export type AttendanceStatus = 'Presente' | 'Atraso' | 'Falta' | 'Falta Justificada' | 'Sem Registro'

/** Converts a "HH:MM:SS" (or null) string to minutes since midnight. */
function toMinutes(time: string | null): number | null {
  if (!time) return null
  const parts = time.split(':')
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/** Business day check (Mon-Fri) for a "YYYY-MM-DD" date string, evaluated in UTC. */
export function isBusinessDay(dateStr: string): boolean {
  const d = new Date(`${dateStr}T00:00:00Z`)
  const dow = d.getUTCDay()
  return dow !== 0 && dow !== 6
}

/** Minutes late relative to the expected entry time. 0 or negative means on time. */
export function lateMinutes(entrada1: string | null): number {
  const minutes = toMinutes(entrada1)
  if (minutes === null) return 0
  const expected = EXPECTED_ENTRY.hour * 60 + EXPECTED_ENTRY.minute
  return minutes - expected
}

/** Hours worked in "Xh Ym" format, accounting for the lunch break. Returns null if incomplete. */
export function hoursWorkedLabel(row: Pick<AttendanceRow, 'entrada1' | 'saida_almoco' | 'retorno_almoco' | 'saida2'>): string | null {
  const entrada1 = toMinutes(row.entrada1)
  const saidaAlmoco = toMinutes(row.saida_almoco)
  const retornoAlmoco = toMinutes(row.retorno_almoco)
  const saida2 = toMinutes(row.saida2)
  if (entrada1 === null || saidaAlmoco === null || retornoAlmoco === null || saida2 === null) return null
  const totalMinutes = (saida2 - entrada1) - (retornoAlmoco - saidaAlmoco)
  if (totalMinutes < 0) return null
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

/** Worked minutes (net of lunch break), or null if the day is incomplete. */
export function workedMinutes(row: Pick<AttendanceRow, 'entrada1' | 'saida_almoco' | 'retorno_almoco' | 'saida2'>): number | null {
  const entrada1 = toMinutes(row.entrada1)
  const saidaAlmoco = toMinutes(row.saida_almoco)
  const retornoAlmoco = toMinutes(row.retorno_almoco)
  const saida2 = toMinutes(row.saida2)
  if (entrada1 === null || saidaAlmoco === null || retornoAlmoco === null || saida2 === null) return null
  const totalMinutes = (saida2 - entrada1) - (retornoAlmoco - saidaAlmoco)
  return totalMinutes < 0 ? null : totalMinutes
}

/** Derives the human status for an attendance row (or a missing record on a given date). */
export function attendanceStatus(row: AttendanceRow | null, dateStr: string): AttendanceStatus {
  if (!row || !row.entrada1) {
    if (row?.justified) return 'Falta Justificada'
    if (!isBusinessDay(dateStr)) return 'Sem Registro'
    return 'Falta'
  }
  const late = lateMinutes(row.entrada1)
  if (late > LATE_TOLERANCE_MINUTES) return 'Atraso'
  return 'Presente'
}
