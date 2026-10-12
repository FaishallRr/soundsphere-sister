import type { LucideIcon } from 'lucide-react'
import { Music2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message: string
  icon?: LucideIcon
  action?: ReactNode
}

export default function EmptyState({ title, message, icon: Icon = Music2, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-card/80 px-6 py-14 text-center backdrop-blur-sm">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent-2/15 text-accent shadow-[0_0_28px_rgba(167,139,250,0.28)] ring-1 ring-accent/30"
        aria-hidden="true"
      >
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {action}
    </div>
  )
}
