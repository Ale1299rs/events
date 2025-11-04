/**
 * Keyboard layouts for the bot
 */

export const keyboards = {
  /**
   * Main menu keyboard
   */
  mainMenu: {
    reply_markup: {
      keyboard: [
        [{ text: '📅 Eventi Oggi' }, { text: '🔔 Le Mie Categorie' }],
        [{ text: '➕ Iscriviti' }, { text: '➖ Disiscriviti' }],
        [{ text: '⚙️ Preferenze' }, { text: 'ℹ️ Help' }],
      ],
      resize_keyboard: true,
    },
  },

  /**
   * Create inline keyboard for categories
   * @param {Array} categories - Array of category objects
   * @param {Array} subscribedIds - Array of subscribed category IDs
   * @param {string} action - Action prefix (subscribe/unsubscribe)
   */
  categoriesInline: (categories, subscribedIds = [], action = 'subscribe') => {
    const buttons = categories.map(cat => {
      const isSubscribed = subscribedIds.includes(cat.id);
      const prefix = isSubscribed ? '✅' : '';
      return [{
        text: `${prefix} ${cat.emoji} ${cat.name_it}`,
        callback_data: `${action}:${cat.id}`,
      }];
    });

    return {
      reply_markup: {
        inline_keyboard: [
          ...buttons,
          [{ text: '🔙 Menu Principale', callback_data: 'menu' }],
        ],
      },
    };
  },

  /**
   * Event details keyboard
   * @param {Object} event - Event object
   */
  eventDetails: (event) => {
    const buttons = [];

    if (event.url) {
      buttons.push([{ text: '🔗 Più Info', url: event.url }]);
    }

    buttons.push([{ text: '🔙 Indietro', callback_data: 'back' }]);

    return {
      reply_markup: {
        inline_keyboard: buttons,
      },
    };
  },

  /**
   * Remove keyboard
   */
  remove: {
    reply_markup: {
      remove_keyboard: true,
    },
  },
};
