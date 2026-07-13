'use client'
import { ErrorBoundary } from './error-boundary'
import { PageSkeleton } from './skeleton'

export function PageErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<PageSkeleton />}>
      {children}
    </ErrorBoundary>
  )
}
