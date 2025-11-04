import { db } from '../database/supabase.js';
import { GeminiAI } from '../ai/gemini.js';

export class NotificationService {
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Notify users about a new event
   * @param {Object} event - Event object
   * @returns {Promise<number>} - Number of notifications sent
   */
  async notifyNewEvent(event) {
    if (!event.category_id) {
      console.warn('Event has no category, skipping notifications');
      return 0;
    }

    try {
      // Get users subscribed to this event's category
      const users = await db.getUsersSubscribedToCategory(event.category_id);

      let notificationsSent = 0;

      for (const user of users) {
        try {
          // Check if we already sent this notification
          const alreadySent = await db.wasNotificationSent(user.id, event.id);
          if (alreadySent) {
            continue;
          }

          // Check user preferences
          const preferences = await db.getUserPreferences(user.id);

          // Check max price filter
          if (preferences?.max_price && event.price_min) {
            if (event.price_min > preferences.max_price) {
              continue;
            }
          }

          // Send notification
          const success = await this.bot.sendEventNotification(user.id, event);

          if (success) {
            await db.markNotificationSent(user.id, event.id);
            notificationsSent++;
            console.log(`✅ Notified user ${user.id} about event: ${event.title}`);
          }

          // Rate limiting: wait 50ms between messages
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Error notifying user ${user.id}:`, error.message);
        }
      }

      console.log(`📤 Sent ${notificationsSent} notifications for event: ${event.title}`);
      return notificationsSent;
    } catch (error) {
      console.error('Error in notifyNewEvent:', error);
      return 0;
    }
  }

  /**
   * Notify users about multiple new events
   * @param {Array} events - Array of event objects
   * @returns {Promise<number>} - Total notifications sent
   */
  async notifyNewEvents(events) {
    console.log(`📢 Notifying users about ${events.length} new events...`);

    let totalNotifications = 0;

    for (const event of events) {
      const count = await this.notifyNewEvent(event);
      totalNotifications += count;

      // Wait between events to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Total notifications sent: ${totalNotifications}`);
    return totalNotifications;
  }

  /**
   * Send daily digest to a user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async sendDailyDigest(userId) {
    try {
      // Get user subscriptions
      const subscriptions = await db.getUserSubscriptions(userId);

      if (subscriptions.length === 0) {
        return false;
      }

      // Get events from subscribed categories
      const categoryIds = subscriptions.map(sub => sub.category_id);
      const eventPromises = categoryIds.map(catId => db.getEventsByCategory(catId, 3));
      const eventsArrays = await Promise.all(eventPromises);
      let events = eventsArrays.flat();

      // Remove duplicates
      events = Array.from(new Map(events.map(e => [e.id, e])).values());

      // Get recommendations
      events = await GeminiAI.recommendEvents(events, subscriptions.map(s => s.categories));

      if (events.length === 0) {
        return false;
      }

      // Format digest message
      const { formatEventList } = await import('../bot/formatters.js');
      const message = `🌅 *Buongiorno! Ecco gli eventi consigliati per te oggi:*\n\n${formatEventList(events.slice(0, 5))}`;

      await this.bot.sendNotification(userId, message);
      return true;
    } catch (error) {
      console.error(`Error sending daily digest to user ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Send daily digests to all users
   * @returns {Promise<number>} - Number of digests sent
   */
  async sendDailyDigests() {
    console.log('📨 Sending daily digests...');

    try {
      // Get all active users (this would need a query to get all users)
      // For now, we'll skip this feature
      console.log('ℹ️ Daily digests feature to be implemented');
      return 0;
    } catch (error) {
      console.error('Error sending daily digests:', error);
      return 0;
    }
  }

  /**
   * Send a custom notification to a user
   * @param {number} userId - User ID
   * @param {string} message - Message to send
   * @returns {Promise<boolean>} - Success status
   */
  async sendCustomNotification(userId, message) {
    try {
      await this.bot.sendNotification(userId, message);
      return true;
    } catch (error) {
      console.error(`Error sending custom notification to user ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Broadcast a message to all users
   * @param {string} message - Message to broadcast
   * @returns {Promise<number>} - Number of messages sent
   */
  async broadcastMessage(message) {
    console.log('📢 Broadcasting message to all users...');

    try {
      // This would need a query to get all active users
      // For now, we'll skip this feature
      console.log('ℹ️ Broadcast feature to be implemented');
      return 0;
    } catch (error) {
      console.error('Error broadcasting message:', error);
      return 0;
    }
  }
}
