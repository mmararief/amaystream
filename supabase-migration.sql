-- Supabase Migration SQL
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Table: matches
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_created 
ON chat_messages(match_id, created_at DESC);

-- Table: match_viewers (for tracking viewer count)
CREATE TABLE IF NOT EXISTS match_viewers (
  match_id TEXT PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  viewer_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment viewer count
CREATE OR REPLACE FUNCTION increment_viewer_count(p_match_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO match_viewers (match_id, viewer_count, updated_at)
  VALUES (p_match_id, 1, NOW())
  ON CONFLICT (match_id)
  DO UPDATE SET
    viewer_count = match_viewers.viewer_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to decrement viewer count
CREATE OR REPLACE FUNCTION decrement_viewer_count(p_match_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE match_viewers
  SET viewer_count = GREATEST(viewer_count - 1, 0),
      updated_at = NOW()
  WHERE match_id = p_match_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_viewers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all on matches" ON matches FOR ALL USING (true);
CREATE POLICY "Allow all on chat_messages" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all on match_viewers" ON match_viewers FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON matches TO anon, authenticated;
GRANT ALL ON chat_messages TO anon, authenticated;
GRANT ALL ON match_viewers TO anon, authenticated;

