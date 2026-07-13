'use client'

import { UserAvatar } from './user-avatar'
import type { Conversation, ChatMessage, GroupMember } from '@/types/chat'
import { X, Mail, Phone, Building2, Briefcase, GraduationCap, FileText, Image, Video, Link, Users } from 'lucide-react'

interface InfoPanelProps {
  conversation: Conversation
  messages: ChatMessage[]
  groupMembers?: GroupMember[]
  onClose: () => void
}

export function InfoPanel({ conversation, messages, groupMembers, onClose }: InfoPanelProps) {
  const sharedFiles = messages.filter(m => m.attachment_url && m.message_type === 'file')
  const sharedImages = messages.filter(m => m.message_type === 'image' || (m.attachment_url && m.attachment_type?.startsWith('image')))
  const sharedLinks = messages.filter(m => m.message_text?.match(/^https?:\/\//))

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="w-80 border-r border-border bg-card h-full overflow-y-auto flex-shrink-0 hidden xl:flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-bold text-foreground">
          {conversation.type === 'group' ? 'معلومات المجموعة' : 'معلومات الاتصال'}
        </h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-border">
        <UserAvatar
          src={conversation.file_path}
          name={conversation.full_name}
          size="xl"
          isOnline={conversation.type === 'direct' ? conversation.is_online : undefined}
          showStatus={conversation.type === 'direct'}
        />
        <h3 className="mt-3 text-lg font-bold text-foreground text-center">{conversation.full_name}</h3>
        {conversation.type === 'direct' && (
          <span className="text-sm text-muted-foreground mt-0.5">
            {conversation.is_online ? 'متصل الآن' : 'غير متصل'}
          </span>
        )}
        {conversation.type === 'group' && (
          <span className="text-sm text-muted-foreground mt-0.5">
            {conversation.member_count || groupMembers?.length || 0} عضو
          </span>
        )}
      </div>

      {/* Details */}
      {conversation.type === 'direct' && (
        <div className="px-4 py-3 border-b border-border space-y-3">
          {conversation.college_name && (
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">الكلية</p>
                <p className="text-sm font-medium text-foreground">{conversation.college_name}</p>
              </div>
            </div>
          )}
          {conversation.department_name && (
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">القسم</p>
                <p className="text-sm font-medium text-foreground">{conversation.department_name}</p>
              </div>
            </div>
          )}
          {conversation.job_title && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">المسمى الوظيفي</p>
                <p className="text-sm font-medium text-foreground">{conversation.job_title}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Group Members */}
      {conversation.type === 'group' && groupMembers && groupMembers.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-xs font-bold text-muted-foreground mb-2">أعضاء المجموعة ({groupMembers.length})</h4>
          <div className="space-y-2">
            {groupMembers.map(member => (
              <div key={member.id} className="flex items-center gap-2">
                <UserAvatar src={member.file_path} name={member.full_name || ''} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {member.role === 'admin' ? 'مدير' : member.role === 'moderator' ? 'مشرف' : 'عضو'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Media */}
      {sharedImages.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-2">
            <Image className="w-3.5 h-3.5" /> الصور ({sharedImages.length})
          </h4>
          <div className="grid grid-cols-3 gap-1">
            {sharedImages.slice(0, 9).map(img => (
              <div key={img.id} className="aspect-square rounded-lg bg-muted overflow-hidden">
                <img src={img.attachment_url || ''} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Files */}
      {sharedFiles.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-2">
            <FileText className="w-3.5 h-3.5" /> الملفات ({sharedFiles.length})
          </h4>
          <div className="space-y-1.5">
            {sharedFiles.slice(0, 5).map(file => (
              <div key={file.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.attachment_name}</p>
                  {file.attachment_size && (
                    <p className="text-[10px] text-muted-foreground">{formatFileSize(file.attachment_size)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3">
        <h4 className="text-xs font-bold text-muted-foreground mb-2">إحصائيات</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-lg font-bold text-primary">{messages.length}</p>
            <p className="text-[11px] text-muted-foreground">رسالة</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-lg font-bold text-primary">{sharedFiles.length + sharedImages.length}</p>
            <p className="text-[11px] text-muted-foreground">ملف مشترك</p>
          </div>
        </div>
      </div>
    </div>
  )
}
