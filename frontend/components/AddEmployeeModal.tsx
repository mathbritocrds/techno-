import { useState, useEffect, type FormEvent } from 'react'
import { MapPin, LoaderCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../lib/shadcn/dialog'
import { useCreateEmployee, useUpdateEmployee } from '../hooks/backend/employees'
import { emitDataChanged } from '../utils/events'
import { toast } from '../lib/shadcn/sonner'

export type EditableEmployee = {
  id: number
  name: string
  role: string
  department: string
  base_salary: string
  weekly_hours: string
  email?: string | null
  is_admin?: boolean
  workplace_lat?: string | null
  workplace_lng?: string | null
  workplace_radius_m?: number | string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: EditableEmployee | null
}

const DEPARTMENTS = ['Tecnologia', 'Recursos Humanos', 'Financeiro', 'Vendas', 'Operações']

export function AddEmployeeModal({ open, onOpenChange, employee }: Props) {
  const isEditing = !!employee
  const { trigger: createEmployee, loading: creating } = useCreateEmployee()
  const { trigger: updateEmployee, loading: updating } = useUpdateEmployee()
  const loading = creating || updating

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState(DEPARTMENTS[0]!)
  const [salary, setSalary] = useState('')
  const [weeklyHours, setWeeklyHours] = useState('44h Semanais')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [workplaceLat, setWorkplaceLat] = useState('')
  const [workplaceLng, setWorkplaceLng] = useState('')
  const [workplaceRadius, setWorkplaceRadius] = useState('200')
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (open) {
      setName(employee?.name ?? '')
      setRole(employee?.role ?? '')
      setDepartment(employee?.department ?? DEPARTMENTS[0]!)
      setSalary(employee?.base_salary ?? '')
      setWeeklyHours(employee?.weekly_hours ?? '44h Semanais')
      setEmail(employee?.email ?? '')
      setIsAdmin(employee?.is_admin ?? false)
      setWorkplaceLat(employee?.workplace_lat != null ? String(employee.workplace_lat) : '')
      setWorkplaceLng(employee?.workplace_lng != null ? String(employee.workplace_lng) : '')
      setWorkplaceRadius(employee?.workplace_radius_m != null ? String(employee.workplace_radius_m) : '200')
    }
  }, [open, employee])

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      toast.error('Este dispositivo não suporta o serviço de localização.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setWorkplaceLat(String(position.coords.latitude))
        setWorkplaceLng(String(position.coords.longitude))
        setLocating(false)
        toast.success('Localização atual capturada!')
      },
      () => {
        setLocating(false)
        toast.error('Não foi possível obter a localização. Verifique as permissões do navegador.')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const baseSalary = Number(salary)
    const payload = {
      name,
      role,
      department,
      baseSalary,
      weeklyHours,
      email: email.trim() || null,
      isAdmin,
      workplaceLat: workplaceLat.trim() ? Number(workplaceLat) : null,
      workplaceLng: workplaceLng.trim() ? Number(workplaceLng) : null,
      workplaceRadiusM: workplaceRadius.trim() ? Number(workplaceRadius) : undefined,
    }
    try {
      if (isEditing && employee) {
        await updateEmployee({ id: employee.id, ...payload }).result
        toast.success('Colaborador atualizado com sucesso!')
      } else {
        await createEmployee(payload).result
        toast.success('Colaborador cadastrado com sucesso!')
      }
      emitDataChanged('employees')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar colaborador')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
            {isEditing ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lucas Gabriel Silva"
              className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Cargo / Função</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Desenvolvedor"
                className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Setor</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
              >
                {DEPARTMENTS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Salário Base (R$)</label>
              <input
                type="number"
                required
                min={1}
                step="0.01"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="5000"
                className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Jornada</label>
              <input
                type="text"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase pt-2">
              Acesso ao Sistema
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                E-mail (deve ser igual ao da conta Retool)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="accent-emerald-500"
              />
              Administrador (acesso total ao sistema)
            </label>
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Local de Trabalho (para bater ponto)
              </p>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 disabled:opacity-60"
              >
                {locating ? <LoaderCircle className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                Usar localização atual
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={workplaceLat}
                  onChange={(e) => setWorkplaceLat(e.target.value)}
                  placeholder="-23.5505"
                  className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={workplaceLng}
                  onChange={(e) => setWorkplaceLng(e.target.value)}
                  placeholder="-46.6333"
                  className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Raio (m)</label>
                <input
                  type="number"
                  min={10}
                  step="1"
                  value={workplaceRadius}
                  onChange={(e) => setWorkplaceRadius(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-lg transition-all"
            >
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
