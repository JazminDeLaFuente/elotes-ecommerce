## ELOTES DE LA FUENTE

Tienda en linea para `ELOTES DE LA FUENTE` construida con `Next.js`, `React` y `Prisma`.

Incluye:
- storefront con identidad de marca
- carrito persistente
- checkout con datos de entrega
- panel admin para pedidos e inventario
- seed local de productos

## Variables

Crea tu `.env` a partir de [`.env.example`](/Users/macbookair2020/Desktop/ElotesDELAFUENTE/elotes-ecommerce/.env.example).

Variables principales:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
NEXT_PUBLIC_SITE_URL="https://elotesdelafuente.com"
NEXT_PUBLIC_WHATSAPP_PHONE="528100000000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="cambia-esta-clave"
```

`/admin` esta protegido con Basic Auth usando `ADMIN_USERNAME` y `ADMIN_PASSWORD`.

## Getting Started

Instala dependencias y corre desarrollo:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Base de datos

Aplicar migraciones:

```bash
npx prisma migrate deploy
```

Poblar productos de ejemplo:

```bash
npm run seed
```

## Deploy

Recomendado:

1. Subir a Vercel
2. Configurar una base PostgreSQL remota
3. Definir `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_WHATSAPP_PHONE`
4. Ejecutar migraciones en producción

Build local:

```bash
npm run build
npm run start
```

## Rutas utiles

- Tienda: `/`
- Admin: `/admin`
- Productos API: `/api/products`
- Pedidos API: `/api/orders`

## Siguientes pasos sugeridos

- panel admin con cambios de estado de pedido
- autenticacion para administradores
- pagos reales
- inventario editable
