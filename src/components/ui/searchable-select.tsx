'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Search, ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string | number
  label: string
}

interface SearchableSelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  value: string | number
  onChange: (value: string | number) => void
  className?: string
}

export function SearchableSelect({
  label,
  error,
  options,
  placeholder,
  searchPlaceholder = 'بحث...',
  value,
  onChange,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => String(o.value) === String(value))

  const filtered = useMemo(() => {
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, search])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value)
    setSearch('')
    setIsOpen(false)
  }

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={0}
        className={cn(
          'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm cursor-pointer items-center gap-2 transition-colors',
          'focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary',
          error && 'border-danger focus-within:ring-danger/50',
          className
        )}
        onClick={() => { setIsOpen(!isOpen); setSearch('') }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); setSearch('') } }}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn('flex-1 truncate', String(value) === '0' && 'text-muted-foreground')}>
          {selected ? selected.label : (placeholder || searchPlaceholder || '')}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-input bg-background shadow-lg overflow-hidden">
          <div className="p-2 border-b border-input">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false)
                if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0])
              }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                لا توجد نتائج
              </div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={String(opt.value) === String(value)}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-primary/10 hover:text-primary',
                    String(opt.value) === String(value) && 'bg-primary/10 text-primary font-medium'
                  )}
                  onClick={() => handleSelect(opt)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(opt) }}
                  tabIndex={0}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
