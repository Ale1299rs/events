# 📖 Guida Setup - Roma Events Bot

Questa guida ti aiuterà a configurare e avviare il bot Telegram per eventi a Roma.

## 📋 Prerequisiti

- Node.js 18+ installato
- Account Supabase (gratuito)
- Bot Token Telegram
- API Key Gemini (Google AI)

## 🚀 Setup Passo per Passo

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura Supabase

1. Vai su [https://app.supabase.com](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Copia il contenuto del file `database-schema.sql`
5. Incolla nell'editor SQL e clicca **Run**

✅ Il database è ora configurato!

### 3. Verifica la configurazione

Verifica che le tue credenziali nel file `.env` siano corrette:

```bash
npm run setup-db
```

### 4. Avvia il bot

```bash
npm start
```

Il bot è ora attivo! 🎉

## 🧪 Test manuale

1. Cerca il tuo bot su Telegram (usa il nome che hai dato a @BotFather)
2. Invia `/start`
3. Segui le istruzioni per iscriverti alle categorie

## 🔍 Test dello scraping

Per testare lo scraping manualmente:

```bash
npm run scrape
```

Questo comando:
- Scarica eventi da tutti i siti configurati
- Li categorizza usando Gemini AI
- Li salva nel database
- NON invia notifiche agli utenti

## 📊 Monitoraggio

### Visualizza gli eventi nel database

1. Vai su Supabase Dashboard
2. Clicca su **Table Editor**
3. Seleziona la tabella `events`

### Visualizza gli utenti registrati

Nella tabella `users` puoi vedere tutti gli utenti che hanno avviato il bot.

### Visualizza le iscrizioni

La tabella `user_subscriptions` mostra quali categorie ogni utente ha sottoscritto.

## 🔧 Configurazione Avanzata

### Modifica l'intervallo di scraping

Nel file `.env`, modifica:

```env
SCRAPE_INTERVAL=60  # minuti (default: ogni ora)
```

### Aggiungi nuovi scrapers

1. Crea un nuovo file in `src/scrapers/` (es: `tuoSitoScraper.js`)
2. Estendi la classe `BaseScraper`
3. Implementa il metodo `scrape()`
4. Aggiungi lo scraper in `src/scrapers/index.js`

Esempio:

```javascript
import { BaseScraper } from './baseScraper.js';

export class TuoSitoScraper extends BaseScraper {
  constructor() {
    super('TuoSito', 'https://tuosito.it');
  }

  async scrape() {
    // Implementa la logica di scraping
    return events;
  }
}
```

### Personalizza i messaggi

I messaggi del bot sono in `src/bot/formatters.js`. Puoi modificarli per personalizzare il tono e lo stile.

### Modifica le categorie

Le categorie sono definite nel file `database-schema.sql`. Per aggiungere nuove categorie:

1. Aggiungi la categoria nella sezione `INSERT INTO categories`
2. Riesegui il comando SQL in Supabase
3. Aggiorna i prompt AI in `src/ai/gemini.js` per includere la nuova categoria

## 🐛 Risoluzione Problemi

### Il bot non risponde

1. Verifica che il token Telegram sia corretto
2. Controlla i log per errori
3. Assicurati che il bot non sia già in esecuzione

### Lo scraping non funziona

1. Verifica la connessione a internet
2. I siti potrebbero aver cambiato struttura HTML
3. Controlla i log per dettagli

### Errori del database

1. Verifica che hai eseguito il SQL schema
2. Controlla che le credenziali Supabase siano corrette
3. Assicurati di usare la `SERVICE_ROLE_KEY` per operazioni privilegiate

### Gemini AI non funziona

1. Verifica che la API key sia valida
2. Controlla di non aver superato i limiti gratuiti
3. I prompt potrebbero necessitare aggiustamenti

## 📱 Deploy in Produzione

### Opzione 1: VPS (consigliato)

1. Ottieni un VPS (DigitalOcean, Linode, Hetzner)
2. Installa Node.js
3. Clona il repository
4. Configura `.env`
5. Usa PM2 per gestire il processo:

```bash
npm install -g pm2
pm2 start src/index.js --name roma-events-bot
pm2 save
pm2 startup
```

### Opzione 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

### Opzione 3: Cloud Functions

Il bot può essere adattato per girare su serverless platforms come:
- Google Cloud Functions
- AWS Lambda
- Vercel (con modifiche)

## 🔒 Sicurezza

⚠️ **IMPORTANTE**:

1. **NON condividere mai** il file `.env` o le tue API keys
2. Aggiungi `.env` al `.gitignore` (già fatto)
3. Usa variabili d'ambiente in produzione
4. Rigenera periodicamente le chiavi API
5. Limita i permessi del Service Role Key di Supabase

## 📈 Miglioramenti Futuri

- [ ] Web dashboard per gestire eventi manualmente
- [ ] Supporto per immagini negli eventi
- [ ] Filtri per zona di Roma
- [ ] Sistema di feedback utenti
- [ ] Analytics e statistiche
- [ ] Export eventi in calendario
- [ ] Integrazione con Google Maps
- [ ] Notifiche push web

## 🆘 Supporto

Se hai problemi:

1. Controlla i log del bot
2. Verifica la documentazione delle API usate
3. Cerca errori comuni online

## 📝 License

MIT License - Usa liberamente per progetti personali o commerciali!
