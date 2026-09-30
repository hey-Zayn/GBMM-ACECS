'use client'

import { useState } from 'react'
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { connectSmtpMailbox, startGoogleMailboxConnection } from '../api/mailboxes.api'
import { useMailboxDiscovery } from '../hooks/useMailboxDiscovery'
import { MAILBOXES_QUERY_KEY } from '../hooks/useMailboxes'
import type { MailboxConnectionState, MailboxDiscovery, SmtpMailboxInput } from '../types'
import { MailboxConnectionStatus } from './MailboxConnectionStatus'

type MailboxConnectDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }
type Step = 'email' | 'method' | 'smtp'

const initialSmtpForm: SmtpMailboxInput = {
  host: '', port: 587, secure: false, user: '', pass: '', fromEmail: '', fromName: '', dailyCap: 500,
}

export function MailboxConnectDialog({ open, onOpenChange }: MailboxConnectDialogProps) {
  const queryClient = useQueryClient()
  const discovery = useMailboxDiscovery()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [provider, setProvider] = useState<MailboxDiscovery | null>(null)
  const [state, setState] = useState<MailboxConnectionState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [smtpForm, setSmtpForm] = useState(initialSmtpForm)
  const smtpMutation = useMutation({
    mutationFn: connectSmtpMailbox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAILBOXES_QUERY_KEY })
      setState('success')
      toast.add({ title: 'Mailbox connected', description: 'Your mailbox is ready to send.', type: 'success' })
    },
    onError: () => {
      setState('error')
      setErrorMessage('We could not connect this mailbox. Check the details and try again.')
    },
  })

  const reset = () => {
    setStep('email')
    setEmail('')
    setProvider(null)
    setState('idle')
    setErrorMessage(undefined)
    setSmtpForm(initialSmtpForm)
    discovery.reset()
    smtpMutation.reset()
  }
  const close = (nextOpen: boolean) => { if (!nextOpen) reset(); onOpenChange(nextOpen) }
  const submitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('discovering')
    setErrorMessage(undefined)
    try {
      const result = await discovery.mutateAsync(email)
      setProvider(result)
      setStep('method')
      setState('idle')
    } catch {
      setState('error')
      setErrorMessage('We could not identify that email provider. Try again or use advanced setup.')
    }
  }
  const startGoogle = async () => {
    setState('connecting')
    setErrorMessage(undefined)
    try {
      window.location.assign(await startGoogleMailboxConnection())
    } catch {
      setState('error')
      setErrorMessage('Google sign-in could not be started. Please try again.')
    }
  }
  const submitSmtp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('connecting')
    setErrorMessage(undefined)
    smtpMutation.mutate({ ...smtpForm, port: Number(smtpForm.port), dailyCap: Number(smtpForm.dailyCap) })
  }

  return <Dialog open={open} onOpenChange={close}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Connect an email account</DialogTitle><DialogDescription>We’ll help you choose the simplest secure connection method.</DialogDescription></DialogHeader>{state === 'success' ? <div className="py-4"><MailboxConnectionStatus state="success" onContinue={() => close(false)} /></div> : state === 'error' ? <div className="space-y-4 py-2"><MailboxConnectionStatus state="error" errorMessage={errorMessage} onRetry={() => { setState('idle'); setErrorMessage(undefined) }} /><DialogFooter><Button type="button" variant="outline" onClick={() => close(false)}>Cancel</Button></DialogFooter></div> : step === 'email' ? <EmailStep email={email} state={state} onEmailChange={setEmail} onSubmit={submitEmail} onGoogle={startGoogle} onOther={() => setStep('smtp')} /> : step === 'method' && provider ? <MethodStep provider={provider} onBack={() => setStep('email')} onGoogle={startGoogle} onSmtp={() => setStep('smtp')} /> : <SmtpStep form={smtpForm} setForm={setSmtpForm} state={state} onBack={() => setStep('method')} onSubmit={submitSmtp} />}</DialogContent></Dialog>
}

function EmailStep({ email, state, onEmailChange, onSubmit, onGoogle, onOther }: { email: string; state: MailboxConnectionState; onEmailChange: (email: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onGoogle: () => void; onOther: () => void }) {
  return <div className="space-y-5"><ProviderChoices onGoogle={onGoogle} onOther={onOther} /><div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>or identify by email</span><span className="h-px flex-1 bg-slate-200" /></div><form className="space-y-5" onSubmit={onSubmit}>{state === 'discovering' ? <MailboxConnectionStatus state="discovering" /> : null}<div className="space-y-2"><Label htmlFor="mailbox-email">Email address</Label><Input id="mailbox-email" type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="you@example.com" required autoFocus /><p className="text-xs text-slate-500">We use this only to suggest the right connection method.</p></div><DialogFooter><Button type="submit" disabled={state === 'discovering'}>{state === 'discovering' ? 'Checking…' : 'Continue'}</Button></DialogFooter></form></div>
}

function ProviderChoices({ onGoogle, onOther }: { onGoogle: () => void; onOther: () => void }) {
  return <div className="space-y-4"><div><p className="text-sm font-semibold text-slate-900">Choose your provider</p><p className="mt-1 text-xs text-slate-500">Use a one-click sign-in or connect another provider manually.</p></div><div className="grid gap-3 sm:grid-cols-3"><ProviderButton icon={<GoogleLogo />} label="Gmail" description="Continue with Google" onClick={onGoogle} /><ProviderButton icon={<MicrosoftLogo />} label="Outlook / Hotmail" description="Coming soon" onClick={() => undefined} disabled /><ProviderButton icon={<OtherEmailLogo />} label="Other email" description="Use SMTP setup" onClick={onOther} /></div><p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">Google access may be limited to approved testers while ACECS is in testing mode.</p></div>
}

function ProviderButton({ icon, label, description, onClick, disabled = false }: { icon: React.ReactNode; label: string; description: string; onClick: () => void; disabled?: boolean }) {
  return <Button type="button" variant="outline" className="group h-auto min-h-28 flex-col items-start justify-between gap-4 rounded-xl border-slate-200 p-3 text-left shadow-none transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onClick} disabled={disabled}><span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 transition group-hover:bg-white">{icon}</span><span><span className="block text-xs font-semibold text-slate-800">{label}</span><span className="mt-1 block text-[11px] font-normal leading-4 text-slate-500">{description}</span></span></Button>
}

function GoogleLogo() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5"><path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.4-.18-2.06H12v3.9h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.2Z" /><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.51A9.74 9.74 0 0 0 12 21.7Z" /><path fill="#FBBC05" d="M6.53 13.8a5.86 5.86 0 0 1 0-3.6V7.69H3.29a9.74 9.74 0 0 0 0 8.62l3.24-2.51Z" /><path fill="#EA4335" d="M12 6.17c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.22 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.71 5.39l3.24 2.51C7.3 7.89 9.46 6.17 12 6.17Z" /></svg> }
function MicrosoftLogo() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5"><path fill="#F35325" d="M2 2h9.5v9.5H2z" /><path fill="#81BC06" d="M12.5 2H22v9.5h-9.5z" /><path fill="#05A6F0" d="M2 12.5h9.5V22H2z" /><path fill="#FFBA08" d="M12.5 12.5H22V22h-9.5z" /></svg> }
function OtherEmailLogo() { return <span className="flex size-5 items-center justify-center rounded-md bg-slate-700 text-white"><Mail aria-hidden="true" className="size-3.5" /></span> }

function MethodStep({ provider, onBack, onGoogle, onSmtp }: { provider: MailboxDiscovery; onBack: () => void; onGoogle: () => void; onSmtp: () => void }) {
  const isGoogle = provider.recommendedMethod === 'GOOGLE_OAUTH'
  return <div className="space-y-4"><div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">{isGoogle ? 'Google account detected' : 'Use advanced setup'}</p><p className="mt-1 text-sm text-slate-500">{isGoogle ? 'Continue with Google to connect without entering server settings.' : 'Enter your provider’s SMTP details. Your password is encrypted and never displayed.'}</p></div><div className="flex flex-col gap-2">{isGoogle ? <Button type="button" onClick={onGoogle}>Continue with Google</Button> : null}<Button type="button" variant={isGoogle ? 'outline' : 'default'} onClick={onSmtp}>Use advanced setup</Button></div><Button type="button" variant="ghost" onClick={onBack}><ArrowLeft aria-hidden="true" />Use a different email</Button></div>
}

function SmtpStep({ form, setForm, state, onBack, onSubmit }: { form: SmtpMailboxInput; setForm: (form: SmtpMailboxInput) => void; state: MailboxConnectionState; onBack: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const update = (field: keyof SmtpMailboxInput, value: string | number | boolean) => setForm({ ...form, [field]: value })
  return <form className="max-h-[60vh] space-y-4 overflow-y-auto pr-1" onSubmit={onSubmit}><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Advanced setup is for providers that do not support one-click sign-in. Your credentials are used only to verify and send from this mailbox.</div><div className="grid gap-4 sm:grid-cols-[1fr_120px]"><div className="space-y-2"><Label htmlFor="smtp-host">SMTP server</Label><Input id="smtp-host" value={form.host} onChange={(event) => update('host', event.target.value)} placeholder="smtp.example.com" required /></div><div className="space-y-2"><Label htmlFor="smtp-port">Port</Label><Input id="smtp-port" type="number" value={form.port} onChange={(event) => update('port', Number(event.target.value))} required /></div></div><div className="flex items-center gap-2"><input id="smtp-secure" type="checkbox" checked={form.secure} onChange={(event) => update('secure', event.target.checked)} /><Label htmlFor="smtp-secure">Use secure connection</Label></div><div className="space-y-2"><Label htmlFor="smtp-user">Username</Label><Input id="smtp-user" value={form.user} onChange={(event) => update('user', event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="smtp-pass">Password or app password</Label><Input id="smtp-pass" type="password" value={form.pass} onChange={(event) => update('pass', event.target.value)} required /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="smtp-from">Sender email</Label><Input id="smtp-from" type="email" value={form.fromEmail} onChange={(event) => update('fromEmail', event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="smtp-name">Sender name</Label><Input id="smtp-name" value={form.fromName} onChange={(event) => update('fromName', event.target.value)} placeholder="Your name" /></div></div><div className="space-y-2"><Label htmlFor="smtp-cap">Daily sending limit</Label><Input id="smtp-cap" type="number" min={1} max={5000} value={form.dailyCap} onChange={(event) => update('dailyCap', Number(event.target.value))} required /></div>{state === 'connecting' ? <div className="flex items-center gap-2 text-sm text-slate-500" role="status"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Checking your connection…</div> : null}<DialogFooter><Button type="button" variant="ghost" onClick={onBack} disabled={state === 'connecting'}>Back</Button><Button type="submit" disabled={state === 'connecting'}>{state === 'connecting' ? 'Checking…' : 'Connect mailbox'}</Button></DialogFooter></form>
}
