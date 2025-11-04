import { db } from '../database/supabase.js';
import { keyboards } from './keyboards.js';
import {
  formatWelcomeMessage,
  formatHelpMessage,
  formatEventList,
  formatEvent,
  escapeMarkdown,
} from './formatters.js';

export class BotHandlers {
  constructor(bot) {
    this.bot = bot;
    this.setupHandlers();
  }

  setupHandlers() {
    // Command handlers
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/\/help/, this.handleHelp.bind(this));
    this.bot.onText(/\/subscribe/, this.handleSubscribe.bind(this));
    this.bot.onText(/\/unsubscribe/, this.handleUnsubscribe.bind(this));
    this.bot.onText(/\/events/, this.handleEvents.bind(this));
    this.bot.onText(/\/today/, this.handleToday.bind(this));
    this.bot.onText(/\/categories/, this.handleCategories.bind(this));
    this.bot.onText(/\/mycategories/, this.handleMyCategories.bind(this));
    this.bot.onText(/\/preferences/, this.handlePreferences.bind(this));

    // Callback query handler
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));

    // Text message handlers
    this.bot.onText(/📅 Eventi Oggi/, this.handleToday.bind(this));
    this.bot.onText(/🔔 Le Mie Categorie/, this.handleMyCategories.bind(this));
    this.bot.onText(/➕ Iscriviti/, this.handleSubscribe.bind(this));
    this.bot.onText(/➖ Disiscriviti/, this.handleUnsubscribe.bind(this));
    this.bot.onText(/⚙️ Preferenze/, this.handlePreferences.bind(this));
    this.bot.onText(/ℹ️ Help/, this.handleHelp.bind(this));
  }

  /**
   * Handle /start command
   */
  async handleStart(msg) {
    const chatId = msg.chat.id;
    const user = msg.from;

    try {
      // Create or update user in database
      await db.createOrUpdateUser(user.id, {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        language_code: user.language_code,
      });

      const message = formatWelcomeMessage(user.first_name);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu,
      });
    } catch (error) {
      console.error('Error in handleStart:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Si è verificato un errore. Riprova tra poco.'
      );
    }
  }

  /**
   * Handle /help command
   */
  async handleHelp(msg) {
    const chatId = msg.chat.id;

    try {
      const message = formatHelpMessage();

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu,
      });
    } catch (error) {
      console.error('Error in handleHelp:', error);
    }
  }

  /**
   * Handle /subscribe command
   */
  async handleSubscribe(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const categories = await db.getCategories();
      const subscriptions = await db.getUserSubscriptions(userId);
      const subscribedIds = subscriptions.map(sub => sub.category_id);

      const message = '🔔 *Scegli le categorie che ti interessano:*\n\nRiceverai notifiche quando verranno aggiunti nuovi eventi in queste categorie.';

      await this.bot.sendMessage(
        chatId,
        message,
        {
          parse_mode: 'Markdown',
          ...keyboards.categoriesInline(categories, subscribedIds, 'subscribe'),
        }
      );
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      await this.bot.sendMessage(chatId, '❌ Errore nel caricamento delle categorie.');
    }
  }

  /**
   * Handle /unsubscribe command
   */
  async handleUnsubscribe(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const subscriptions = await db.getUserSubscriptions(userId);

      if (subscriptions.length === 0) {
        await this.bot.sendMessage(
          chatId,
          '😕 Non sei iscritto a nessuna categoria.\n\nUsa /subscribe per iscriverti!',
          keyboards.mainMenu
        );
        return;
      }

      const categories = subscriptions.map(sub => sub.categories);
      const subscribedIds = subscriptions.map(sub => sub.category_id);

      const message = '➖ *Seleziona le categorie da cui disiscriverti:*';

      await this.bot.sendMessage(
        chatId,
        message,
        {
          parse_mode: 'Markdown',
          ...keyboards.categoriesInline(categories, subscribedIds, 'unsubscribe'),
        }
      );
    } catch (error) {
      console.error('Error in handleUnsubscribe:', error);
      await this.bot.sendMessage(chatId, '❌ Errore nel caricamento delle categorie.');
    }
  }

  /**
   * Handle /events command
   */
  async handleEvents(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      await this.bot.sendMessage(chatId, '🔍 Cerco eventi per te...');

      // Get user subscriptions
      const subscriptions = await db.getUserSubscriptions(userId);

      let events;
      if (subscriptions.length > 0) {
        // Get events from subscribed categories
        const categoryIds = subscriptions.map(sub => sub.category_id);
        const eventPromises = categoryIds.map(catId => db.getEventsByCategory(catId, 5));
        const eventsArrays = await Promise.all(eventPromises);
        events = eventsArrays.flat();

        // Remove duplicates
        events = Array.from(new Map(events.map(e => [e.id, e])).values());

        // Sort by date
        events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      } else {
        // Get upcoming events
        events = await db.getUpcomingEvents(20);
      }

      const message = formatEventList(events);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu,
      });
    } catch (error) {
      console.error('Error in handleEvents:', error);
      await this.bot.sendMessage(chatId, '❌ Errore nel caricamento degli eventi.');
    }
  }

  /**
   * Handle /today command
   */
  async handleToday(msg) {
    const chatId = msg.chat.id;

    try {
      await this.bot.sendMessage(chatId, '🔍 Cerco eventi di oggi...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all upcoming events and filter by today
      const allEvents = await db.getUpcomingEvents(100);
      const todayEvents = allEvents.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate >= today && eventDate < tomorrow;
      });

      const message = formatEventList(todayEvents);

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu,
      });
    } catch (error) {
      console.error('Error in handleToday:', error);
      await this.bot.sendMessage(chatId, '❌ Errore nel caricamento degli eventi.');
    }
  }

  /**
   * Handle /categories command
   */
  async handleCategories(msg) {
    const chatId = msg.chat.id;

    try {
      const categories = await db.getCategories();

      let message = '📋 *Categorie Disponibili:*\n\n';

      categories.forEach(cat => {
        message += `${cat.emoji} *${cat.name_it}*\n`;
        message += `   ${escapeMarkdown(cat.description)}\n\n`;
      });

      message += '\nUsa /subscribe per iscriverti alle categorie che ti interessano!';

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu,
      });
    } catch (error) {
      console.error('Error in handleCategories:', error);
      await this.bot.sendMessage(chatId, '❌ Errore nel caricamento delle categorie.');
    }
  }

  /**
   * Handle /mycategories command
   */
  async handleMyCategories(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const subscriptions = await db.getUserSubscriptions(userId);

      if (subscriptions.length === 0) {
        await this.bot.sendMessage(
          chatId,
          '😕 Non sei ancora iscritto a nessuna categoria.\n\nUsa /subscribe per iniziare!',
          keyboards.mainMenu
        );
        return;
      }

      let message = '🔔 *Le Tue Categorie:*\n\n';

      subscriptions.forEach(sub => {
        message += `${sub.categories.emoji} ${sub.categories.name_it}\n`;
      });

      message += '\n✅ Riceverai notifiche per queste categorie!';

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu,
      });
    } catch (error) {
      console.error('Error in handleMyCategories:', error);
      await this.bot.sendMessage(chatId, '❌ Errore nel caricamento delle tue categorie.');
    }
  }

  /**
   * Handle /preferences command
   */
  async handlePreferences(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const preferences = await db.getUserPreferences(userId);

      let message = '⚙️ *Le Tue Preferenze:*\n\n';

      if (preferences) {
        message += `🕐 Orario notifiche: ${preferences.notification_time}\n`;
        message += `🔔 Frequenza: ${preferences.notification_frequency}\n`;
        if (preferences.max_price) {
          message += `💰 Prezzo massimo: €${preferences.max_price}\n`;
        }
      } else {
        message += 'Nessuna preferenza impostata.\n';
      }

      message += '\n_La configurazione delle preferenze sarà disponibile a breve!_';

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu,
      });
    } catch (error) {
      console.error('Error in handlePreferences:', error);
      await this.bot.sendMessage(chatId, '❌ Errore nel caricamento delle preferenze.');
    }
  }

  /**
   * Handle callback queries (inline button clicks)
   */
  async handleCallbackQuery(callbackQuery) {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    try {
      // Subscribe action
      if (data.startsWith('subscribe:')) {
        const categoryId = data.split(':')[1];
        await db.subscribe(userId, categoryId);

        await this.bot.answerCallbackQuery(callbackQuery.id, {
          text: '✅ Iscrizione effettuata!',
        });

        // Update keyboard
        const categories = await db.getCategories();
        const subscriptions = await db.getUserSubscriptions(userId);
        const subscribedIds = subscriptions.map(sub => sub.category_id);

        await this.bot.editMessageReplyMarkup(
          keyboards.categoriesInline(categories, subscribedIds, 'subscribe').reply_markup,
          {
            chat_id: chatId,
            message_id: msg.message_id,
          }
        );
      }

      // Unsubscribe action
      else if (data.startsWith('unsubscribe:')) {
        const categoryId = data.split(':')[1];
        await db.unsubscribe(userId, categoryId);

        await this.bot.answerCallbackQuery(callbackQuery.id, {
          text: '✅ Disiscrizione effettuata!',
        });

        // Update keyboard
        const subscriptions = await db.getUserSubscriptions(userId);

        if (subscriptions.length === 0) {
          await this.bot.editMessageText(
            '✅ Ti sei disiscritto da tutte le categorie.',
            {
              chat_id: chatId,
              message_id: msg.message_id,
            }
          );
        } else {
          const categories = subscriptions.map(sub => sub.categories);
          const subscribedIds = subscriptions.map(sub => sub.category_id);

          await this.bot.editMessageReplyMarkup(
            keyboards.categoriesInline(categories, subscribedIds, 'unsubscribe').reply_markup,
            {
              chat_id: chatId,
              message_id: msg.message_id,
            }
          );
        }
      }

      // Menu action
      else if (data === 'menu') {
        await this.bot.answerCallbackQuery(callbackQuery.id);
        await this.bot.sendMessage(
          chatId,
          '📱 Menu Principale',
          keyboards.mainMenu
        );
      }
    } catch (error) {
      console.error('Error in handleCallbackQuery:', error);
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Errore durante l\'operazione.',
      });
    }
  }
}
