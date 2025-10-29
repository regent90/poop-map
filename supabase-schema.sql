-- Supabase 數據庫表結構
-- 請在 Supabase SQL 編輯器中執行這些 SQL 語句

-- 1. 用戶表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 便便記錄表
CREATE TABLE IF NOT EXISTS poops (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  timestamp BIGINT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  photo TEXT,
  privacy VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'friends', 'public')),
  place_name VARCHAR(255),
  custom_location VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 好友關係表
CREATE TABLE IF NOT EXISTS friends (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  friend_email VARCHAR(255) NOT NULL,
  friend_name VARCHAR(255) NOT NULL,
  friend_picture TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  added_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_email)
);

-- 4. 好友請求表
CREATE TABLE IF NOT EXISTS friend_requests (
  id VARCHAR(255) PRIMARY KEY,
  from_user_id VARCHAR(255) NOT NULL,
  from_user_name VARCHAR(255) NOT NULL,
  from_user_email VARCHAR(255) NOT NULL,
  from_user_picture TEXT,
  to_user_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_poops_user_id ON poops(user_id);
CREATE INDEX IF NOT EXISTS idx_poops_privacy ON poops(privacy);
CREATE INDEX IF NOT EXISTS idx_poops_timestamp ON poops(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_poops_user_privacy ON poops(user_id, privacy);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_user_status ON friends(user_id, status);

CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_email);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user_status ON friend_requests(to_user_email, status);

-- 啟用行級安全性 (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE poops ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 政策

-- 用戶表政策：用戶只能查看和修改自己的資料
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- 便便表政策
CREATE POLICY "Users can view own poops" ON poops
  FOR SELECT USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can view friends poops" ON poops
  FOR SELECT USING (
    privacy = 'public' OR 
    (privacy = 'friends' AND EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.user_id = poops.user_id 
      AND friends.friend_email = auth.jwt() ->> 'email' 
      AND friends.status = 'accepted'
    ))
  );

CREATE POLICY "Users can insert own poops" ON poops
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own poops" ON poops
  FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own poops" ON poops
  FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- 好友表政策
CREATE POLICY "Users can view own friends" ON friends
  FOR SELECT USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own friends" ON friends
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own friends" ON friends
  FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete own friends" ON friends
  FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- 好友請求表政策
CREATE POLICY "Users can view requests sent to them" ON friend_requests
  FOR SELECT USING (to_user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can view requests they sent" ON friend_requests
  FOR SELECT USING (from_user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can send friend requests" ON friend_requests
  FOR INSERT WITH CHECK (from_user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update requests sent to them" ON friend_requests
  FOR UPDATE USING (to_user_email = auth.jwt() ->> 'email');

-- 創建觸發器以自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poops_updated_at BEFORE UPDATE ON poops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON friend_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 創建實時訂閱的發布
-- 這些發布允許客戶端訂閱表的變化
ALTER PUBLICATION supabase_realtime ADD TABLE poops;
ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE friends;