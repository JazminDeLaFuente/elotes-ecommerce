"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const productHighlights = [
  "Preparado al momento",
  "Salsas y toppings al gusto",
  "Ideal para pedidos locales",
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasHydratedCart, setHasHydratedCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos.");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch {
        setError("No pudimos cargar el menu por ahora.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    setHasHydratedCart(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedCart) {
      return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hasHydratedCart]);

  const addToCart = (product: Product) => {
    setCheckoutMessage("");
    setCheckoutStatus("idle");

    if (product.stock <= 0) {
      return;
    }

    const existing = cart.find((item) => item.id === product.id);

    if (existing && existing.quantity < product.stock) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else if (!existing) {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCheckoutMessage("");
    setCheckoutStatus("idle");
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckoutFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setCheckoutMessage("");
    setCheckoutStatus("idle");
    setCheckoutForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const checkout = async () => {
    if (cart.length === 0) {
      return;
    }

    if (
      !checkoutForm.name.trim() ||
      !checkoutForm.email.trim() ||
      !checkoutForm.phone.trim() ||
      !checkoutForm.address.trim()
    ) {
      setCheckoutMessage("Completa nombre, correo, telefono y direccion.");
      setCheckoutStatus("error");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutMessage("");
    setCheckoutStatus("idle");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          customer: checkoutForm,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "No se pudo completar la compra.");
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) => {
          const cartItem = cart.find((item) => item.id === product.id);

          if (!cartItem) {
            return product;
          }

          return {
            ...product,
            stock: Math.max(product.stock - cartItem.quantity, 0),
          };
        })
      );
      setCart([]);
      localStorage.removeItem("cart");
      setCheckoutForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      setCheckoutMessage(data.message || "Tu pedido fue guardado correctamente.");
      setCheckoutStatus("success");
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "No se pudo completar la compra.";

      setCheckoutMessage(message);
      setCheckoutStatus("error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const renderProductVisual = (product: Product) => {
    const image = product.image.trim();
    const isImageUrl =
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/");

    if (isImageUrl) {
      return <img alt={product.name} className="product-image" src={image} />;
    }

    return image || "🌽";
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="hero-kicker">Antojitos con sabor a casa</p>
        <div className="hero-grid">
          <div>
            <h1>Elotes, esquites y botanitas con toque de la fuente.</h1>
            <p className="hero-copy">
              Tu nuevo proyecto ya tiene una base de tienda en linea. Deje esta
              portada lista para crecer con pedidos, autenticacion y checkout
              real, pero desde ahora ya se siente como una marca.
            </p>
            <div className="hero-badges">
              {productHighlights.map((highlight) => (
                <span className="pill" key={highlight}>
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <aside className="panel cart-panel">
            <h2>Tu carrito</h2>
            <p>{totalItems} articulo(s) agregados</p>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-state">
                  Agrega un producto para empezar a armar tu pedido.
                </div>
              ) : (
                cart.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-summary-row">
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.quantity} x {currencyFormatter.format(item.price)}
                        </p>
                      </div>
                      <strong>{currencyFormatter.format(item.price * item.quantity)}</strong>
                    </div>
                    <p className="meta-text">Stock disponible: {item.stock}</p>
                    <button
                      className="button-danger"
                      onClick={() => removeFromCart(item.id)}
                      type="button"
                    >
                      Quitar
                    </button>
                  </article>
                ))
              )}
            </div>

            <div className="cart-summary">
              <div className="checkout-form">
                <div className="checkout-form-header">
                  <h3>Datos de entrega</h3>
                  <p>Estos datos se guardan junto con tu pedido.</p>
                </div>
                <label className="field">
                  <span>Nombre</span>
                  <input
                    name="name"
                    onChange={handleCheckoutFieldChange}
                    placeholder="Tu nombre"
                    type="text"
                    value={checkoutForm.name}
                  />
                </label>
                <label className="field">
                  <span>Correo</span>
                  <input
                    name="email"
                    onChange={handleCheckoutFieldChange}
                    placeholder="correo@ejemplo.com"
                    type="email"
                    value={checkoutForm.email}
                  />
                </label>
                <label className="field">
                  <span>Telefono</span>
                  <input
                    name="phone"
                    onChange={handleCheckoutFieldChange}
                    placeholder="81 0000 0000"
                    type="tel"
                    value={checkoutForm.phone}
                  />
                </label>
                <label className="field">
                  <span>Direccion</span>
                  <textarea
                    name="address"
                    onChange={handleCheckoutFieldChange}
                    placeholder="Calle, numero, colonia y referencias"
                    rows={3}
                    value={checkoutForm.address}
                  />
                </label>
                <label className="field">
                  <span>Notas para el pedido</span>
                  <textarea
                    name="notes"
                    onChange={handleCheckoutFieldChange}
                    placeholder="Sin chile, extra queso, tocar al llegar..."
                    rows={3}
                    value={checkoutForm.notes}
                  />
                </label>
              </div>
              <div className="cart-summary-row">
                <span>Total</span>
                <span className="cart-total">{currencyFormatter.format(total)}</span>
              </div>
              {checkoutMessage ? (
                <div className={`status-message ${checkoutStatus === "error" ? "error" : ""}`}>
                  {checkoutMessage}
                </div>
              ) : null}
              <button
                className="button-primary"
                disabled={cart.length === 0 || isCheckingOut}
                onClick={checkout}
                type="button"
              >
                {isCheckingOut ? "Procesando..." : "Finalizar compra"}
              </button>
              <p className="checkout-note">
                El checkout ya guarda ordenes reales en Prisma con control de stock.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel catalog-panel">
          <div className="section-heading">
            <div>
              <h2>Menu disponible</h2>
              <p>Productos sincronizados desde Prisma.</p>
            </div>
            <button className="button-secondary" type="button">
              {products.length} producto(s)
            </button>
          </div>

          {isLoading ? (
            <div className="status-message">Cargando productos...</div>
          ) : error ? (
            <div className="status-message error">{error}</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              Aun no hay productos registrados en la base de datos.
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;

                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-emoji" aria-hidden="true">
                      {renderProductVisual(product)}
                    </div>
                    <div>
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                    </div>
                    <div className="product-footer">
                      <div>
                        <div className="price">
                          {currencyFormatter.format(product.price)}
                        </div>
                        <div className="stock">
                          {isOutOfStock
                            ? "Agotado"
                            : `${product.stock} disponibles`}
                        </div>
                      </div>
                      <button
                        className="button-primary"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product)}
                        type="button"
                      >
                        {isOutOfStock ? "Sin stock" : "Agregar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
