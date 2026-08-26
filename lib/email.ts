import { Resend } from 'resend';
import { LHB_CONFIG } from './lhb-config';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'orders@info.goutsyde.com';

export interface OrderEmailData {
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; qty: number; price: number }>;
  totalCents: number;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string | null;
}

function dualRecipients(): string[] {
  return [LHB_CONFIG.vendorEmail, LHB_CONFIG.adminEmail].filter(Boolean);
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const { orderNumber, customerName, customerEmail, items, totalCents, shippingAddress } = data;
  const ref = `#${String(orderNumber).padStart(4, '0')}`;

  const itemsHtml = items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:#1a1a18;padding:20px 24px;">
        <p style="color:#C8A882;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin:0 0 4px;">Lotus House Blends</p>
        <h1 style="color:#f5f0e6;font-size:20px;margin:0;">New Order Received</h1>
      </div>
      <div style="padding:24px;">
        <p><strong>Order:</strong> ${ref}</p>
        <p><strong>Customer:</strong> ${customerName} &lt;${customerEmail}&gt;</p>
        <p><strong>Ship to:</strong> ${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;">Item</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;">Qty</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="text-align:right;font-size:16px;font-weight:bold;margin-top:16px;">
          Total: $${(totalCents / 100).toFixed(2)}
        </p>
        <p style="color:#888;font-size:12px;margin-top:24px;">Powered by Outsyde</p>
      </div>
    </div>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: dualRecipients(),
      replyTo: customerEmail,
      subject: `New Order ${ref} — ${customerName} | Lotus House Blends`,
      html,
    });
  } catch (err) {
    console.error('[LHB Email] sendOrderConfirmationEmail failed:', err);
  }
}

export async function sendShipmentNotificationEmail(data: OrderEmailData): Promise<void> {
  const { orderNumber, customerName, customerEmail, trackingNumber, carrier, trackingUrl } = data;
  const ref = `#${String(orderNumber).padStart(4, '0')}`;

  const trackingBtn = trackingUrl
    ? `<a href="${trackingUrl}" style="display:inline-block;background:#1E3020;color:#F2EBD9;padding:10px 20px;text-decoration:none;font-size:13px;border-radius:2px;margin-top:12px;">Track My Package →</a>`
    : '';

  // Dual email to vendor + admin
  try {
    await resend.emails.send({
      from: FROM,
      to: dualRecipients(),
      subject: `Order Shipped — ${customerName} | ${ref}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#1a1a18;padding:20px 24px;">
            <p style="color:#C8A882;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin:0 0 4px;">Lotus House Blends</p>
            <h1 style="color:#f5f0e6;font-size:20px;margin:0;">Order Marked as Shipped</h1>
          </div>
          <div style="padding:24px;">
            <p><strong>Order:</strong> ${ref}</p>
            <p><strong>Customer:</strong> ${customerName} &lt;${customerEmail}&gt;</p>
            <p><strong>Carrier:</strong> ${carrier}</p>
            <p><strong>Tracking #:</strong> <code>${trackingNumber}</code></p>
            ${trackingUrl ? `<p><a href="${trackingUrl}">${trackingUrl}</a></p>` : ''}
          </div>
        </div>`,
    });
  } catch (err) {
    console.error('[LHB Email] shipment vendor/admin notify failed:', err);
  }

  // Customer-facing shipment email
  try {
    await resend.emails.send({
      from: FROM,
      to: customerEmail,
      subject: `Your Lotus House Blends order has shipped! ${ref}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#1a1a18;padding:20px 24px;">
            <p style="color:#C8A882;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin:0 0 4px;">Lotus House Blends</p>
            <h1 style="color:#f5f0e6;font-size:20px;margin:0;">Your Order Is On Its Way 🌿</h1>
          </div>
          <div style="padding:24px;">
            <p>Hi ${customerName},</p>
            <p>Your order has shipped via <strong>${carrier}</strong>.</p>
            <p><strong>Tracking number:</strong> <code>${trackingNumber}</code></p>
            ${trackingBtn}
            <p style="color:#888;font-size:12px;margin-top:32px;">— Lotus House Blends &nbsp;·&nbsp; Powered by Outsyde</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error('[LHB Email] shipment customer notify failed:', err);
  }
}

export async function sendCancellationEmail(
  data: Pick<OrderEmailData, 'orderId' | 'orderNumber' | 'customerName' | 'customerEmail' | 'totalCents'>
): Promise<void> {
  const ref = `#${String(data.orderNumber).padStart(4, '0')}`;
  try {
    await resend.emails.send({
      from: FROM,
      to: [...dualRecipients(), data.customerEmail],
      subject: `Order Cancelled — ${ref}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1a18;padding:20px 24px;">
            <p style="color:#C8A882;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin:0 0 4px;">Lotus House Blends</p>
            <h1 style="color:#f5f0e6;font-size:20px;margin:0;">Order Cancelled</h1>
          </div>
          <div style="padding:24px;">
            <p><strong>Order:</strong> ${ref}</p>
            <p><strong>Customer:</strong> ${data.customerName} &lt;${data.customerEmail}&gt;</p>
            <p><strong>Refund amount:</strong> $${(data.totalCents / 100).toFixed(2)}</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error('[LHB Email] sendCancellationEmail failed:', err);
  }
}
