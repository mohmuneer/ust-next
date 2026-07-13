export interface ChatUser {
  id: number
  full_name: string
  email?: string
  file_path?: string | null
  role?: string
  college_name?: string
  department_name?: string
  job_title?: string
  is_online?: boolean
  last_seen?: string
  status_text?: string
}

export interface ChatMessage {
  id: number
  sender_id: number
  receiver_id?: number | null
  group_id?: number | null
  message_text: string
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system'
  attachment_url?: string | null
  attachment_name?: string | null
  attachment_type?: string | null
  attachment_size?: number | null
  reply_to_id?: number | null
  reply_to_text?: string | null
  reply_to_sender?: string | null
  is_read: number | boolean
  is_edited?: boolean
  is_deleted?: boolean
  is_pinned?: boolean
  is_starred?: boolean
  created_at: string
  updated_at?: string | null
  full_name?: string
  file_path?: string | null
  reactions?: MessageReaction[]
  read_receipts?: ReadReceipt[]
}

export interface MessageReaction {
  id: number
  message_id: number
  user_id: number
  emoji: string
  full_name?: string
  created_at: string
}

export interface ReadReceipt {
  user_id: number
  full_name?: string
  read_at: string
}

export interface Conversation {
  id: number
  type: 'direct' | 'group'
  full_name: string
  file_path?: string | null
  last_message: string
  last_message_type?: string
  created_at: string
  is_read: number | boolean
  unread_count: number
  is_online?: boolean
  is_pinned?: boolean
  is_muted?: boolean
  is_archived?: boolean
  role?: string
  college_name?: string
  department_name?: string
  job_title?: string
  member_count?: number
}

export interface ChatGroup {
  id: number
  name: string
  description?: string
  avatar_url?: string | null
  created_by: number
  group_type: string
  is_archived: boolean
  max_members: number
  member_count?: number
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: number
  group_id: number
  user_id: number
  role: 'admin' | 'moderator' | 'member'
  is_muted: boolean
  is_pinned: boolean
  last_read_at: string
  joined_at: string
  full_name?: string
  file_path?: string | null
}

export interface UserPresence {
  user_id: number
  is_online: boolean
  last_seen: string
  status_text?: string
}

export interface TypingIndicator {
  user_id: number
  conversation_id?: number
  group_id?: number
  started_at: string
  full_name?: string
}

export interface ChatSearchParams {
  q?: string
  user_id?: number
  type?: 'users' | 'messages' | 'groups'
}

export interface SendMessageParams {
  sender_id: number
  receiver_id?: number
  group_id?: number
  message_text: string
  message_type?: string
  reply_to_id?: number
  attachment_url?: string
  attachment_name?: string
  attachment_type?: string
  attachment_size?: number
}
