import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  lines?: number
  variant?: 'text' | 'card' | 'circle' | 'rect'
  animate?: boolean
}

export function Skeleton({ className, lines = 1, variant = 'text', animate = true }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('bg-white rounded-2xl border border-gray-100 p-5 space-y-3', animate && 'animate-pulse', className)}>
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    )
  }
  if (variant === 'circle') {
    return <div className={cn('rounded-full bg-gray-200', animate && 'animate-pulse', className)} />
  }
  if (variant === 'rect') {
    return <div className={cn('rounded-xl bg-gray-200', animate && 'animate-pulse', className)} />
  }
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('h-3 bg-gray-200 rounded', animate && 'animate-pulse', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-gray-200 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1" />
            <div className="h-2 bg-gray-100 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
      {/* Quick links */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 text-center animate-pulse">
            <div className="w-9 h-9 rounded-lg bg-gray-200 mx-auto mb-1.5" />
            <div className="h-2 bg-gray-100 rounded w-3/4 mx-auto" />
          </div>
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-2 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
