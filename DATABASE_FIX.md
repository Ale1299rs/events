# Guida alla Risoluzione del Problema del Database

## Problema
Errore: `foreign key constraint "fk_user" cannot be implemented - Key columns "user_id" and "id" are of incompatible types: bigint and uuid`

## Causa
La tabella `users` potrebbe essere già stata creata con tipo `UUID` invece di `BIGINT`, oppure c'è un conflitto con tabelle esistenti.

## Soluzione

### Passo 1: Verifica lo stato attuale
1. Vai su https://app.supabase.com
2. Seleziona il tuo progetto
3. Vai a **SQL Editor**
4. Copia e incolla il contenuto di `database-diagnostic.sql`
5. Esegui la query per vedere lo stato attuale delle tabelle

### Passo 2: Elimina le tabelle esistenti
**ATTENZIONE: Questo cancellerà tutti i dati!**

1. Nel SQL Editor di Supabase
2. Copia e incolla il contenuto di `database-cleanup.sql`
3. Esegui la query

Il risultato dovrebbe mostrare:
```
DROP TABLE
DROP TABLE
DROP TABLE
DROP TABLE
DROP TABLE
DROP TABLE
DROP FUNCTION
```

### Passo 3: Ricrea le tabelle con lo schema corretto
1. Nel SQL Editor di Supabase
2. Copia e incolla **TUTTO** il contenuto di `database-schema.sql`
3. Esegui la query

Se tutto funziona, dovresti vedere:
```
CREATE EXTENSION
CREATE TABLE (users)
CREATE TABLE (categories)
CREATE TABLE (events)
CREATE TABLE (user_subscriptions)
CREATE TABLE (user_preferences)
CREATE TABLE (sent_notifications)
INSERT 0 10 (categories)
CREATE INDEX (vari indici)
CREATE FUNCTION
CREATE TRIGGER (3 trigger)
```

## Verifica

Dopo aver eseguito lo schema, verifica che tutto sia corretto eseguendo:

```sql
-- Verifica struttura users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';
-- Dovrebbe restituire: id | bigint

-- Verifica le categorie
SELECT COUNT(*) FROM categories;
-- Dovrebbe restituire: 10

-- Verifica le foreign key
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
-- Dovrebbe mostrare tutte le foreign key senza errori
```

## File Creati

- `database-diagnostic.sql` - Query per diagnosticare lo stato del database
- `database-cleanup.sql` - Script per eliminare tutte le tabelle
- `database-schema.sql` - Schema completo e corretto del database
- `DATABASE_FIX.md` - Questa guida

## Note Importanti

1. **BIGINT per user_id**: Gli ID di Telegram sono numeri interi molto grandi (es: 123456789), quindi usiamo BIGINT
2. **UUID per tutto il resto**: Categorie, eventi, notifiche usano UUID generati automaticamente
3. **Foreign Key esplicite**: Usiamo CONSTRAINT nominati per evitare problemi di inferenza dei tipi
4. **Ordine delle tabelle**: Le tabelle devono essere create in questo ordine:
   - users
   - categories
   - events (dipende da categories)
   - user_subscriptions (dipende da users e categories)
   - user_preferences (dipende da users)
   - sent_notifications (dipende da users ed events)

## Se il Problema Persiste

Se dopo aver seguito tutti i passaggi l'errore persiste:

1. Controlla che non ci siano altre sessioni che stanno modificando il database
2. Verifica di non avere Row Level Security (RLS) policies che potrebbero interferire
3. Controlla i log di Supabase per errori più dettagliati
4. Assicurati di avere i permessi necessari (usa il Service Role Key se necessario)
