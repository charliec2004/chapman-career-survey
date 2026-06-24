import type { Results } from '@/lib/recommendation-engine'
import ResultCard from '@/components/ResultCard'

export default function ResultsView({ results, onRestart }: { results: Results; onRestart: () => void }) {
  return (
    <section>
      <h1 className="font-heading text-3xl font-bold text-panther-black">Your recommendations</h1>
      <p className="mt-2 text-pillar">Based on your answers, here&apos;s where to start.</p>

      {results.seniorPassportNudge && (
        <div className="mt-4 rounded-lg border-l-4 border-grove bg-grove/5 p-4 text-sm">
          <strong className="font-heading">Graduating soon?</strong> Ask the{' '}
          <a
            href="https://www.chapman.edu/campus-services/career-professional-development/index.aspx"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-chapman-red underline"
          >
            Career Center
          </a>{' '}
          about the{' '}
          <a
            href="https://chapman.joinhandshake.com/edu/articles/33391"
            target="_blank" rel="noopener noreferrer"
            className="font-semibold text-chapman-red underline"
          >
            Career Passport Program
          </a>{' '}
          for seniors.
        </div>
      )}

      <h2 className="mt-8 font-heading text-sm font-bold uppercase tracking-widest text-chapman-red">Start here</h2>
      <div className="mt-3 space-y-4">
        {results.primary.map((rec) => <ResultCard key={rec.resource.id} rec={rec} featured />)}
      </div>

      {results.alsoExplore.length > 0 && (
        <>
          <h2 className="mt-8 font-heading text-sm font-bold uppercase tracking-widest text-pillar">Also worth exploring</h2>
          <div className="mt-3 space-y-4">
            {results.alsoExplore.map((rec) => <ResultCard key={rec.resource.id} rec={rec} />)}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex min-h-11 items-center rounded-lg border-2 border-chapman-red px-6 py-2 font-heading font-bold text-chapman-red focus:outline-none focus-visible:ring-2 focus-visible:ring-chapman-red focus-visible:ring-offset-2"
      >
        Start over
      </button>
    </section>
  )
}
