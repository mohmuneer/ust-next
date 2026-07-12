import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 mb-6 text-white relative overflow-hidden',
        className
      )}
      style={{
        background: 'linear-gradient(to bottom right, var(--theme-sidebar-color, #1a1a2e), color-mix(in srgb, var(--theme-sidebar-color, #1a1a2e) 70%, #000))',
        color: 'var(--theme-sidebar-text, #ffffff)',
      }}
    >
      <div className="absolute -top-1/2 -right-1/4 w-72 h-72 bg-white/5 rounded-full" />
      <div className="absolute -bottom-1/3 -left-1/4 w-48 h-48 bg-white/5 rounded-full" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {description && <p className="text-sm mt-1" style={{ color: 'color-mix(in srgb, var(--theme-sidebar-text, #ffffff) 70%, transparent)' }}>{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
