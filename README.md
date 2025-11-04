# Roma Events Telegram Bot 🎭

Un bot Telegram intelligente che invia notifiche sugli eventi a Roma, con raccomandazioni AI-powered.

**Perfetto per girare 24/7 su Raspberry Pi!** 🍓

## ✨ Features

- 🔍 **Scraping multi-sorgente**: Raccoglie eventi da Roma Today, Zero.eu e altri siti
- 🤖 **AI-Powered**: Usa Gemini AI per categorizzare eventi e dare raccomandazioni
- 📱 **Notifiche personalizzate**: Subscribe alle categorie che ti interessano
- 🗄️ **Database Supabase**: Storage affidabile e scalabile
- ⚡ **Real-time updates**: Notifiche immediate per nuovi eventi
- 🍓 **Raspberry Pi Ready**: Ottimizzato per girare 24/7 su Raspberry Pi
- 🔄 **Auto-restart**: Si riavvia automaticamente in caso di crash
- 📊 **Monitoring**: Logs e statistiche integrate con PM2

## 📋 Categorie Eventi

- 🎵 Musica & Concerti
- 🎨 Arte & Mostre
- ⚽ Sport
- 🍝 Food & Wine
- 🌙 Nightlife
- 👨‍👩‍👧‍👦 Famiglia & Bambini
- 🎭 Teatro & Spettacoli
- 📚 Cultura & Conferenze
- 🎬 Cinema
- 🛍️ Mercati & Fiere

## 🚀 Quick Start

### 🍓 Setup su Raspberry Pi (Consigliato)

**Setup automatico in 5 minuti:**

```bash
# SSH nel Raspberry Pi
ssh pi@192.168.1.XXX

# Clona il repository
git clone https://github.com/TUO_USERNAME/events.git
cd events

# Configura .env con le tue credenziali
nano .env

# Esegui lo script di installazione
./install.sh
```

✅ **Fatto!** Il bot è ora online 24/7!

📖 **Guide dettagliate:**
- [🍓 Raspberry Pi Setup Completo](RASPBERRY_PI_SETUP.md)
- [⚡ Quick Start Raspberry Pi](QUICKSTART_RASPBERRY_PI.md)

### 💻 Setup Standard (Linux/Mac)

1. Installa dipendenze:
```bash
npm install
```

2. Configura `.env` con le tue credenziali

3. Configura il database Supabase (vedi `SETUP_GUIDE.md`)

4. Avvia il bot:
```bash
npm start
```

📖 **Guida completa:** [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 🤖 Comandi Bot

- `/start` - Inizia a usare il bot
- `/subscribe` - Iscriviti alle categorie
- `/unsubscribe` - Disiscriviti dalle categorie
- `/events` - Vedi gli eventi disponibili
- `/today` - Eventi di oggi
- `/categories` - Lista delle categorie disponibili
- `/mycategories` - Le tue categorie attive
- `/preferences` - Gestisci le tue preferenze
- `/help` - Aiuto e informazioni

## 🛠️ Scripts NPM

```bash
npm start              # Avvia il bot
npm run dev            # Modalità sviluppo (con watch)
npm run scrape         # Test scraping manuale
npm run setup-db       # Test connessione database
```

## 🍓 Comandi Raspberry Pi (con PM2)

```bash
pm2 start ecosystem.config.js    # Avvia bot
pm2 status                        # Status
pm2 logs roma-events-bot         # Visualizza logs
pm2 restart roma-events-bot      # Riavvia
pm2 stop roma-events-bot         # Ferma
pm2 monit                         # Monitor CPU/RAM

./update.sh                       # Aggiorna bot
./health-check.sh                 # Health check
```

## 📁 Architettura

```
events/
├── src/
│   ├── index.js                 # Entry point principale
│   ├── config.js                # Configurazione
│   ├── bot/                     # Bot Telegram
│   │   ├── index.js            # Bot instance
│   │   ├── handlers.js         # Command handlers
│   │   ├── keyboards.js        # Inline keyboards
│   │   └── formatters.js       # Message formatting
│   ├── database/                # Supabase
│   │   ├── supabase.js         # Client e query helpers
│   │   └── setup.js            # Setup script
│   ├── scrapers/                # Web scrapers
│   │   ├── baseScraper.js      # Classe base
│   │   ├── romaTodayScraper.js # RomaToday scraper
│   │   ├── zeroScraper.js      # Zero.eu scraper
│   │   ├── index.js            # Scraper service
│   │   └── runScrapers.js      # Script manuale
│   ├── ai/
│   │   └── gemini.js           # Gemini AI integration
│   └── notifications/
│       └── notificationService.js
├── database-schema.sql          # Schema PostgreSQL
├── ecosystem.config.js          # PM2 configuration
├── install.sh                   # Script installazione
├── update.sh                    # Script aggiornamento
├── health-check.sh              # Health check
├── package.json
└── .env                         # Credenziali (non committare!)
```

## 🔧 Tecnologie

- **Node.js** 18+ con ES Modules
- **Telegram Bot API** (node-telegram-bot-api)
- **Supabase** (PostgreSQL database)
- **Google Gemini AI** (categorizzazione eventi)
- **Cheerio** (web scraping)
- **PM2** (process manager)
- **node-cron** (scheduled tasks)

## 📊 Come Funziona

1. **Scraping automatico** ogni ora (configurabile)
2. **Gemini AI** categorizza automaticamente gli eventi
3. **Database Supabase** salva eventi e preferenze utenti
4. **Notifiche intelligenti** agli utenti interessati
5. **PM2** mantiene il bot online 24/7
6. **Auto-restart** in caso di crash o errori

## 🔒 Sicurezza

⚠️ **IMPORTANTE**:
- Non committare mai il file `.env` (è già in `.gitignore`)
- Non condividere le API keys pubblicamente
- Usa variabili d'ambiente in produzione
- Rigenera periodicamente le chiavi

## 📈 Roadmap

- [ ] Web dashboard per gestire eventi
- [ ] Supporto immagini negli eventi
- [ ] Filtri per zona di Roma
- [ ] Sistema di feedback utenti
- [ ] Analytics e statistiche
- [ ] Export eventi in calendario (.ics)
- [ ] Integrazione Google Maps
- [ ] Notifiche push web
- [ ] Supporto altre città italiane

## 🐛 Troubleshooting

### Il bot non risponde
```bash
pm2 logs roma-events-bot
pm2 restart roma-events-bot
```

### Errori di memoria
```bash
pm2 monit  # Controlla RAM usage
# Se necessario, aumenta il limite in ecosystem.config.js
```

### Problemi di connessione
```bash
ping api.telegram.org
./health-check.sh
```

## 📚 Documentazione

- [🍓 Raspberry Pi Setup](RASPBERRY_PI_SETUP.md) - Guida completa setup Raspberry Pi
- [⚡ Quick Start Raspberry Pi](QUICKSTART_RASPBERRY_PI.md) - Setup veloce in 10 minuti
- [📖 Setup Guide](SETUP_GUIDE.md) - Guida generale setup e deploy
- [🗄️ Database Schema](database-schema.sql) - Schema PostgreSQL completo

## 🤝 Contribuire

Contributi benvenuti!

1. Fork il repository
2. Crea un branch per la tua feature
3. Commit le modifiche
4. Push e apri una Pull Request

## 📝 License

MIT License - Usa liberamente per progetti personali o commerciali!

## 🙏 Credits

Sviluppato con ❤️ per scoprire Roma

- **Telegram Bot API**
- **Google Gemini AI**
- **Supabase**
- **PM2**

---

**Made with 🍓 for Raspberry Pi**
