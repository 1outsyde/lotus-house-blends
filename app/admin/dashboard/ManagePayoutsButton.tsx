'use client';

export default function ManagePayoutsButton() {
  async function handleClick() {
    const res = await fetch('/api/admin/stripe-dashboard-link');
    if (res.ok) {
      const { url } = await res.json();
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Stripe dashboard link unavailable. Please try again.');
      }
    } else {
      alert('Unable to open Stripe dashboard. Make sure Stripe is connected, or contact support.');
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        background: '#1E3020',
        color: '#F2EBD9',
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}
    >
      Manage Payouts
    </button>
  );
}
