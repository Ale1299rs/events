import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Client for general operations (anon key)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Admin client for privileged operations (service role key)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

// Database query helpers (using events_ prefixed tables)
export const db = {
  // Users
  async getUser(userId) {
    const { data, error } = await supabase
      .from('events_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createOrUpdateUser(userId, userData) {
    const { data, error } = await supabase
      .from('events_users')
      .upsert({
        id: userId,
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('events_categories')
      .select('*')
      .order('name_it');

    if (error) throw error;
    return data || [];
  },

  async getCategoryByName(name) {
    const { data, error } = await supabase
      .from('events_categories')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // User Subscriptions
  async getUserSubscriptions(userId) {
    const { data, error } = await supabase
      .from('events_user_subscriptions')
      .select(`
        *,
        events_categories (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  async subscribe(userId, categoryId) {
    const { data, error } = await supabase
      .from('events_user_subscriptions')
      .upsert({
        user_id: userId,
        category_id: categoryId,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unsubscribe(userId, categoryId) {
    const { error } = await supabase
      .from('events_user_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('category_id', categoryId);

    if (error) throw error;
  },

  // Events
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events_events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      // If duplicate, return null instead of throwing
      if (error.code === '23505') return null;
      throw error;
    }
    return data;
  },

  async getUpcomingEvents(limit = 50) {
    const { data, error } = await supabase
      .from('events_events')
      .select(`
        *,
        events_categories (*)
      `)
      .eq('is_published', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getEventsByCategory(categoryId, limit = 20) {
    const { data, error } = await supabase
      .from('events_events')
      .select(`
        *,
        events_categories (*)
      `)
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async updateEvent(eventId, updates) {
    const { data, error } = await supabase
      .from('events_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Notifications
  async markNotificationSent(userId, eventId) {
    const { error } = await supabase
      .from('events_sent_notifications')
      .insert({
        user_id: userId,
        event_id: eventId,
      });

    if (error && error.code !== '23505') throw error;
  },

  async wasNotificationSent(userId, eventId) {
    const { data, error } = await supabase
      .from('events_sent_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // User Preferences
  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from('events_user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserPreferences(userId, preferences) {
    const { data, error } = await supabase
      .from('events_user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get users subscribed to a category
  async getUsersSubscribedToCategory(categoryId) {
    const { data, error } = await supabase
      .from('events_user_subscriptions')
      .select(`
        user_id,
        events_users (
          id,
          username,
          first_name,
          last_name,
          language_code,
          is_active
        )
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (error) throw error;
    return data ? data.map(sub => sub.events_users).filter(user => user !== null) : [];
  },
};
