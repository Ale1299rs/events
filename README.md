# Roma Events Telegram Bot 🎭

Un bot Telegram intelligente che invia notifiche sugli eventi a Roma, con raccomandazioni AI-powered.

## Features

- 🔍 **Scraping multi-sorgente**: Raccoglie eventi da Roma Today e altri siti
- 🤖 **AI-Powered**: Usa Gemini AI per categorizzare eventi e dare raccomandazioni
- 📱 **Notifiche personalizzate**: Subscribe alle categorie che ti interessano
- 🗄️ **Database Supabase**: Storage affidabile e scalabile
- ⚡ **Real-time updates**: Notifiche immediate per nuovi eventi

## Categorie Eventi

- 🎵 Musica & Concerti
- 🎨 Arte & Mostre
- ⚽ Sport
- 🍝 Food & Wine
- 🌙 Nightlife
- 👨‍👩‍👧‍👦 Famiglia & Bambini
- 🎭 Teatro & Spettacoli
- 📚 Cultura & Conferenze

## Setup

1. Installa dipendenze:
```bash
npm install
```

2. Configura il database Supabase:
```bash
npm run setup-db
```

3. Avvia il bot:
```bash
npm start
```

## Comandi Bot

- `/start` - Inizia a usare il bot
- `/subscribe` - Iscriviti alle categorie
- `/unsubscribe` - Disiscriviti dalle categorie
- `/events` - Vedi gli eventi di oggi
- `/categories` - Lista delle categorie disponibili
- `/preferences` - Gestisci le tue preferenze
- `/help` - Aiuto

## Architettura

```
src/
├── index.js              # Entry point
├── bot/                  # Telegram bot logic
├── scrapers/             # Event scrapers
├── ai/                   # Gemini AI integration
├── database/             # Supabase client & queries
├── notifications/        # Notification system
└── utils/                # Utilities
```

## License

MIT
