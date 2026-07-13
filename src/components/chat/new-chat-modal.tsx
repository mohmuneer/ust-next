'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { UserAvatar } from './user-avatar'
import { chatService } from '@/services/chat.service'
import { Search, MessageSquare } from 'lucide-react'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: number
  onSelectUser: (userId: number, name?: string, role?: string, avatar?: string) => void
}

export function NewChatModal({ isOpen, onClose, currentUserId, onSelectUser }: NewChatModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    const data = await chatService.searchUsers(q, currentUserId)
    setResults(data)
    setLoading(false)
  }

  const handleSelect = (user: any) => {
    onSelectUser(user.id, user.full_name, user.role, user.file_path)
    setQuery('')
    setResults([])
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="محادثة جديدة"
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="ابحث عن طالب أو موظف..."
            className="w-full pr-9 pl-4 py-3 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <UserAvatar src={user.file_path} name={user.full_name} size="md" />
                  <div className="flex-1 text-right">
                    <p className="text-sm font-semibold text-foreground">{user.full_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {user.role === 'student' ? 'طالب' : user.role === 'employee' ? 'موظف' : 'إدارة'}
                      {user.college_name ? ` · ${user.college_name}` : ''}
                      {user.job_title ? ` · ${user.job_title}` : ''}
                    </p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <p className="text-center text-sm text-muted-foreground py-8">لا توجد نتائج</p>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">ابحث عن شخص للبدء في محادثة</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
