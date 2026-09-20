import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useGetMyAccess } from '../hooks/backend/employees'

export type MyAccessEmployee = {
  id: number
  name: string
  email: string | null
  is_admin: boolean
  workplace_lat: string | null
  workplace_lng: string | null
  workplace_radius_m: string
}

type AccessContextValue = {
  loading: boolean
  isAdmin: boolean
  employee: MyAccessEmployee | null
  bootstrap: boolean
  refresh: () => void
}

const AccessContext = createContext<AccessContextValue | null>(null)

export function AccessProvider({ children }: { children: ReactNode }) {
  const { data, loading, trigger } = useGetMyAccess()

  useEffect(() => {
    trigger(undefined, { skipCache: true })
  }, [trigger])

  const value: AccessContextValue = {
    loading: loading || data === null,
    isAdmin: data?.isAdmin ?? false,
    employee: data?.employee ?? null,
    bootstrap: data?.bootstrap ?? false,
    refresh: () => trigger(undefined, { skipCache: true }),
  }

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export function useAccess(): AccessContextValue {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}
