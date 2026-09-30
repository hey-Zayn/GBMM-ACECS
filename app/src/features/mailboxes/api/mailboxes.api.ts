import { api } from '@/lib/axios'
import type {
  GoogleConnectResponse,
  Mailbox,
  MailboxApiResponse,
  MailboxDiscovery,
  MailboxDiscoveryResponse,
  MailboxesApiResponse,
  SmtpMailboxInput,
} from '../types'

export async function discoverMailbox(email: string): Promise<MailboxDiscovery> {
  const response = await api.post<MailboxDiscoveryResponse>('/mailboxes/discover', { email })
  return response.data.data
}

export async function startGoogleMailboxConnection(): Promise<string> {
  const response = await api.get<GoogleConnectResponse>('/mailboxes/google/connect')
  return response.data.data.url
}

export async function getMailboxes(): Promise<Mailbox[]> {
  const response = await api.get<MailboxesApiResponse>('/mailboxes')
  return response.data.data.mailboxes
}

export async function testMailbox(mailboxId: string): Promise<Mailbox> {
  const response = await api.post<MailboxApiResponse>(`/mailboxes/${mailboxId}/test`)
  return response.data.data
}

export async function disconnectMailbox(mailboxId: string): Promise<Mailbox> {
  const response = await api.post<MailboxApiResponse>(`/mailboxes/${mailboxId}/disconnect`)
  return response.data.data
}

export async function connectSmtpMailbox(input: SmtpMailboxInput): Promise<Mailbox> {
  const response = await api.post<MailboxApiResponse>('/mailboxes/smtp', input)
  return response.data.data
}
