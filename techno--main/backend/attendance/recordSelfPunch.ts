import { PUNCH_COLUMN_BY_TYPE, haversineDistanceMeters, type PunchType } from '../shared/attendance'

type Params = {
  punchType: PunchType
  /** Latitude/longitude from the browser's geolocation API, required to prove presence at work. */
  lat: number
  lng: number
}

type EmployeeLocation = {
  id: number
  workplace_lat: string | null
  workplace_lng: string | null
  workplace_radius_m: string
}

export default async function recordSelfPunch(req: { params: Params; user: { email: string } }) {
  const { punchType, lat, lng } = req.params
  const email = req.user.email?.toLowerCase().trim()

  if (!email) throw new Error('Usuário não autenticado')
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error('Localização inválida. Permita o acesso à localização e tente novamente.')
  }

  const column = PUNCH_COLUMN_BY_TYPE[punchType]
  if (!column) throw new Error('Tipo de marcação inválido')

  const employeeResult = await retoolDb.query<EmployeeLocation>(
    `SELECT id, workplace_lat, workplace_lng, workplace_radius_m FROM employees WHERE LOWER(email) = $1`,
    [email]
  )
  const employee = employeeResult.data[0]
  if (!employee) throw new Error('Nenhum colaborador vinculado a este usuário. Contate o RH.')

  if (employee.workplace_lat === null || employee.workplace_lng === null) {
    throw new Error('Local de trabalho não configurado para este colaborador. Contate o RH.')
  }

  const workplaceLat = Number(employee.workplace_lat)
  const workplaceLng = Number(employee.workplace_lng)
  const workplaceRadiusM = Number(employee.workplace_radius_m)

  const distanceMeters = haversineDistanceMeters(lat, lng, workplaceLat, workplaceLng)
  if (distanceMeters > workplaceRadiusM) {
    throw new Error(
      `Você está a ${Math.round(distanceMeters)}m do local de trabalho (limite: ${Math.round(
        workplaceRadiusM
      )}m). Aproxime-se para bater o ponto.`
    )
  }

  const workDate = new Date().toISOString().slice(0, 10)
  const punchTime = new Date().toISOString().slice(11, 19)

  await retoolDb.query(
    `INSERT INTO attendance_records (employee_id, work_date, ${column})
     VALUES ($1, $2, $3)
     ON CONFLICT (employee_id, work_date)
     DO UPDATE SET ${column} = $4`,
    [employee.id, workDate, punchTime, punchTime]
  )

  const result = await retoolDb.query(
    `SELECT employee_id, work_date, entrada1, saida_almoco, retorno_almoco, saida2, justified, occurrence_note
     FROM attendance_records WHERE employee_id = $1 AND work_date = $2`,
    [employee.id, workDate]
  )
  return result.data[0]
}
