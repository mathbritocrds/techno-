type Params = {
  employeeId: number
  date: string
  justified: boolean
  note?: string
}

export default async function setAttendanceJustification(req: { params: Params }) {
  const { employeeId, date, justified, note } = req.params
  if (!employeeId || !date) throw new Error('employeeId e date são obrigatórios')

  await retoolDb.query(
    `INSERT INTO attendance_records (employee_id, work_date, justified, occurrence_note)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (employee_id, work_date)
     DO UPDATE SET justified = $5, occurrence_note = $6`,
    [employeeId, date, justified, note ?? (justified ? 'Falta justificada' : null), justified, note ?? (justified ? 'Falta justificada' : null)]
  )

  return { success: true }
}
