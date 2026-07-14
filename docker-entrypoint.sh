#!/bin/sh
set -e

echo "Aguardando o banco de dados ficar disponível..."
until echo "SELECT 1;" | npx prisma db execute --stdin --schema=./prisma/schema.prisma > /dev/null 2>&1; do
  sleep 1
done

echo "Aplicando migrações do banco de dados..."
npx prisma migrate deploy

echo "Populando catálogo de serviços e usuário administrador padrão..."
npx prisma db seed

echo "Iniciando aplicação..."
exec "$@"
