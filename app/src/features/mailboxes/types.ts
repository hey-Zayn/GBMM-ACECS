export type MailboxConnectionState = 'idle' | 'discovering' | 'connecting' | 'success' | 'error'

export type MailboxProvider = 'GOOGLE' | 'MICROSOFT' | 'OTHER'

export type MailboxDiscovery = {
  email: string
  suggestedProvider: MailboxProvider
  providerStatus: 'SUPPORTED' | 'PLANNED' | 'FALLBACK'
  availableMethods: string[]
  recommendedMethod: 'GOOGLE_OAUTH' | 'SMTP'
  connectEndpoint: string | null
  connectionMode: 'OAUTH' | 'ADVANCED_SMTP'
  requiresAdvancedSetup: boolean
}

export type MailboxDiscoveryResponse = {
  success: true
  data: MailboxDiscovery
}

export type MailboxType = 'GMAIL_OAUTH' | 'SMTP'
export type MailboxStatus = 'ACTIVE' | 'DISCONNECTED' | 'RATE_LIMITED' | 'ERROR'

export type Mailbox = {
  id: string
  workspaceId: string
  type: MailboxType
  email: string
  displayName?: string | null
  status: MailboxStatus
  dailyCap: number
  sentTodayCount: number
  remainingToday: number
  lastVerifiedAt?: string | null
  lastErrorCode?: string | null
  createdAt?: string
  updatedAt?: string
}

export type MailboxesResponse = {
  mailboxes: Mailbox[]
}

export type MailboxesApiResponse = {
  success: true
  data: MailboxesResponse
}

export type MailboxApiResponse = {
  success: true
  data: Mailbox
}

export type SmtpMailboxInput = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  fromEmail: string
  fromName?: string
  dailyCap: number
}

export type GoogleConnectResponse = {
  success: true
  data: { url: string }
}
