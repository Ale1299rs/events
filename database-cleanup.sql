-- Database Cleanup Script
-- Run this FIRST if you need to completely reset your database
-- WARNING: This will delete ALL data in these tables!

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS sent_notifications CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- After running this, run database-schema.sql to recreate the tables
