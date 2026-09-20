import { createContext, useContext, useState, type ReactNode } from 'react'
import { AddEmployeeModal, type EditableEmployee } from '../components/AddEmployeeModal'
import { PunchModal } from '../components/PunchModal'

type ModalsContextValue = {
  openAddEmployee: (employee?: EditableEmployee) => void
  openPunch: () => void
}

const ModalsContext = createContext<ModalsContextValue | null>(null)

export function ModalsProvider({ children }: { children: ReactNode }) {
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EditableEmployee | null>(null)
  const [punchModalOpen, setPunchModalOpen] = useState(false)

  function openAddEmployee(employee?: EditableEmployee) {
    setEditingEmployee(employee ?? null)
    setEmployeeModalOpen(true)
  }

  function openPunch() {
    setPunchModalOpen(true)
  }

  return (
    <ModalsContext.Provider value={{ openAddEmployee, openPunch }}>
      {children}
      <AddEmployeeModal
        open={employeeModalOpen}
        onOpenChange={setEmployeeModalOpen}
        employee={editingEmployee}
      />
      <PunchModal open={punchModalOpen} onOpenChange={setPunchModalOpen} />
    </ModalsContext.Provider>
  )
}

export function useModals(): ModalsContextValue {
  const ctx = useContext(ModalsContext)
  if (!ctx) throw new Error('useModals must be used within ModalsProvider')
  return ctx
}
