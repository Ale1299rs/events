-- Roma Events Bot Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'it',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    name_it VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(500),
    address VARCHAR(500),
    zone VARCHAR(100),
    price VARCHAR(100),
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    url VARCHAR(1000),
    image_url VARCHAR(1000),
    source VARCHAR(100),
    source_id VARCHAR(255),
    category_id UUID REFERENCES categories(id),
    ai_tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source, source_id)
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notification_time VARCHAR(5) DEFAULT '09:00',
    zones TEXT[],
    max_price DECIMAL(10,2),
    notification_frequency VARCHAR(20) DEFAULT 'immediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sent notifications table (to avoid duplicates)
CREATE TABLE IF NOT EXISTS sent_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Insert default categories
INSERT INTO categories (name, name_it, emoji, description) VALUES
    ('music', 'Musica & Concerti', '🎵', 'Concerti, live music, festival musicali'),
    ('art', 'Arte & Mostre', '🎨', 'Mostre d''arte, gallerie, esposizioni'),
    ('sports', 'Sport', '⚽', 'Eventi sportivi, partite, competizioni'),
    ('food', 'Food & Wine', '🍝', 'Degustazioni, food festival, eventi enogastronomici'),
    ('nightlife', 'Nightlife', '🌙', 'Club, discoteche, feste, aperitivi'),
    ('family', 'Famiglia & Bambini', '👨‍👩‍👧‍👦', 'Eventi per famiglie e bambini'),
    ('theater', 'Teatro & Spettacoli', '🎭', 'Teatro, spettacoli, performance'),
    ('culture', 'Cultura & Conferenze', '📚', 'Conferenze, seminari, eventi culturali'),
    ('cinema', 'Cinema', '🎬', 'Proiezioni, festival del cinema'),
    ('markets', 'Mercati & Fiere', '🛍️', 'Mercatini, fiere, mercati vintage')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source, source_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_category ON user_subscriptions(category_id);
CREATE INDEX IF NOT EXISTS idx_sent_notifications_user_event ON sent_notifications(user_id, event_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
