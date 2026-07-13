ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_message_id VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_message_id) WHERE client_message_id IS NOT NULL;
