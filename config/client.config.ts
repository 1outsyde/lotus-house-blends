// config/client.config.ts
// THE ONLY FILE THAT CHANGES PER CLIENT
// Next client? New config + brand CSS + OUTSYDE_BUSINESS_ID. Nothing else.

export const clientConfig = {
  businessName: 'Lotus House Blends',
  ownerName: 'Lotus House Blends',
  ownerEmail: 'lotushouseblends25@gmail.com',
  siteUrl: 'https://lotushouseblends.com',

  // Outsyde platform
  outsydeBusinessId: process.env.OUTSYDE_BUSINESS_ID ?? '',
} as const

export type ClientConfig = typeof clientConfig
