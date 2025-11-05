-- Roma Events Bot Database Schema for Supabase
-- All tables use 'events_' prefix to avoid conflicts with other projects

-- STEP 1: Drop all existing tables to avoid type conflicts
DROP TABLE IF EXISTS events_sent_notifications CASCADE;
DROP TABLE IF EXISTS events_user_preferences CASCADE;
DROP TABLE IF EXISTS events_user_subscriptions CASCADE;
DROP TABLE IF EXISTS events_events CASCADE;
DROP TABLE IF EXISTS events_categories CASCADE;
DROP TABLE IF EXISTS events_users CASCADE;

-- Drop function if exists
DROP FUNCTION IF EXISTS events_update_updated_at_column() CASCADE;

-- STEP 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 3: Create tables in correct order

-- Users table (BIGINT id for Telegram user IDs)
CREATE TABLE events_users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'it',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (UUID id)
CREATE TABLE events_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    name_it VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (UUID id, references categories)
CREATE TABLE events_events (
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
    category_id UUID REFERENCES events_categories(id),
    ai_tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source, source_id)
);

-- User subscriptions table (references users and categories)
CREATE TABLE events_user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL,
    category_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id),
    CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES events_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES events_categories(id) ON DELETE CASCADE
);

-- User preferences table
CREATE TABLE events_user_preferences (
    user_id BIGINT PRIMARY KEY,
    notification_time VARCHAR(5) DEFAULT '09:00',
    zones TEXT[],
    max_price DECIMAL(10,2),
    notification_frequency VARCHAR(20) DEFAULT 'immediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_events_user_prefs FOREIGN KEY (user_id) REFERENCES events_users(id) ON DELETE CASCADE
);

-- Sent notifications table (to avoid duplicates)
CREATE TABLE events_sent_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL,
    event_id UUID NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id),
    CONSTRAINT fk_events_notif_user FOREIGN KEY (user_id) REFERENCES events_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_notif_event FOREIGN KEY (event_id) REFERENCES events_events(id) ON DELETE CASCADE
);

-- STEP 4: Insert default categories
INSERT INTO events_categories (name, name_it, emoji, description) VALUES
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

-- STEP 5: Create indexes for better performance
CREATE INDEX idx_events_events_date ON events_events(event_date);
CREATE INDEX idx_events_events_category ON events_events(category_id);
CREATE INDEX idx_events_events_published ON events_events(is_published);
CREATE INDEX idx_events_events_source ON events_events(source, source_id);
CREATE INDEX idx_events_user_subscriptions_user ON events_user_subscriptions(user_id);
CREATE INDEX idx_events_user_subscriptions_category ON events_user_subscriptions(category_id);
CREATE INDEX idx_events_sent_notifications_user_event ON events_sent_notifications(user_id, event_id);

-- STEP 6: Create updated_at trigger function
CREATE OR REPLACE FUNCTION events_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER events_update_users_updated_at BEFORE UPDATE ON events_users
    FOR EACH ROW EXECUTE FUNCTION events_update_updated_at_column();

CREATE TRIGGER events_update_events_updated_at BEFORE UPDATE ON events_events
    FOR EACH ROW EXECUTE FUNCTION events_update_updated_at_column();

CREATE TRIGGER events_update_user_preferences_updated_at BEFORE UPDATE ON events_user_preferences
    FOR EACH ROW EXECUTE FUNCTION events_update_updated_at_column();
