'use client'

import { getImageUrl } from '@/lib/utils'

interface UserAvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
  showStatus?: boolean
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function UserAvatar({ src, name, size = 'md', isOnline, showStatus = true, className = '' }: UserAvatarProps) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  const colors = [
    'bg-primary/20 text-primary',
    'bg-success/20 text-success',
    'bg-warning/20 text-warning',
    'bg-danger/20 text-danger',
    'bg-info/20 text-info',
    'bg-secondary/20 text-secondary',
  ]
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={getImageUrl(src)}
          alt={name}
          className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-background`}
        />
      ) : (
        <div className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold ring-2 ring-background ${colors[colorIndex]}`}>
          {initials}
        </div>
      )}
      {showStatus && isOnline !== undefined && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${isOnline ? 'bg-success' : 'bg-muted-foreground/40'}`} />
      )}
    </div>
  )
}
