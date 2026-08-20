import { LHB_CONFIG } from './lhb-config';

const BACKEND_URL = process.env.OUTSYDE_BACKEND_URL ?? 'https://outsyde-backend.onrender.com';
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? '';

async function triggerEmail(
  type: 'order_confirmation' | 'shipment_notification' | 'cancellation',
  payload: object
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/internal/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': INTERNAL_KEY,
    },
    body: JSON.stringify({ type, payload }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`[LHB Email] Failed to trigger ${type}:`, error);
    // Do not throw — email failure should never block order flow
  }
}

export async function sendOrderConfirmationEmail(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; qty: number; price: number }>;
  totalCents: number;
  shippingAddress: { line1: string; city: string; state: string; zip: string };
}): Promise<void> {
  return triggerEmail('order_confirmation', {
    orderId:         data.orderId,
    customerName:    data.customerName,
    customerEmail:   data.customerEmail,
    vendorEmail:     LHB_CONFIG.vendorEmail,
    adminEmail:      LHB_CONFIG.adminEmail,
    items:           data.items.map(i => ({ name: i.name, quantity: i.qty, price_cents: Math.round(i.price * 100) })),
    totalCents:      data.totalCents,
    shippingAddress: data.shippingAddress,
  });
}

export async function sendShipmentNotificationEmail(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; qty: number; price: number }>;
  totalCents: number;
  shippingAddress: { line1: string; city: string; state: string; zip: string };
  trackingNumber: string;
  carrier: string;
  trackingUrl: string | null;
}): Promise<void> {
  return triggerEmail('shipment_notification', {
    orderId:         data.orderId,
    customerName:    data.customerName,
    customerEmail:   data.customerEmail,
    vendorEmail:     LHB_CONFIG.vendorEmail,
    adminEmail:      LHB_CONFIG.adminEmail,
    items:           data.items.map(i => ({ name: i.name, quantity: i.qty, price_cents: Math.round(i.price * 100) })),
    totalCents:      data.totalCents,
    shippingAddress: data.shippingAddress,
    trackingNumber:  data.trackingNumber,
    carrier:         data.carrier,
    trackingUrl:     data.trackingUrl,
  });
}

export async function sendCancellationEmail(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
}): Promise<void> {
  return triggerEmail('cancellation', {
    orderId:       data.orderId,
    customerName:  data.customerName,
    customerEmail: data.customerEmail,
    vendorEmail:   LHB_CONFIG.vendorEmail,
    adminEmail:    LHB_CONFIG.adminEmail,
    totalCents:    data.totalCents,
    items:         [],
    shippingAddress: { line1: '', city: '', state: '', zip: '' },
  });
}
