"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
};

type CartItem = Product & {
  quantity: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
 useEffect(() => {
  fetch("http://localhost:3000/api/products")
    .then((res) => res.json())
    .then((data) => setProducts(data));

  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    setCart(JSON.parse(savedCart));
  }
}, []);

useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };
  const checkout = () => {
  alert("🎉 ¡Compra realizada con éxito!");

  setCart([]);
  localStorage.removeItem("cart");
};

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        🌽 Elotes de la Fuente
      </h1>

      {/* CARRITO */}
      <div style={{ marginBottom: "30px" }}>
        <h2>🛒 Carrito</h2>

        {cart.length === 0 ? (
          <p>Carrito vacío</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#f5f5f5",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              <p>
                {item.name} x{item.quantity}
              </p>
              <p>${item.price * item.quantity}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                Eliminar
              </button>
            </div>
          ))
        )}

        <h3>Total: ${total}</h3>
        <button
  onClick={checkout}
  style={{
    background: "green",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px",
    cursor: "pointer",
  }}
>
  Comprar
</button>
      </div>

      {/* PRODUCTOS */}
      <h2>Productos</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{product.name}</h3>
            <p>${product.price}</p>

            <button
              onClick={() => addToCart(product)}
              style={{
                background: "black",
                color: "white",
                padding: "8px 12px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Agregar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}