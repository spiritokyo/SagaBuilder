#!/bin/sh

set -e

echo "Initializing database from ./init-dastabase.sh..."

psql -d postgres -c "CREATE USER docker;" 
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE booking TO docker;" 

psql -d postgres -c "ALTER SYSTEM SET wal_level = logical;" 
