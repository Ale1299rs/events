#!/bin/bash

# 🏥 Health Check Script
# Controlla lo stato del bot e invia notifiche se qualcosa non va

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "🏥 Roma Events Bot - Health Check"
echo "=================================="
echo ""

# 1. Controlla se PM2 è installato
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 non installato!"
    exit 1
fi
print_success "PM2 installato"

# 2. Controlla se il bot è running
if pm2 describe roma-events-bot &> /dev/null; then
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="roma-events-bot") | .pm2_env.status')

    if [ "$STATUS" = "online" ]; then
        print_success "Bot status: ONLINE"
    else
        print_error "Bot status: $STATUS"
        print_warning "Riavvio del bot..."
        pm2 restart roma-events-bot
    fi
else
    print_error "Bot non trovato in PM2!"
    exit 1
fi

# 3. Controlla uptime
UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="roma-events-bot") | .pm2_env.pm_uptime')
UPTIME_HOURS=$((( $(date +%s) - $UPTIME / 1000 ) / 3600))
print_success "Uptime: $UPTIME_HOURS ore"

# 4. Controlla memoria
MEMORY=$(pm2 jlist | jq -r '.[] | select(.name=="roma-events-bot") | .monit.memory')
MEMORY_MB=$((MEMORY / 1024 / 1024))
if [ $MEMORY_MB -gt 300 ]; then
    print_warning "Memoria alta: ${MEMORY_MB}MB (limite 300MB)"
    print_warning "Riavvio del bot per liberare memoria..."
    pm2 restart roma-events-bot
else
    print_success "Memoria: ${MEMORY_MB}MB"
fi

# 5. Controlla restarts
RESTARTS=$(pm2 jlist | jq -r '.[] | select(.name=="roma-events-bot") | .pm2_env.restart_time')
if [ $RESTARTS -gt 10 ]; then
    print_warning "Troppi restart: $RESTARTS"
    print_warning "Controlla i logs per errori!"
else
    print_success "Restarts: $RESTARTS"
fi

# 6. Controlla temperatura Raspberry Pi
if command -v vcgencmd &> /dev/null; then
    TEMP=$(vcgencmd measure_temp | cut -d'=' -f2 | cut -d"'" -f1)
    TEMP_INT=${TEMP%.*}

    if [ $TEMP_INT -gt 80 ]; then
        print_error "Temperatura alta: ${TEMP}°C"
        print_warning "Aggiungi raffreddamento!"
    elif [ $TEMP_INT -gt 70 ]; then
        print_warning "Temperatura: ${TEMP}°C"
    else
        print_success "Temperatura: ${TEMP}°C"
    fi
fi

# 7. Controlla spazio disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    print_error "Spazio disco quasi esaurito: ${DISK_USAGE}%"
    print_warning "Pulisci i logs vecchi!"
elif [ $DISK_USAGE -gt 80 ]; then
    print_warning "Spazio disco: ${DISK_USAGE}%"
else
    print_success "Spazio disco: ${DISK_USAGE}%"
fi

# 8. Controlla connessione internet
if ping -c 1 api.telegram.org &> /dev/null; then
    print_success "Connessione internet: OK"
else
    print_error "Connessione internet: FALLITA"
    print_warning "Controlla la connessione di rete!"
fi

# 9. Mostra ultimi logs
echo ""
echo "📋 Ultimi logs (ultime 10 righe):"
echo "=================================="
pm2 logs roma-events-bot --lines 10 --nostream

echo ""
echo "✅ Health check completato!"
echo ""
echo "💡 Comandi utili:"
echo "   pm2 status              - Status completo"
echo "   pm2 logs                - Visualizza logs"
echo "   pm2 monit               - Monitor live"
echo "   pm2 restart roma-events-bot - Riavvia bot"
