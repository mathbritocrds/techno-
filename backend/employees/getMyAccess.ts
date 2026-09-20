export type MyAccessEmployee = {
  id: number
  name: string
  email: string | null
  is_admin: boolean
  workplace_lat: string | null
  workplace_lng: string | null
  workplace_radius_m: string
}

export type MyAccessResult = {
  /** True when the signed-in user should see the full admin experience. */
  isAdmin: boolean
  /** Matching employee record, or null if this user's email isn't linked to one yet. */
  employee: MyAccessEmployee | null
  /**
   * True when no employee in the system is marked as admin yet, so this session is being
   * granted temporary admin access to bootstrap the setup (link an email, promote an admin).
   */
  bootstrap: boolean
}

export default async function getMyAccess(req: { user: { email: string } }): Promise<MyAccessResult> {
  const email = req.user.email?.toLowerCase().trim()

  if (email) {
    const result = await retoolDb.query<MyAccessEmployee>(
      `SELECT id, name, email, is_admin, workplace_lat, workplace_lng, workplace_radius_m
       FROM employees WHERE LOWER(email) = $1`,
      [email]
    )
    const employee = result.data[0]
    if (employee) {
      return { isAdmin: employee.is_admin, employee, bootstrap: false }
    }
  }

  const adminCount = await retoolDb.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM employees WHERE is_admin = true`
  )
  const hasAnyAdmin = Number(adminCount.data[0]?.count ?? '0') > 0

  if (!hasAnyAdmin) {
    return { isAdmin: true, employee: null, bootstrap: true }
  }

  return { isAdmin: false, employee: null, bootstrap: false }
}
