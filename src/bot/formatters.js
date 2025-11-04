/**
 * Message formatting utilities
 */

/**
 * Format event for display
 * @param {Object} event - Event object
 * @param {boolean} detailed - Include full details
 * @returns {string} - Formatted message
 */
export function formatEvent(event, detailed = false) {
  let message = `📌 *${escapeMarkdown(event.title)}*\n\n`;

  if (event.categories?.emoji) {
    message += `${event.categories.emoji} Categoria: ${event.categories.name_it}\n`;
  }

  if (event.event_date) {
    const date = new Date(event.event_date);
    message += `📅 Data: ${formatDate(date)}\n`;
  }

  if (event.location) {
    message += `📍 Luogo: ${escapeMarkdown(event.location)}\n`;
  }

  if (event.price) {
    message += `💰 Prezzo: ${escapeMarkdown(event.price)}\n`;
  }

  if (detailed && event.description) {
    message += `\n${escapeMarkdown(event.description)}\n`;
  }

  if (event.ai_tags && event.ai_tags.length > 0) {
    message += `\n🏷️ ${event.ai_tags.map(tag => `#${tag}`).join(' ')}\n`;
  }

  return message;
}

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${dayName} ${day} ${month} ${year} ore ${hours}:${minutes}`;
}

/**
 * Escape markdown special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeMarkdown(text) {
  if (!text) return '';
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Format list of events
 * @param {Array} events - Array of events
 * @returns {string} - Formatted message
 */
export function formatEventList(events) {
  if (events.length === 0) {
    return '😕 Nessun evento trovato per i tuoi interessi.';
  }

  let message = `🎉 *Ho trovato ${events.length} eventi per te!*\n\n`;

  events.slice(0, 10).forEach((event, index) => {
    const emoji = event.categories?.emoji || '📌';
    const title = escapeMarkdown(event.title);
    const date = event.event_date ? formatDate(new Date(event.event_date)) : 'Data da definire';

    message += `${emoji} *${index + 1}. ${title}*\n`;
    message += `   📅 ${date}\n`;
    if (event.location) {
      message += `   📍 ${escapeMarkdown(event.location)}\n`;
    }
    message += '\n';
  });

  if (events.length > 10) {
    message += `\n_...e altri ${events.length - 10} eventi!_`;
  }

  return message;
}

/**
 * Format welcome message
 * @param {string} firstName - User's first name
 * @returns {string} - Welcome message
 */
export function formatWelcomeMessage(firstName) {
  return `👋 Ciao ${escapeMarkdown(firstName)}!

Benvenuto nel *Bot Eventi Roma* 🎭

Sono qui per tenerti aggiornato su tutti gli eventi più interessanti della Capitale!

*Cosa posso fare:*
🔍 Cercare eventi da varie fonti
🤖 Categorizzare eventi con AI
🔔 Inviarti notifiche personalizzate
📅 Mostrarti eventi in base ai tuoi interessi

*Per iniziare:*
1️⃣ Usa /subscribe per scegliere le categorie che ti interessano
2️⃣ Riceverai notifiche quando ci saranno nuovi eventi
3️⃣ Usa /events per vedere gli eventi disponibili

Pronto a scoprire Roma? 🏛️`;
}

/**
 * Format help message
 * @returns {string} - Help message
 */
export function formatHelpMessage() {
  return `ℹ️ *Comandi Disponibili*

/start - Inizia a usare il bot
/subscribe - Iscriviti alle categorie
/unsubscribe - Disiscriviti dalle categorie
/events - Vedi eventi disponibili
/today - Eventi di oggi
/categories - Lista categorie
/mycategories - Le tue categorie
/preferences - Gestisci preferenze
/help - Mostra questo messaggio

*Categorie disponibili:*
🎵 Musica & Concerti
🎨 Arte & Mostre
⚽ Sport
🍝 Food & Wine
🌙 Nightlife
👨‍👩‍👧‍👦 Famiglia & Bambini
🎭 Teatro & Spettacoli
📚 Cultura & Conferenze
🎬 Cinema
🛍️ Mercati & Fiere

*Hai bisogno di aiuto?*
Scrivimi e sarò felice di assisterti! 😊`;
}
