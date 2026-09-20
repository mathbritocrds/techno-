import { useState } from 'react'
import { Fingerprint, MapPin, LoaderCircle, CheckCircle2 } from 'lucide-react'
import { useRecordSelfPunch } from '../hooks/backend/attendance'
import { useAccess } from '../context/AccessContext'
import { toast } from '../lib/shadcn/sonner'

const PUNCH_TYPES = [
  { value: 'Entrada 1', label: 'Entrada' },
  { value: 'Saída Almoço', label: 'Saída para Almoço' },
  { value: 'Retorno Almoço', label: 'Retorno do Almoço' },
  { value: 'Saída 2', label: 'Saída (Fim de Expediente)' },
] as const

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este dispositivo não suporta o serviço de localização.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  })
}

export default function MyPunch() {
  const { employee } = useAccess()
  const { trigger: recordSelfPunch } = useRecordSelfPunch()
  const [pendingType, setPendingType] = useState<string | null>(null)
  const [lastConfirmed, setLastConfirmed] = useState<string | null>(null)

  async function handlePunch(punchType: string) {
    setPendingType(punchType)
    try {
      const position = await getCurrentPosition()
      await recordSelfPunch({
        punchType,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }).result
      toast.success('Ponto registrado com sucesso!')
      setLastConfirmed(punchType)
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        toast.error('Permita o acesso à localização para bater o ponto.')
      } else {
        toast.error(err instanceof Error ? err.message : 'Erro ao registrar ponto')
      }
    } finally {
      setPendingType(null)
    }
  }

  return (
    <section className="h-full flex items-center justify-center">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center space-y-6">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <Fingerprint className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">{employee?.name ?? 'Colaborador'}</h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
            <MapPin className="w-3 h-3" />
            É necessário estar no local de trabalho para confirmar o ponto
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {PUNCH_TYPES.map((pt) => {
            const isPending = pendingType === pt.value
            const wasLast = lastConfirmed === pt.value
            return (
              <button
                key={pt.value}
                type="button"
                disabled={pendingType !== null}
                onClick={() => handlePunch(pt.value)}
                className="flex items-center justify-between px-4 py-3 bg-background hover:bg-accent disabled:opacity-60 border border-border rounded-lg text-sm text-foreground font-medium transition-all"
              >
                <span>{pt.label}</span>
                {isPending ? (
                  <LoaderCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                ) : wasLast ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
