import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config.js';
import { BotHandlers } from './handlers.js';

export class EventBot {
  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.handlers = new BotHandlers(this.bot);

    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error.code, error.message);
    });

    this.bot.on('error', (error) => {
      console.error('Bot error:', error);
    });
  }

  /**
   * Send notification to a user
   * @param {number} userId - Telegram user ID
   * @param {string} message - Message to send
   * @param {Object} options - Additional options
   */
  async sendNotification(userId, message, options = {}) {
    try {
      await this.bot.sendMessage(userId, message, {
        parse_mode: 'Markdown',
        ...options,
      });
      return true;
    } catch (error) {
      console.error(`Error sending notification to ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Send event notification to a user
   * @param {number} userId - Telegram user ID
   * @param {Object} event - Event object
   */
  async sendEventNotification(userId, event) {
    const { formatEvent } = await import('./formatters.js');
    const { keyboards } = await import('./keyboards.js');

    const message = `🆕 *Nuovo Evento!*\n\n${formatEvent(event, true)}`;

    try {
      await this.bot.sendMessage(userId, message, {
        parse_mode: 'Markdown',
        ...keyboards.eventDetails(event),
      });
      return true;
    } catch (error) {
      console.error(`Error sending event notification to ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Start the bot
   */
  start() {
    console.log('🤖 Bot started successfully!');
    console.log(`Bot username: @${this.bot.options.username || 'unknown'}`);
  }

  /**
   * Stop the bot
   */
  async stop() {
    await this.bot.stopPolling();
    console.log('🛑 Bot stopped');
  }

  /**
   * Get bot instance
   */
  getBot() {
    return this.bot;
  }
}
