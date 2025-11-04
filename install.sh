#!/bin/bash

# 🍓 Roma Events Bot - Raspberry Pi Installation Script
# Questo script installa automaticamente tutto il necessario per far girare il bot

set -e  # Exit on error

echo "🍓 =============================================="
echo "   Roma Events Bot - Raspberry Pi Setup"
echo "   =============================================="
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Controlla se sei root
if [ "$EUID" -eq 0 ]; then
    print_error "Non eseguire questo script come root! Usa: ./install.sh"
    exit 1
fi

# 1. Aggiorna il sistema
print_info "Aggiornamento del sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema aggiornato"

# 2. Installa dipendenze base
print_info "Installazione dipendenze base..."
sudo apt install -y git curl build-essential
print_success "Dipendenze base installate"

# 3. Controlla se Node.js è installato
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_success "Node.js $(node -v) già installato"
    else
        print_info "Node.js troppo vecchio, aggiornamento a v20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
        print_success "Node.js aggiornato a $(node -v)"
    fi
else
    print_info "Installazione Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js $(node -v) installato"
fi

# 4. Installa PM2
if command -v pm2 &> /dev/null; then
    print_success "PM2 già installato"
else
    print_info "Installazione PM2..."
    sudo npm install -g pm2
    print_success "PM2 installato"
fi

# 5. Crea directory logs se non esiste
print_info "Creazione directory logs..."
mkdir -p logs
print_success "Directory logs creata"

# 6. Installa dipendenze Node.js
print_info "Installazione dipendenze Node.js..."
npm install --production
print_success "Dipendenze installate"

# 7. Controlla se esiste il file .env
if [ ! -f .env ]; then
    print_info "File .env non trovato, creazione da template..."

    if [ -f .env.example ]; then
        cp .env.example .env
        print_info "⚠️  IMPORTANTE: Modifica il file .env con le tue credenziali!"
        print_info "Usa: nano .env"
        print_info ""
        print_info "Devi inserire:"
        print_info "  - TELEGRAM_BOT_TOKEN"
        print_info "  - GEMINI_API_KEY"
        print_info "  - SUPABASE_URL"
        print_info "  - SUPABASE_ANON_KEY"
        print_info "  - SUPABASE_SERVICE_ROLE_KEY"
        echo ""
        read -p "Premi ENTER quando hai configurato il file .env..."
    else
        print_error "File .env.example non trovato!"
        print_info "Crea manualmente il file .env con le credenziali"
        exit 1
    fi
else
    print_success "File .env già esistente"
fi

# 8. Test del database
print_info "Verifica configurazione database..."
print_info "⚠️  IMPORTANTE: Hai eseguito lo schema SQL su Supabase?"
print_info "1. Vai su https://app.supabase.com"
print_info "2. SQL Editor"
print_info "3. Copia e incolla il contenuto di database-schema.sql"
print_info "4. Clicca Run"
echo ""
read -p "Hai configurato il database? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Configura prima il database su Supabase!"
    exit 1
fi

# 9. Avvia il bot con PM2
print_info "Avvio del bot con PM2..."
pm2 start ecosystem.config.js
print_success "Bot avviato!"

# 10. Salva configurazione PM2
print_info "Salvataggio configurazione PM2..."
pm2 save
print_success "Configurazione salvata"

# 11. Configura auto-start
print_info "Configurazione auto-start al boot..."
pm2 startup | grep -E "^sudo" | bash
print_success "Auto-start configurato"

# 12. Mostra status
echo ""
echo "🎉 =============================================="
echo "   Installazione Completata!"
echo "   =============================================="
echo ""
print_success "Il bot è attivo e funzionante!"
echo ""
echo "📋 Comandi utili:"
echo "   pm2 status              - Visualizza status"
echo "   pm2 logs                - Visualizza logs"
echo "   pm2 restart roma-events-bot - Riavvia bot"
echo "   pm2 stop roma-events-bot    - Ferma bot"
echo "   pm2 monit               - Monitor risorse"
echo ""
echo "📱 Prossimi passi:"
echo "   1. Cerca il tuo bot su Telegram"
echo "   2. Invia /start"
echo "   3. Iscriviti alle categorie con /subscribe"
echo ""
echo "🔍 Visualizza i logs ora:"
pm2 logs roma-events-bot --lines 30
