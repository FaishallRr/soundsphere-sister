import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 bg-card/80 px-6 py-14 text-center backdrop-blur-sm"
      role="alert"
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger ring-1 ring-danger/30"
        aria-hidden="true"
      >
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-ink">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="gradient-cta mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-app shadow-[0_0_20px_rgba(167,139,250,0.4)] transition-transform hover:scale-105"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  )
}
