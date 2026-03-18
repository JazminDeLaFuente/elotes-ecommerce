import Link from "next/link";
import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      stock: "asc",
    },
  });

  const orders = await prisma.order.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalItems = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  return (
    <main className="admin-shell">
      <section className="admin-hero panel">
        <div>
          <p className="hero-kicker">Panel de pedidos</p>
          <h1>Admin de Elotes de la Fuente</h1>
          <p className="hero-copy">
            Aqui puedes revisar pedidos confirmados, datos de entrega y el resumen
            de venta generado por la tienda.
          </p>
        </div>
        <div className="admin-actions">
          <Link className="button-secondary" href="/">
            Volver a la tienda
          </Link>
        </div>
      </section>

      <section className="admin-stats">
        <article className="panel stat-card">
          <span className="stat-label">Pedidos</span>
          <strong>{orders.length}</strong>
        </article>
        <article className="panel stat-card">
          <span className="stat-label">Articulos vendidos</span>
          <strong>{totalItems}</strong>
        </article>
        <article className="panel stat-card">
          <span className="stat-label">Ventas acumuladas</span>
          <strong>{currencyFormatter.format(totalSales)}</strong>
        </article>
      </section>

      <section className="admin-orders">
        <div className="section-heading">
          <div>
            <h2>Inventario actual</h2>
            <p>Vista rapida del stock disponible para operacion diaria.</p>
          </div>
        </div>

        <div className="inventory-grid">
          {products.map((product) => {
            const stockState =
              product.stock <= 5
                ? "low"
                : product.stock <= 0
                  ? "out"
                  : "ok";

            return (
              <article className="panel inventory-card" key={product.id}>
                <div className="inventory-card-header">
                  <div className="inventory-icon" aria-hidden="true">
                    {product.image}
                  </div>
                  <div>
                    <h3>{product.name}</h3>
                    <p className="meta-text">{currencyFormatter.format(product.price)}</p>
                  </div>
                </div>
                <p className="inventory-description">{product.description}</p>
                <div className="inventory-footer">
                  <span className={`inventory-badge ${stockState}`}>
                    {product.stock <= 0
                      ? "Sin stock"
                      : product.stock <= 5
                        ? "Stock bajo"
                        : "Disponible"}
                  </span>
                  <strong>{product.stock} unidades</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="admin-orders">
        <div className="section-heading">
          <div>
            <h2>Pedidos recientes</h2>
            <p>Listado de compras guardadas desde el checkout.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="panel empty-state">
            Aun no hay pedidos guardados. Haz una compra en la tienda para verlos aqui.
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <article className="panel order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <p className="order-kicker">Pedido</p>
                    <h3>{order.customerName || "Cliente sin nombre"}</h3>
                    <p className="meta-text">{order.customerEmail || "Sin correo"}</p>
                  </div>
                  <div className="order-total-block">
                    <span className="order-status">{order.status}</span>
                    <strong>{currencyFormatter.format(order.total)}</strong>
                  </div>
                </div>

                <div className="order-grid">
                  <div className="order-section">
                    <h4>Entrega</h4>
                    <p>{order.deliveryAddress || "Sin direccion registrada"}</p>
                    <p className="meta-text">{order.customerPhone || "Sin telefono"}</p>
                    {order.deliveryNotes ? (
                      <p className="order-note">{order.deliveryNotes}</p>
                    ) : null}
                  </div>

                  <div className="order-section">
                    <h4>Productos</h4>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div className="order-item-row" key={item.id}>
                          <span>
                            {item.product.name} x{item.quantity}
                          </span>
                          <strong>{currencyFormatter.format(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
