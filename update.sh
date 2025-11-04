#!/bin/bash

# 🔄 Roma Events Bot - Update Script
# Script per aggiornare il bot alla versione più recente

set -e

echo "🔄 =============================================="
echo "   Roma Events Bot - Update"
echo "   =============================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Ferma il bot
print_info "Fermando il bot..."
pm2 stop roma-events-bot || true
print_success "Bot fermato"

# 2. Salva modifiche locali (se presenti)
print_info "Controllo modifiche locali..."
git stash
print_success "Modifiche salvate temporaneamente"

# 3. Aggiorna il codice
print_info "Aggiornamento codice da GitHub..."
git pull origin claude/oo-implementation-011CUoaqqXpMsrZQ9JQrxCgu
print_success "Codice aggiornato"

# 4. Ripristina modifiche locali (se presenti)
git stash pop || true

# 5. Aggiorna dipendenze
print_info "Aggiornamento dipendenze..."
npm install --production
print_success "Dipendenze aggiornate"

# 6. Riavvia il bot
print_info "Riavvio del bot..."
pm2 restart roma-events-bot
print_success "Bot riavviato"

# 7. Salva configurazione
pm2 save

echo ""
echo "✨ =============================================="
echo "   Aggiornamento Completato!"
echo "   =============================================="
echo ""
print_success "Il bot è stato aggiornato e riavviato!"
echo ""
echo "📋 Visualizza i logs:"
echo "   pm2 logs roma-events-bot"
echo ""
