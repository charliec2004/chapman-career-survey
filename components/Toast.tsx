'use client'
import { useEffect } from 'react'

export default function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      role="status" aria-live="polite"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[min(92%,28rem)] rounded-lg border-l-4 border-grove bg-panther-black px-4 py-3 text-sm text-white shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="rounded font-heading text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-panther-black">✕</button>
      </div>
    </div>
  )
}
