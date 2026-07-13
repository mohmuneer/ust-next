'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from './user-avatar'
import { chatService } from '@/services/chat.service'
import { Search, X, Users, Check } from 'lucide-react'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: number
  onGroupCreated: () => void
}

export function CreateGroupModal({ isOpen, onClose, currentUserId, onGroupCreated }: CreateGroupModalProps) {
  const [step, setStep] = useState<'info' | 'members'>('info')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<{ id: number; full_name: string; file_path?: string; role?: string }[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    const results = await chatService.searchUsers(q, currentUserId)
    setSearchResults(results.filter((r: any) => !selectedMembers.find(m => m.id === r.id)))
  }

  const toggleMember = (user: any) => {
    if (selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers(prev => prev.filter(m => m.id !== user.id))
    } else {
      setSelectedMembers(prev => [...prev, { id: user.id, full_name: user.full_name, file_path: user.file_path, role: user.role }])
    }
  }

  const handleCreate = async () => {
    if (!name.trim() || selectedMembers.length === 0) return
    setIsCreating(true)
    const group = await chatService.createGroup({
      name: name.trim(),
      description: description.trim(),
      member_ids: selectedMembers.map(m => m.id),
      created_by: currentUserId,
    })
    if (group) {
      onGroupCreated()
      handleClose()
    }
    setIsCreating(false)
  }

  const handleClose = () => {
    setStep('info')
    setName('')
    setDescription('')
    setSearchQuery('')
    setSearchResults([])
    setSelectedMembers([])
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'info' ? 'إنشاء مجموعة جديدة' : 'إضافة أعضاء'}
      size="lg"
      footer={
        step === 'info' ? (
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={() => setStep('members')} disabled={!name.trim()}>التالي</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep('info')}>رجوع</Button>
            <Button onClick={handleCreate} isLoading={isCreating} disabled={selectedMembers.length === 0}>
              <Users className="w-4 h-4 ml-1" /> إنشاء المجموعة ({selectedMembers.length})
            </Button>
          </>
        )
      }
    >
      {step === 'info' ? (
        <div className="space-y-4">
          <Input
            label="اسم المجموعة"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="مثال: طلاب قسم الحاسب"
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">الوصف (اختياري)</label>
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف المجموعة..."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="ابحث عن مستخدمين..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>

          {/* Selected members */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(m => (
                <span key={m.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {m.full_name}
                  <button onClick={() => toggleMember(m)} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search results */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {searchResults.map((user: any) => {
              const isSelected = selectedMembers.some(m => m.id === user.id)
              return (
                <button
                  key={user.id}
                  onClick={() => toggleMember(user)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <UserAvatar src={user.file_path} name={user.full_name} size="sm" />
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-[11px] text-muted-foreground">{user.role === 'student' ? 'طالب' : user.role === 'employee' ? 'موظف' : 'إدارة'}</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </button>
              )
            })}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">لا توجد نتائج</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
