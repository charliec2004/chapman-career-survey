'use client'
import { useState } from 'react'
import Toast from '@/components/Toast'

// Simple, conservative email shape check (deny-by-default: anything odd is invalid).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact(values: { name: string; email: string }): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  if (values.name.trim().length === 0) errors.name = 'Please enter your name.'
  if (values.name.trim().length > 120) errors.name = 'Name is too long.'
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email.'
  if (values.email.trim().length > 200) errors.email = 'Email is too long.'
  return { valid: Object.keys(errors).length === 0, errors }
}

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const { valid } = validateContact({ name, email })
  const canSubmit = valid && consent

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    // -------------------------------------------------------------------------
    // PROTOTYPE: contact capture is intentionally NOT wired up.
    //
    // Future production hookup (do NOT enable without the items below):
    //   1. POST a sanitized payload { name, email, note, recommendations }
    //      to a small serverless function or email API (e.g. a Cloudflare
    //      Worker / Vercel function) that emails the lead to the appropriate
    //      Career Center inbox. Keep the front-end static; the function is the
    //      only thing that touches PII.
    //   2. Before going live this handles STUDENT PII — required first:
    //        - explicit, logged consent (this checkbox is the UX seed),
    //        - FERPA review with the Career Center,
    //        - server-side validation + rate limiting on the endpoint,
    //        - transport over HTTPS only; never log raw PII.
    // Until then, we show a toast and reset. No network request is made.
    // -------------------------------------------------------------------------
    setToast("Thanks! This is a prototype — submissions aren't connected yet.")
    setName(''); setEmail(''); setNote(''); setConsent(false)
  }

  return (
    <section className="mt-10 rounded-xl border border-pillar/25 bg-sand/20 p-5">
      <h2 className="font-heading text-xl font-bold text-panther-black">Want us to follow up?</h2>
      <p className="mt-1 text-sm text-pillar">Optional — leave your info and the Career Center can reach out.</p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="cf-name" className="block font-heading text-sm font-bold">Name</label>
          <input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
            className="mt-1 w-full rounded-lg border-2 border-pillar/30 px-3 py-2 focus:border-chapman-red focus:outline-none" />
        </div>
        <div>
          <label htmlFor="cf-email" className="block font-heading text-sm font-bold">Chapman email</label>
          <input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200}
            className="mt-1 w-full rounded-lg border-2 border-pillar/30 px-3 py-2 focus:border-chapman-red focus:outline-none" />
        </div>
        <div>
          <label htmlFor="cf-note" className="block font-heading text-sm font-bold">Anything else? <span className="font-normal text-pillar">(optional)</span></label>
          <textarea id="cf-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3}
            className="mt-1 w-full rounded-lg border-2 border-pillar/30 px-3 py-2 focus:border-chapman-red focus:outline-none" />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-chapman-red" />
          <span>I agree to be contacted by Career &amp; Professional Development.</span>
        </label>
        <button type="submit" disabled={!canSubmit}
          className="inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-6 py-2 font-heading font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-chapman-red/40">
          Notify me
        </button>
      </form>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </section>
  )
}
