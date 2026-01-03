-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Create user_data table
CREATE TABLE IF NOT EXISTS user_data (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users (device-based)
-- This allows each device to read/write its own data
CREATE POLICY "Users can manage their own data"
  ON user_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: If you want authenticated users only
-- CREATE POLICY "Authenticated users can manage their own data"
--   ON user_data
--   FOR ALL
--   USING (auth.uid()::text = user_id)
--   WITH CHECK (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- OPTIONAL: ANALYTICS TABLE
-- Track user activity for insights
-- ============================================

CREATE TABLE IF NOT EXISTS user_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'task_completed', 'session_finished', 'level_up', etc.
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at DESC);

ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analytics"
  ON user_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SAMPLE QUERIES (for testing)
-- ============================================

-- View all user data
-- SELECT * FROM user_data ORDER BY updated_at DESC;

-- View specific user's data
-- SELECT * FROM user_data WHERE user_id = 'your_user_id';

-- View analytics
-- SELECT event_type, COUNT(*) as count 
-- FROM user_analytics 
-- GROUP BY event_type 
-- ORDER BY count DESC;

-- Delete all data (for testing)
-- TRUNCATE user_data, user_analytics;

-- ============================================
-- NOTES
-- ============================================

/*
1. Run this SQL in Supabase Dashboard > SQL Editor
2. Click "Run" to create tables and policies
3. Data structure in JSONB column matches your app's data:
   {
     "points": 0,
     "streak": 0,
     "level": 1,
     "tasks": [],
     "productivity": [0,0,0,0,0,0,0],
     ... etc
   }
4. RLS is enabled for security
5. Each device gets a unique ID for data isolation
*/
