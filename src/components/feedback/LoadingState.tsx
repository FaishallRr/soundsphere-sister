import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  label?: string
  className?: string
}

export default function LoadingState({ label = 'Loading…', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center gap-2 py-16 text-muted ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
