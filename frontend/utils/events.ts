// Minimal pub/sub so pages can refetch their own data when another part of the app
// (e.g. a modal) mutates shared HR data, without needing a global state library.
import { useEffect } from 'react'

export type DataChangeScope = 'employees' | 'attendance' | 'roles' | 'payroll'

const EVENT_NAME = 'app:data-changed'

export function emitDataChanged(scope: DataChangeScope): void {
  window.dispatchEvent(new CustomEvent<{ scope: DataChangeScope }>(EVENT_NAME, { detail: { scope } }))
}

export function useOnDataChanged(scopes: DataChangeScope[], handler: () => void): void {
  useEffect(() => {
    function listener(event: Event) {
      const detail = (event as CustomEvent<{ scope: DataChangeScope }>).detail
      if (detail && scopes.includes(detail.scope)) handler()
    }
    window.addEventListener(EVENT_NAME, listener)
    return () => window.removeEventListener(EVENT_NAME, listener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handler, scopes.join(',')])
}
