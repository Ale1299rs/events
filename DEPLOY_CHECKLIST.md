# ✅ Checklist Deploy Raspberry Pi

## Stato Attuale del Progetto

### ✅ Completato
- [x] Database schema corretto con prefisso `events_`
- [x] Tutte le query aggiornate con i nuovi nomi tabelle
- [x] File `.env` creato e configurato
- [x] Dipendenze installate e compatibili
- [x] Bot Telegram funzionante e testato
- [x] Scraper configurati
- [x] Cron jobs attivi

### 📊 Verifica Finale

**Bot Status**: ✅ ONLINE
**Database**: ✅ Connesso (Supabase)
**Telegram Token**: ✅ Configurato
**Gemini AI**: ✅ Configurato

## 🚀 Deploy su Raspberry Pi - Quick Start

### 1. Preparazione (sul tuo Mac)

```bash
# Vai nella directory del progetto
cd /Users/Alex/Downloads/Events/events

# Assicurati che tutto sia committato
git status
git add .
git commit -m "Fix database queries and prepare for deployment"
git push origin claude/oo-implementation-011CUoaqqXpMsrZQ9JQrxCgu
```

### 2. Sul Raspberry Pi

```bash
# Connettiti al Raspberry Pi
ssh pi@raspberry-pi-ip

# Installa Node.js 20 (IMPORTANTE: il progetto richiede Node 20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifica versione
node -v  # Deve essere v20.x.x o superiore

# Clona il progetto
cd ~
git clone https://github.com/TUO_USERNAME/events.git
cd events

# Copia il file .env
nano .env
# Incolla il contenuto del .env (vedi sotto)

# Installa dipendenze
npm install --production

# Installa PM2 per gestire il processo
sudo npm install -g pm2

# Avvia l'app
pm2 start src/index.js --name roma-events-bot

# Configura auto-start al boot
pm2 startup
pm2 save

# Verifica che funzioni
pm2 status
pm2 logs roma-events-bot
```

### 3. Contenuto `.env` per Raspberry Pi

```env
TELEGRAM_BOT_TOKEN=8373590031:AAFLL6y04Oy7M2OC0ehymEhj_KWPihssCl0
GEMINI_API_KEY=AIzaSyBN1CCtnMsz45GMz-P6DOEWiI89NCQ0d8s
SUPABASE_URL=https://nutwtcgybeoedgcihgmxqd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dHdjZ3liZW9kZ2NpaGdteHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MjQ3NzUsImV4cCI6MjA3NzQwMDc3NX0.aUKF_KjzdOVrs2KOnipbtFmrp2pQz3J2dZydq5jB6lE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dHdjZ3liZW9kZ2NpaGdteHFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgyNDc3NSwiZXhwIjoyMDc3NDAwNzc1fQ.llnFJpX4eY3zrajb35T7NcQIyQ1hdgem54hFee6Xm7o
NODE_ENV=production
SCRAPE_INTERVAL=60
```

## 🔧 Comandi Utili PM2

```bash
# Vedere i log in tempo reale
pm2 logs roma-events-bot

# Riavviare il bot
pm2 restart roma-events-bot

# Fermare il bot
pm2 stop roma-events-bot

# Vedere status
pm2 status

# Vedere info dettagliate
pm2 info roma-events-bot

# Rimuovere dall'auto-start
pm2 delete roma-events-bot
```

## 🐛 Troubleshooting

### Il bot non si avvia
```bash
# Controlla i log
pm2 logs roma-events-bot --err

# Verifica versione Node.js
node -v  # Deve essere >= 20.0.0

# Verifica che .env esista
cat .env

# Verifica dipendenze
npm install
```

### Errori di database
```bash
# Testa connessione
npm run setup-db

# Verifica che lo schema SQL sia stato eseguito su Supabase
```

### Bot non risponde su Telegram
```bash
# Verifica token
echo $TELEGRAM_BOT_TOKEN

# Testa bot
curl https://api.telegram.org/bot8373590031:AAFLL6y04Oy7M2OC0ehymEhj_KWPihssCl0/getMe
```

## 📝 Note Importanti

1. **Node.js 20**: Il progetto RICHIEDE Node.js 20 o superiore
2. **Memoria**: Raspberry Pi 4 con 2GB+ RAM consigliato
3. **Connessione**: Ethernet consigliato per stabilità
4. **Backup**: Fai backup regolari del database su Supabase
5. **Monitoring**: Usa `pm2 monit` per monitorare risorse

## 🎯 Test Finali

Dopo il deploy, testa:

1. ✅ Bot risponde a `/start`
2. ✅ Puoi iscriverti a categorie
3. ✅ Scraper funziona (controlla i log dopo 60 minuti)
4. ✅ Database salva correttamente

## 🆘 Supporto

Se hai problemi:
1. Controlla i log: `pm2 logs roma-events-bot`
2. Verifica il database su Supabase
3. Testa la connessione di rete
4. Verifica che tutte le API key siano valide
