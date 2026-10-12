interface EqualizerProps {
  className?: string
}

// Decorative animated bars shown while audio is actually playing.
export default function Equalizer({ className = 'text-accent' }: EqualizerProps) {
  return (
    <span className={`flex h-3 shrink-0 items-end gap-[3px] ${className}`} aria-hidden="true">
      <span className="eq-bar h-2.5" style={{ animationDelay: '0s' }} />
      <span className="eq-bar h-3" style={{ animationDelay: '0.22s' }} />
      <span className="eq-bar h-2" style={{ animationDelay: '0.44s' }} />
      <span className="eq-bar h-2.5" style={{ animationDelay: '0.12s' }} />
    </span>
  )
}
