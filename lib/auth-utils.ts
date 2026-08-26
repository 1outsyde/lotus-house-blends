import { clientConfig } from '@/config/client.config'

const SUPER_ADMIN_EMAILS = ['info@goutsyde.com']

export function isAdminEmail(email: string): boolean {
  return (
    email.toLowerCase() === clientConfig.ownerEmail.toLowerCase() ||
    SUPER_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase())
  )
}
