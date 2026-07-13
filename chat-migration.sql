-- ============================================================
-- CHAT SYSTEM MIGRATION v2
-- WhatsApp-style internal university messaging
-- ============================================================

-- 1. Messages table was already enhanced by previous migration

-- 2. Chat groups
CREATE TABLE IF NOT EXISTS chat_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by INTEGER,
  group_type VARCHAR(30) DEFAULT 'general',
  is_archived BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 256,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Group members
CREATE TABLE IF NOT EXISTS chat_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id INTEGER,
  role VARCHAR(20) DEFAULT 'member',
  is_muted BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cgm_group ON chat_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_cgm_user ON chat_group_members(user_id);

-- 4. Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER,
  user_id INTEGER,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mr_message ON message_reactions(message_id);

-- 5. User presence (online status)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id INTEGER PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_text VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  conversation_id INTEGER,
  group_id INTEGER,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Pinned messages
CREATE TABLE IF NOT EXISTS pinned_messages (
  id SERIAL PRIMARY KEY,
  message_id INTEGER,
  pinned_by INTEGER,
  conversation_id INTEGER,
  group_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Message read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id SERIAL PRIMARY KEY,
  message_id INTEGER,
  user_id INTEGER,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mrr_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_mrr_user ON message_read_receipts(user_id);
