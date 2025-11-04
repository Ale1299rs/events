# 🍓 Setup Raspberry Pi - Roma Events Bot

Guida completa per configurare il tuo Raspberry Pi come server 24/7 per il bot Telegram.

## 📋 Requisiti

- **Raspberry Pi** (3, 4, o 5 - consigliato 4 con almeno 2GB RAM)
- **Raspberry Pi OS** (Lite o Desktop)
- **Connessione Internet** stabile (WiFi o Ethernet - consigliato Ethernet)
- **MicroSD Card** (minimo 16GB, consigliato 32GB Classe 10)
- **Alimentatore** ufficiale Raspberry Pi

## 🚀 Setup Automatico (Consigliato)

### Opzione 1: Script Automatico

```bash
# Scarica e esegui lo script di installazione
curl -sL https://raw.githubusercontent.com/TUO_USERNAME/events/main/install.sh | bash
```

Oppure, se hai già clonato il repository:

```bash
cd ~/events
chmod +x install.sh
./install.sh
```

Lo script installerà automaticamente:
- ✅ Node.js 20 LTS
- ✅ PM2 (process manager)
- ✅ Dipendenze del progetto
- ✅ Configurazione auto-start
- ✅ Ottimizzazioni Raspberry Pi

## 🛠️ Setup Manuale (Passo per Passo)

### 1. Aggiorna il Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

### 2. Installa Node.js 20

```bash
# Scarica e installa Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifica installazione
node -v  # Dovrebbe mostrare v20.x.x
npm -v
```

### 3. Clona il Repository

```bash
# Vai nella home directory
cd ~

# Clona il repository
git clone https://github.com/TUO_USERNAME/events.git
cd events

# Checkout del branch corretto
git checkout claude/oo-implementation-011CUoaqqXpMsrZQ9JQrxCgu
```

### 4. Configura le Credenziali

```bash
# Crea il file .env dalle tue credenziali
nano .env
```

Copia il contenuto del tuo `.env` (quello con le credenziali che ti ho dato prima):

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

### 5. Installa le Dipendenze

```bash
npm install --production
```

### 6. Configura il Database Supabase

Prima di avviare il bot, devi configurare il database:

1. Apri https://app.supabase.com sul tuo computer
2. Seleziona il progetto
3. Vai su **SQL Editor**
4. Copia il contenuto di `database-schema.sql`
5. Incolla e clicca **Run**

### 7. Installa PM2 (Process Manager)

```bash
# Installa PM2 globalmente
sudo npm install -g pm2

# Verifica installazione
pm2 -v
```

### 8. Avvia il Bot con PM2

```bash
# Avvia il bot
pm2 start ecosystem.config.js

# Verifica che sia running
pm2 status

# Visualizza i logs
pm2 logs roma-events-bot
```

### 9. Configura Auto-Start al Boot

```bash
# Salva la configurazione PM2
pm2 save

# Genera lo script di avvio automatico
pm2 startup

# Copia e esegui il comando che PM2 ti mostra (sarà simile a):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
```

## ✅ Verifica Funzionamento

### Test del Bot

```bash
# Verifica che il bot sia attivo
pm2 status

# Visualizza i logs in tempo reale
pm2 logs roma-events-bot --lines 50

# Verifica la memoria usata
pm2 monit
```

### Test su Telegram

1. Cerca il tuo bot su Telegram
2. Invia `/start`
3. Dovresti ricevere il messaggio di benvenuto! 🎉

### Test dello Scraping

```bash
# Test manuale scraping (senza PM2)
npm run scrape
```

## 🎛️ Comandi PM2 Utili

```bash
# Visualizza status
pm2 status

# Visualizza logs
pm2 logs roma-events-bot

# Riavvia il bot
pm2 restart roma-events-bot

# Ferma il bot
pm2 stop roma-events-bot

# Rimuovi il bot da PM2
pm2 delete roma-events-bot

# Monitoraggio risorse
pm2 monit

# Informazioni dettagliate
pm2 show roma-events-bot
```

## 🔧 Gestione e Manutenzione

### Aggiornare il Bot

```bash
cd ~/events

# Ferma il bot
pm2 stop roma-events-bot

# Aggiorna il codice
git pull origin claude/oo-implementation-011CUoaqqXpMsrZQ9JQrxCgu

# Aggiorna dipendenze se necessario
npm install --production

# Riavvia il bot
pm2 restart roma-events-bot
```

Oppure usa lo script automatico:

```bash
./update.sh
```

### Visualizzare i Logs

```bash
# Logs in tempo reale
pm2 logs roma-events-bot

# Ultimi 100 logs
pm2 logs roma-events-bot --lines 100

# Pulisci i logs vecchi
pm2 flush
```

### Backup del Database

Il database è su Supabase quindi è già backuppato automaticamente! ✅

### Monitoraggio Risorse

```bash
# Monitoraggio CPU/RAM
pm2 monit

# Info sistema
htop

# Temperatura Raspberry Pi
vcgencmd measure_temp

# Spazio disco
df -h
```

## 🔒 Sicurezza

### 1. Aggiorna Regolarmente il Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Configura Firewall (Opzionale)

```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw enable
```

### 3. Cambia Password Default

```bash
passwd
```

### 4. Disabilita SSH con Password (Usa solo chiavi)

```bash
sudo nano /etc/ssh/sshd_config
# Cambia: PasswordAuthentication no
sudo systemctl restart ssh
```

## ⚡ Ottimizzazioni Raspberry Pi

### 1. Disabilita Bluetooth (se non serve)

```bash
sudo nano /boot/config.txt
# Aggiungi: dtoverlay=disable-bt
sudo systemctl disable bluetooth
sudo reboot
```

### 2. Disabilita WiFi (se usi Ethernet)

```bash
sudo nano /boot/config.txt
# Aggiungi: dtoverlay=disable-wifi
sudo reboot
```

### 3. Riduci la GPU Memory (per Raspberry Pi Lite)

```bash
sudo nano /boot/config.txt
# Aggiungi o modifica: gpu_mem=16
sudo reboot
```

### 4. Abilita Swap (se hai poca RAM)

```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Cambia: CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## 📊 Monitoring Remoto

### Opzione 1: PM2 Plus (Gratuito per 1 server)

```bash
pm2 link <secret_key> <public_key>
```

Ottieni le chiavi su: https://app.pm2.io

### Opzione 2: Telegram Notifications

Il bot può inviarti notifiche se qualcosa va storto (feature da implementare).

### Opzione 3: Uptime Monitoring

Usa servizi come:
- **UptimeRobot** (gratuito)
- **Better Uptime**
- **Pingdom**

## 🐛 Risoluzione Problemi

### Il bot non parte

```bash
# Controlla i logs
pm2 logs roma-events-bot --err

# Verifica Node.js
node -v

# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install --production
```

### Memoria Insufficiente

```bash
# Abilita swap (vedi sopra)
# Oppure riduci SCRAPE_INTERVAL nel .env
# SCRAPE_INTERVAL=120  # Ogni 2 ore invece che ogni ora
```

### Il Raspberry Pi si blocca

- Verifica alimentatore (deve essere 5V 3A minimo per Pi 4)
- Controlla temperatura: `vcgencmd measure_temp`
- Aggiungi dissipatori o ventola se > 80°C

### Errori di connessione

```bash
# Test connessione internet
ping -c 4 google.com

# Test DNS
nslookup google.com

# Riavvia networking
sudo systemctl restart networking
```

### Git pull fallisce

```bash
# Salva modifiche locali
git stash

# Pull
git pull

# Ripristina modifiche
git stash pop
```

## 📱 Accesso Remoto al Raspberry Pi

### Opzione 1: SSH Locale

```bash
# Dal tuo computer sulla stessa rete
ssh pi@192.168.1.XXX
```

### Opzione 2: Tailscale (VPN facile)

```bash
# Installa Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Ora puoi accedere da ovunque!

### Opzione 3: Port Forwarding

Configura il router per aprire la porta SSH (22) verso il Raspberry Pi.
⚠️ Usa solo con autenticazione a chiave!

## 🔄 Automatizzare Aggiornamenti

### Cron Job per Aggiornamenti Automatici

```bash
# Modifica crontab
crontab -e

# Aggiungi (aggiornamento automatico ogni domenica alle 3 AM):
0 3 * * 0 cd ~/events && ./update.sh >> ~/update.log 2>&1
```

## 💡 Tips Pro

1. **Usa Ethernet invece di WiFi** per maggiore stabilità
2. **Alimentatore ufficiale** Raspberry Pi per evitare problemi
3. **SD Card di qualità** (SanDisk Extreme Pro, Samsung EVO)
4. **Backup della SD Card** periodicamente
5. **Monitoring 24/7** con PM2 Plus o Uptime Robot
6. **Logs rotation** per non riempire la SD

## 📈 Statistiche e Monitoring

### Dashboard PM2

```bash
pm2 web
# Apri http://raspberry-pi-ip:9615
```

### Logs Aggregati

```bash
# Installa multitail per visualizzare più logs
sudo apt install multitail
multitail ~/.pm2/logs/*.log
```

## 🆘 Supporto

Se hai problemi:

1. Controlla i logs: `pm2 logs`
2. Verifica status: `pm2 status`
3. Testa connessione: `ping api.telegram.org`
4. Riavvia: `pm2 restart roma-events-bot`
5. Ultimo resort: `sudo reboot`

## ✨ Il Tuo Bot è Pronto!

Il tuo Raspberry Pi è ora un server 24/7 per il bot Roma Events! 🎉

```bash
# Verifica finale
pm2 status
pm2 logs roma-events-bot --lines 20
```

Ogni ora il bot:
- 🔍 Scarica nuovi eventi
- 🤖 Li categorizza con AI
- 💾 Li salva nel database
- 📱 Notifica gli utenti interessati

**Tutto in automatico, 24/7!** 🚀
