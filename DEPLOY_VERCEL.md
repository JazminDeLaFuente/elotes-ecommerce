# Deploy en Vercel

## 1. Requisitos

- Repositorio en GitHub
- Proyecto de base de datos PostgreSQL remoto
- Dominio `elotesdelafuente.com`

## 2. Variables en Vercel

Configura estas variables en el proyecto:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require
NEXT_PUBLIC_SITE_URL=https://elotesdelafuente.com
NEXT_PUBLIC_WHATSAPP_PHONE=528100000000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=una-clave-segura-y-larga
```

## 3. Crear proyecto

1. Importa el repo en Vercel
2. Framework preset: `Next.js`
3. Root directory: `elotes-ecommerce` si importas desde la carpeta superior
4. Agrega variables de entorno
5. Haz deploy

## 4. Base de datos

Antes de usar produccion:

```bash
npx prisma migrate deploy
```

Si quieres datos de ejemplo:

```bash
npm run seed
```

## 5. Dominio

En Vercel:

1. Abre tu proyecto
2. Ve a `Settings > Domains`
3. Agrega `elotesdelafuente.com`
4. Agrega tambien `www.elotesdelafuente.com` si lo deseas
5. Sigue los DNS que Vercel indique

## 6. Recomendado despues del primer deploy

- cambiar `ADMIN_PASSWORD`
- conectar una base remota real
- probar `/admin`
- probar compra completa
- probar enlace de WhatsApp
