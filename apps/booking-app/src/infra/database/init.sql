CREATE USER docker;

-- SELECT 'CREATE DATABASE booking' 
-- WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'booking')\gexec
CREATE DATABASE IF NOT EXISTS booking;

GRANT ALL PRIVILEGES ON DATABASE booking TO docker;
