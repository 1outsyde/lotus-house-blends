import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | Lotus House Blends",
};

const CSS_VARS = `
  :root {
    --lhb-parchment: #f5f0e8;
    --lhb-parchment-dark: #ede5d0;
    --lhb-moss: #3d5a3e;
    --lhb-gold: #c8a882;
    --lhb-black: #1a1a18;
    --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    --font-body: var(--font-jost), 'Jost', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--lhb-parchment); color: #1a1a18; font-family: var(--font-body); }
`;

export default function SuccessPage() {
  return (
    <>
      <style>{CSS_VARS}</style>

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
      </nav>

      <div
        style={{
          maxWidth: 560,
          margin: "6rem auto",
          padding: "0 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>🌸</div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 400,
            marginBottom: "1rem",
          }}
        >
          Thank you for your order
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: ".9rem",
            color: "#666",
            lineHeight: 1.75,
            marginBottom: "2.5rem",
          }}
        >
          Your ritual is on its way. You will receive a confirmation email
          shortly with your order details and tracking information.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: ".85rem 2.25rem",
            background: "var(--lhb-moss)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "2px",
            fontFamily: "var(--font-body)",
            fontSize: ".8rem",
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          Continue Shopping
        </Link>
      </div>

      <footer
        style={{
          background: "var(--lhb-black)",
          borderTop: "1px solid rgba(200,168,130,.15)",
          padding: "1.5rem 2rem",
          textAlign: "center",
          marginTop: "6rem",
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
