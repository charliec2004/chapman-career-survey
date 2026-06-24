export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="mb-6">
      <div className="mb-1 flex justify-between font-heading text-xs uppercase tracking-wide text-pillar">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-sand/50"
        role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}
        aria-label="Survey progress"
      >
        <div className="h-full rounded-full bg-chapman-red transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
