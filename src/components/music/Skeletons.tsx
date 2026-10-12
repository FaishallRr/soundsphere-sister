import { Music2 } from 'lucide-react'

interface TrackCardSkeletonProps {
  count?: number
}

const shimmerClass = 'animate-shimmer bg-gradient-to-r from-card-hover via-card to-card-hover bg-[length:200%_100%]'

export function TrackCardSkeleton({ count = 5 }: TrackCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`track-skeleton-${index}`}
          className="rounded-2xl border border-line bg-card p-3"
          aria-hidden="true"
        >
          <div className={`aspect-square w-full rounded-xl ${shimmerClass}`} />
          <div className={`mt-3 h-3 w-3/4 rounded ${shimmerClass}`} />
          <div className={`mt-2 h-3 w-1/2 rounded ${shimmerClass}`} />
        </div>
      ))}
    </>
  )
}

export function TrackRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`row-skeleton-${index}`}
          className="flex items-center gap-3 border-b border-line px-3 py-3 last:border-b-0"
        >
          <div className={`h-10 w-10 shrink-0 rounded-lg ${shimmerClass}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-3 w-1/3 rounded ${shimmerClass}`} />
            <div className={`h-3 w-1/4 rounded ${shimmerClass}`} />
          </div>
          <Music2 className="h-4 w-4 shrink-0 text-card-hover" aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}
