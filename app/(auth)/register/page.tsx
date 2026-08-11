"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f0e6", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <p style={{ fontSize: "0.7rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", textAlign: "center", marginBottom: 12 }}>
          Lotus House Blends
        </p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2.2rem", fontWeight: 500, textAlign: "center", marginBottom: 6 }}>
          Create Account
        </h1>
        <p style={{ textAlign: "center", color: "rgba(245,240,230,0.4)", fontSize: "0.85rem", marginBottom: 36 }}>
          Join Lotus House Blends
        </p>

        {error && (
          <div style={{ marginBottom: 20, padding: "12px 16px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#fca5a5", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 8 }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 14px", color: "#f5f0e6", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 14px", color: "#f5f0e6", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 14px", color: "#f5f0e6", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.65rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 8 }}>
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 14px", color: "#f5f0e6", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, background: "#f5f0e6", color: "#0a0a0a", border: "none", padding: "14px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(245,240,230,0.4)", marginTop: 24 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#f5f0e6", textDecoration: "underline" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
