import type { Recommendation } from '@/lib/recommendation-engine'

export default function ResultCard({ rec, featured = false }: { rec: Recommendation; featured?: boolean }) {
  const { resource, reasons } = rec
  const a = resource.action
  return (
    <article
      className={[
        'rounded-xl border bg-white p-5 shadow-sm',
        featured ? 'border-l-8 border-chapman-red' : 'border-pillar/25',
      ].join(' ')}
    >
      <h3 className="font-heading text-xl font-bold text-panther-black">{resource.name}</h3>
      <p className="mt-1 text-sm text-pillar">{resource.whatItIs}</p>

      {reasons.length > 0 && (
        <div className="mt-3">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-chapman-red">Why this fits you</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <dl className="mt-3 space-y-1 text-sm">
        {a.email && <div><dt className="sr-only">Email</dt><dd><a className="text-chapman-red underline" href={`mailto:${a.email}`}>{a.email}</a></dd></div>}
        {a.phone && <div><dt className="sr-only">Phone</dt><dd>{a.phone}</dd></div>}
        {a.location && <div><dt className="sr-only">Location</dt><dd>{a.location}</dd></div>}
        {a.hours && <div><dt className="sr-only">Hours</dt><dd>{a.hours}</dd></div>}
        {a.scheduling && <div><dt className="sr-only">Scheduling</dt><dd>Scheduling: {a.scheduling}</dd></div>}
      </dl>

      {a.href && (
        <a
          href={a.href} target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-5 py-2 font-heading text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-chapman-red focus-visible:ring-offset-2"
        >
          {a.label ?? 'Open'}
        </a>
      )}
    </article>
  )
}
