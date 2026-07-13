'use client'

import { useState, useMemo } from 'react'
import { UserAvatar } from './user-avatar'
import type { Conversation } from '@/types/chat'
import { Search, Plus, Users, GraduationCap, Briefcase, Building2, Filter, X, Pin, VolumeOff } from 'lucide-react'

interface ConversationSidebarProps {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (id: number, type: 'direct' | 'group') => void
  onNewChat: () => void
  onCreateGroup: () => void
  currentUserId: number
}

type FilterType = 'all' | 'unread' | 'groups' | 'students' | 'employees'

export function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  onCreateGroup,
  currentUserId,
}: ConversationSidebarProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = conversations
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.full_name.toLowerCase().includes(q) || c.last_message?.toLowerCase().includes(q))
    }
    switch (activeFilter) {
      case 'unread': result = result.filter(c => c.unread_count > 0); break
      case 'groups': result = result.filter(c => c.type === 'group'); break
      case 'students': result = result.filter(c => c.type === 'direct' && c.role === 'student'); break
      case 'employees': result = result.filter(c => c.type === 'direct' && (c.role === 'employee' || c.job_title)); break
    }
    return result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [conversations, search, activeFilter])

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'الكل', icon: <Filter className="w-3.5 h-3.5" /> },
    { key: 'unread', label: 'غير المقروءة', icon: <span className="w-2 h-2 rounded-full bg-primary" /> },
    { key: 'groups', label: 'المجموعات', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'students', label: 'الطلاب', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { key: 'employees', label: 'الموظفين', icon: <Briefcase className="w-3.5 h-3.5" /> },
  ]

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'أمس'
    if (diffDays < 7) return d.toLocaleDateString('ar', { weekday: 'short' })
    return d.toLocaleDateString('ar', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">المحادثات</h2>
          <div className="flex gap-1">
            <button onClick={onCreateGroup} className="p-2 rounded-xl hover:bg-muted transition-colors" title="مجموعة جديدة">
              <Users className="w-4.5 h-4.5 text-muted-foreground" />
            </button>
            <button onClick={onNewChat} className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors" title="محادثة جديدة">
              <Plus className="w-4.5 h-4.5 text-primary" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث في المحادثات..."
            className="w-full pr-9 pl-8 py-2 rounded-xl bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1 mt-2 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
            <Building2 className="w-10 h-10 mb-2 opacity-30" />
            <span>{search ? 'لا توجد نتائج' : 'لا توجد محادثات'}</span>
          </div>
        ) : (
          filtered.map(conv => (
            <button
              key={`${conv.type}-${conv.id}`}
              onClick={() => onSelect(conv.id, conv.type)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-right hover:bg-muted/50 transition-all border-b border-border/50 ${
                selectedId === conv.id ? 'bg-primary/10 border-r-2 border-r-primary' : ''
              }`}
            >
              <UserAvatar
                src={conv.file_path}
                name={conv.full_name}
                size="md"
                isOnline={conv.type === 'direct' ? conv.is_online : undefined}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {conv.type === 'group' && <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    <span className={`text-sm font-semibold truncate ${conv.unread_count > 0 ? 'text-foreground' : 'text-foreground/90'}`}>
                      {conv.full_name}
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 mr-2">
                    {formatTime(conv.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <p className={`text-xs truncate max-w-[180px] ${conv.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.last_message || 'لا توجد رسائل'}
                  </p>
                  <div className="flex items-center gap-1 mr-2">
                    {conv.is_pinned && <Pin className="w-3 h-3 text-primary/60" />}
                    {conv.is_muted && <VolumeOff className="w-3 h-3 text-muted-foreground" />}
                    {conv.unread_count > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="px-3 py-2 border-t border-border text-center">
        <span className="text-[11px] text-muted-foreground">
          {conversations.length} محادثة · {conversations.reduce((a, c) => a + c.unread_count, 0)} غير مقروءة
        </span>
      </div>
    </div>
  )
}
