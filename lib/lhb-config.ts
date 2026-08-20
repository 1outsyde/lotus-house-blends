export const LHB_CONFIG = {
  businessId:      '8523e3c5-fc07-461b-9452-087d2b4aada6',
  stripeAccountId: 'acct_1SQl9ZRvtSpkHygW',
  vendorEmail:     process.env.LHB_VENDOR_EMAIL ?? 'lotushouseblends25@gmail.com',
  adminEmail:      'info@goutsyde.com',
  cartKey:         'lhb-cart',
  siteName:        'Lotus House Blends',
  siteUrl:         'https://lotushouseblends.com',
} as const;

export const TRACKING_URLS: Record<string, string> = {
  UPS:   'https://www.ups.com/track?tracknum=',
  FedEx: 'https://www.fedex.com/fedextrack/?tracknumbers=',
  USPS:  'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  DHL:   'https://www.dhl.com/us-en/home/tracking.html?tracking-id=',
};

export const CARRIER_LIST = ['UPS', 'FedEx', 'USPS', 'DHL', 'Other'] as const;
export type Carrier = typeof CARRIER_LIST[number];

export function detectCarrier(trackingNumber: string): Carrier {
  const tn = trackingNumber.trim().toUpperCase().replace(/\s/g, '');
  if (/^1Z/.test(tn)) return 'UPS';
  if (/^(?:\d{12}|\d{15}|96\d{20})$/.test(tn)) return 'FedEx';
  if (/^(?:\d{20,22}|9[24]\d{18}|94\d{18})$/.test(tn)) return 'USPS';
  if (/^(?:\d{10,11}|JD\d{18})$/.test(tn)) return 'DHL';
  return 'Other';
}

export function buildTrackingUrl(carrier: Carrier, trackingNumber: string): string | null {
  if (carrier === 'Other' || !TRACKING_URLS[carrier]) return null;
  return `${TRACKING_URLS[carrier]}${encodeURIComponent(trackingNumber.trim())}`;
}
