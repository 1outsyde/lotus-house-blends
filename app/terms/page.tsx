import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Lotus House Blends",
  description:
    "Terms and conditions for purchasing from Lotus House Blends, including shipping, returns, and privacy policy.",
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

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: `These Terms and Conditions ("Terms") govern your use of lotushouseblends.com (the "Site") and your purchase of products from Lotus House Blends ("we," "us," or "our"). By accessing this Site or placing an order, you agree to be bound by these Terms. We reserve the right to update these Terms at any time. Continued use of the Site following any changes constitutes acceptance of the revised Terms.`,
  },
  {
    id: "products",
    title: "Products",
    content: `All products sold by Lotus House Blends are herbal blends intended for aromatherapy and general wellness purposes. Our products are not intended to diagnose, treat, cure, or prevent any disease. They have not been evaluated by the Food and Drug Administration. Lotus House Blends products are intended for adult use only. Keep all products out of reach of children and pets. Consult a qualified healthcare professional before use if you are pregnant, nursing, taking medication, or have a medical condition. Product images are for illustrative purposes; actual products may vary slightly due to the handcrafted nature of our blends.`,
  },
  {
    id: "pricing",
    title: "Pricing & Payment",
    content: `All prices listed on the Site are in U.S. dollars and are subject to change without notice. We reserve the right to modify or discontinue products at any time. Applicable taxes will be calculated and displayed at checkout. We accept major credit and debit cards processed securely through Stripe. By submitting your payment, you represent that you are authorized to use the payment method provided. Orders are not confirmed until payment is successfully processed.`,
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    content: `We currently ship within the United States only. Orders are typically processed within 2–3 business days. Shipping timelines vary by carrier and destination; estimated delivery times are provided at checkout and are not guaranteed. Lotus House Blends is not responsible for delays caused by carriers, customs, or circumstances beyond our control. Risk of loss and title for products purchased from us passes to you upon delivery to the carrier. If your order is lost or damaged in transit, please contact us within 14 days of the estimated delivery date at hello@lotushouseblends.com.`,
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    content: `Due to the perishable and personal nature of herbal products, all sales are final. We do not accept returns or exchanges on opened products. If you receive a damaged, defective, or incorrect item, please contact us within 7 days of delivery with your order number and photos of the issue. We will issue a replacement or store credit at our discretion. We are not responsible for orders where an incorrect shipping address was provided at checkout.`,
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    content: `We collect personal information (such as name, email address, shipping address, and payment information) solely for the purpose of processing and fulfilling your order, communicating with you about your purchase, and improving our services. We do not sell, rent, or share your personal information with third parties except as necessary to complete your transaction (e.g., payment processors and shipping carriers). We use industry-standard security measures to protect your data. By using this Site, you consent to our collection and use of your information as described herein. You may request deletion of your personal information at any time by contacting hello@lotushouseblends.com.`,
  },
  {
    id: "disclaimer",
    title: "Disclaimer of Warranties",
    content: `THE SITE AND PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, LOTUS HOUSE BLENDS DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED OR ERROR-FREE.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    content: `Questions about these Terms? Reach us at hello@lotushouseblends.com. Lotus House Blends · United States · Last updated: January 2026`,
  },
];

export default function TermsPage() {
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
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Lotus House Blends" width={140} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {[
            { label: "Shop", href: "/#shop" },
            { label: "Our Story", href: "/about" },
            { label: "Wholesale", href: "/wholesale" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "rgba(255,255,255,.8)",
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* HEADER */}
      <div
        style={{
          background: "var(--lhb-parchment-dark)",
          padding: "3.5rem 2rem 2.5rem",
          textAlign: "center",
          borderBottom: "1px solid rgba(200,168,130,.25)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 400,
            marginBottom: ".5rem",
          }}
        >
          Terms &amp; Conditions
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: ".8rem",
            color: "#888",
          }}
        >
          Last updated: January 2026
        </p>
      </div>

      {/* CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          maxWidth: 1000,
          margin: "0 auto",
          padding: "3rem 1.5rem",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        {/* Sidebar TOC */}
        <nav
          style={{
            position: "sticky",
            top: 80,
          }}
        >
          <div
            style={{
              fontSize: ".65rem",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--lhb-gold)",
              fontFamily: "var(--font-body)",
              marginBottom: "1rem",
            }}
          >
            Contents
          </div>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{
                display: "block",
                padding: ".35rem 0",
                fontFamily: "var(--font-body)",
                fontSize: ".8rem",
                color: "#888",
                textDecoration: "none",
                borderBottom: "1px solid rgba(200,168,130,.1)",
                transition: "color .2s",
              }}
            >
              {s.title}
            </a>
          ))}
        </nav>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.6rem",
                  fontWeight: 400,
                  marginBottom: "1rem",
                  paddingBottom: ".5rem",
                  borderBottom: "1px solid rgba(200,168,130,.3)",
                }}
              >
                {s.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: ".875rem",
                  lineHeight: 1.85,
                  color: "#555",
                }}
              >
                {s.content}
              </p>
            </section>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          background: "var(--lhb-black)",
          borderTop: "1px solid rgba(200,168,130,.15)",
          padding: "1.5rem 2rem",
          textAlign: "center",
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
          © 2026 Lotus House Blends ·{" "}
          <Link
            href="/"
            style={{ color: "var(--lhb-gold)", textDecoration: "none", opacity: 0.7 }}
          >
            Home
          </Link>
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
