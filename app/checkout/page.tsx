"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart, setQty, removeFromCart, clearCart, CartItem } from "@/lib/cart";
import { subscribe } from "@/lib/cart";

const CSS_VARS = `
  :root {
    --lhb-parchment: #f5f0e8;
    --lhb-parchment-dark: #ede5d0;
    --lhb-moss: #3d5a3e;
    --lhb-moss-light: #4e7350;
    --lhb-gold: #c8a882;
    --lhb-black: #1a1a18;
    --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    --font-body: var(--font-jost), 'Jost', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--lhb-parchment); color: #1a1a18; font-family: var(--font-body); }
`;

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());
    return subscribe(() => setItems(getCart()));
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Could not create checkout session.");
      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL returned.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS_VARS}</style>

      {/* NAV */}
      <nav
        style={{
          background: "var(--lhb-black)",
          borderBottom: "1px solid rgba(200,168,130,.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          height: 64,
        }}
      >
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends" width={140} />
        </Link>
        <Link
          href="/#shop"
          style={{
            color: "rgba(255,255,255,.7)",
            textDecoration: "none",
            fontFamily: "var(--font-body)",
            fontSize: ".75rem",
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          ← Continue Shopping
        </Link>
      </nav>

      {/* PAGE */}
      <div
        style={{
          maxWidth: 700,
          margin: "3rem auto",
          padding: "0 1.5rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 400,
            marginBottom: ".5rem",
          }}
        >
          Your Order
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: ".85rem",
            color: "#777",
            marginBottom: "2.5rem",
          }}
        >
          Review your items before proceeding to secure payment.
        </p>

        {items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              border: "1px solid rgba(200,168,130,.3)",
              borderRadius: "3px",
              background: "#fff",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌿</div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 400,
                marginBottom: ".75rem",
              }}
            >
              Your cart is empty
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: ".85rem",
                color: "#777",
                marginBottom: "1.5rem",
              }}
            >
              Add some blends to get started.
            </p>
            <Link
              href="/#shop"
              style={{
                display: "inline-block",
                padding: ".75rem 2rem",
                background: "var(--lhb-moss)",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "2px",
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
            >
              Shop the Collection
            </Link>
          </div>
        ) : (
          <>
            {/* Order Items */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(200,168,130,.25)",
                borderRadius: "3px",
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              {items.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "1.25rem 1.5rem",
                    borderBottom:
                      i < items.length - 1
                        ? "1px solid rgba(200,168,130,.15)"
                        : "none",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      flexShrink: 0,
                      background: "var(--lhb-parchment-dark)",
                      borderRadius: "2px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        marginBottom: ".2rem",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: ".8rem",
                        color: "#888",
                        fontFamily: "var(--font-body)",
                        marginBottom: ".5rem",
                      }}
                    >
                      ${item.price.toFixed(2)} each
                    </div>
                    {/* Qty controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        style={{
                          width: 26,
                          height: 26,
                          background: "var(--lhb-parchment-dark)",
                          border: "1px solid rgba(200,168,130,.4)",
                          borderRadius: "2px",
                          cursor: "pointer",
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1rem",
                          minWidth: 24,
                          textAlign: "center",
                        }}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        style={{
                          width: 26,
                          height: 26,
                          background: "var(--lhb-parchment-dark)",
                          border: "1px solid rgba(200,168,130,.4)",
                          borderRadius: "2px",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#bbb",
                          cursor: "pointer",
                          fontSize: ".7rem",
                          textDecoration: "underline",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      alignSelf: "flex-start",
                    }}
                  >
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(200,168,130,.25)",
                borderRadius: "3px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: ".6rem",
                  fontFamily: "var(--font-body)",
                  fontSize: ".85rem",
                  color: "#666",
                }}
              >
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: ".6rem",
                  fontFamily: "var(--font-body)",
                  fontSize: ".85rem",
                  color: "#666",
                }}
              >
                <span>Shipping</span>
                <span>Calculated at payment</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: ".75rem",
                  borderTop: "1px solid rgba(200,168,130,.2)",
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: ".75rem 1rem",
                  background: "#fff0f0",
                  border: "1px solid #ffcccc",
                  borderRadius: "2px",
                  color: "#cc0000",
                  fontFamily: "var(--font-body)",
                  fontSize: ".85rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                background: loading ? "#888" : "var(--lhb-moss)",
                color: "#fff",
                border: "none",
                borderRadius: "2px",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                fontSize: ".85rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                fontWeight: 500,
                transition: "background .2s",
              }}
            >
              {loading ? "Redirecting to Payment…" : "Proceed to Payment →"}
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontFamily: "var(--font-body)",
                fontSize: ".75rem",
                color: "#aaa",
              }}
            >
              🔒 Secure checkout powered by Stripe
            </p>
          </>
        )}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          background: "var(--lhb-black)",
          borderTop: "1px solid rgba(200,168,130,.15)",
          padding: "1.5rem 2rem",
          textAlign: "center",
          marginTop: "4rem",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,.35)",
            fontFamily: "var(--font-body)",
            fontSize: ".75rem",
            marginBottom: ".35rem",
          }}
        >
          © 2026 Lotus House Blends
        </p>
        <span
          style={{
            fontSize: ".6rem",
            color: "rgba(200,168,130,.3)",
            letterSpacing: ".08em",
          }}
        >
          Powered by Outsyde
        </span>
      </footer>
    </>
  );
}
