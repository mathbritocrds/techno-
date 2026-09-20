export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/** Formats a "HH:MM:SS" (or null) time string as "HH:MM". */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '—'
  return time.slice(0, 5)
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

export type StatusStyle = {
  label: string
  className: string
}

/** Shared color treatment for attendance status badges across pages. */
export function attendanceStatusStyle(status: string): StatusStyle {
  switch (status) {
    case 'Presente':
      return {
        label: status,
        className:
          'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
      }
    case 'Atraso':
      return {
        label: status,
        className:
          'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
      }
    case 'Falta':
      return {
        label: status,
        className: 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
      }
    case 'Falta Justificada':
      return {
        label: status,
        className:
          'bg-amber-100/70 text-amber-700 border border-amber-300/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
      }
    default:
      return { label: 'Sem Registro', className: 'bg-muted text-muted-foreground border border-border' }
  }
}

export function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split('-')
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  const idx = Number(month) - 1
  return `${months[idx] ?? month} de ${year}`
}
