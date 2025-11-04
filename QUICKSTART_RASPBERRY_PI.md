# 🚀 Quick Start - Raspberry Pi

Guida veloce per mettere online il bot in **10 minuti**!

## ⚡ Setup Ultra-Rapido

### 1. Prepara il Raspberry Pi

```bash
# SSH nel tuo Raspberry Pi
ssh pi@192.168.1.XXX

# Aggiorna sistema
sudo apt update && sudo apt upgrade -y
```

### 2. Installa Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
```

### 3. Clona e Configura

```bash
# Clona il repository
cd ~
git clone https://github.com/TUO_USERNAME/events.git
cd events

# Crea il file .env
nano .env
```

**Copia e incolla questo nel file .env:**

```env
TELEGRAM_BOT_TOKEN=8373590031:AAFLL6y04Oy7M2OC0ehymEhj_KWPihssCl0
GEMINI_API_KEY=AIzaSyBN1CCtnMsz45GMz-P6DOEWiI89NCQ0d8s
SUPABASE_URL=https://nutwtcgybeoedgcihgmxqd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dHdjZ3liZW9kZ2NpaGdteHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MjQ3NzUsImV4cCI6MjA3NzQwMDc3NX0.aUKF_KjzdOVrs2KOnipbtFmrp2pQz3J2dZydq5jB6lE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dHdjZ3liZW9kZ2NpaGdteHFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgyNDc3NSwiZXhwIjoyMDc3NDAwNzc1fQ.llnFJpX4eY3zrajb35T7NcQIyQ1hdgem54hFee6Xm7o
NODE_ENV=production
SCRAPE_INTERVAL=60
```

Salva con `CTRL+O`, `ENTER`, `CTRL+X`

### 4. Configura Database Supabase

**Sul tuo computer:**

1. Apri https://app.supabase.com
2. Seleziona il progetto
3. Vai su **SQL Editor**
4. Copia il contenuto di `database-schema.sql` (dal repository)
5. Incolla e clicca **Run**

✅ Database pronto!

### 5. Installa e Avvia (Automatico)

```bash
# Torna sul Raspberry Pi
./install.sh
```

Lo script installerà tutto automaticamente! 🎉

## 🎯 Setup Manuale (se preferisci)

Se preferisci fare tutto manualmente:

```bash
# Installa dipendenze
npm install --production

# Installa PM2
sudo npm install -g pm2

# Crea directory logs
mkdir -p logs

# Avvia il bot
pm2 start ecosystem.config.js

# Salva configurazione
pm2 save

# Auto-start al boot
pm2 startup
# Esegui il comando che ti viene mostrato
```

## ✅ Verifica che Funzioni

```bash
# Controlla status
pm2 status

# Visualizza logs
pm2 logs roma-events-bot

# Se vedi "🤖 Bot started successfully!" è tutto OK! ✅
```

## 📱 Testa su Telegram

1. Apri Telegram
2. Cerca il tuo bot
3. Invia `/start`
4. Dovresti ricevere il messaggio di benvenuto! 🎉

## 🔧 Comandi Essenziali

```bash
# Visualizza logs in tempo reale
pm2 logs roma-events-bot

# Riavvia bot
pm2 restart roma-events-bot

# Ferma bot
pm2 stop roma-events-bot

# Status
pm2 status

# Monitor CPU/RAM
pm2 monit
```

## 🔄 Aggiornare il Bot

```bash
cd ~/events
./update.sh
```

## 🐛 Problemi?

### Il bot non parte

```bash
# Visualizza errori
pm2 logs roma-events-bot --err

# Riavvia
pm2 restart roma-events-bot
```

### Memoria piena

```bash
# Pulisci logs
pm2 flush

# Controlla spazio
df -h
```

### Bot non risponde su Telegram

1. Verifica che il token sia corretto nel `.env`
2. Controlla i logs: `pm2 logs`
3. Riavvia: `pm2 restart roma-events-bot`

## 📊 Monitoraggio

### Online 24/7?

```bash
pm2 status
# Se vedi "online" è tutto OK! ✅
```

### Quanta memoria usa?

```bash
pm2 monit
# Dovresti vedere ~100-200MB RAM usage
```

### Controlla temperatura Raspberry Pi

```bash
vcgencmd measure_temp
# Dovrebbe essere < 80°C
```

## 🎉 Fatto!

Il tuo bot è ora online 24/7 sul Raspberry Pi! 🚀

**Cosa succede automaticamente:**
- ⏰ Ogni ora cerca nuovi eventi
- 🤖 Li categorizza con AI
- 💾 Li salva nel database
- 📱 Notifica gli utenti interessati
- 🔄 Si riavvia automaticamente se crasha
- 🚀 Si avvia automaticamente al boot del Raspberry Pi

## 📚 Guide Dettagliate

- **Setup completo**: Leggi `RASPBERRY_PI_SETUP.md`
- **Documentazione**: Leggi `README.md`
- **Setup database**: Leggi `SETUP_GUIDE.md`

## 💡 Tips

1. Usa Ethernet per connessione più stabile
2. Controlla i logs periodicamente
3. Fai backup della SD card
4. Monitora la temperatura
5. Aggiorna il bot regolarmente con `./update.sh`

---

**Domande? Problemi?**
Controlla prima i logs: `pm2 logs roma-events-bot`
