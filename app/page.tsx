'use client'
import { useReducer, useMemo } from 'react'
import { surveyReducer, initialState, currentQuestion, canAdvance, progress } from '@/lib/survey-reducer'
import { optionsFor } from '@/data/questions'
import { recommend } from '@/lib/recommendation-engine'
import BrandHeader from '@/components/BrandHeader'
import IntroScreen from '@/components/IntroScreen'
import ProgressBar from '@/components/ProgressBar'
import QuestionCard from '@/components/QuestionCard'
import ResultsView from '@/components/ResultsView'
import ContactForm from '@/components/ContactForm'

export default function Home() {
  const [state, dispatch] = useReducer(surveyReducer, initialState)
  const question = currentQuestion(state)
  const { current, total } = progress(state)
  const results = useMemo(
    () => (state.phase === 'results' ? recommend(state.answers) : null),
    [state.phase, state.answers],
  )

  return (
    <div className="min-h-dvh bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-chapman-red focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <BrandHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-10">
        {state.phase === 'intro' && <IntroScreen onStart={() => dispatch({ type: 'start' })} />}

        {state.phase === 'survey' && question && (
          <div>
            <ProgressBar current={current} total={total} />
            <QuestionCard
              question={question}
              options={optionsFor(question, state.answers)}
              value={state.answers[question.id]}
              onChange={(value) => dispatch({ type: 'answer', id: question.id, value })}
            />
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => dispatch({ type: 'back' })}
                className="min-h-11 font-heading font-bold text-pillar hover:text-panther-black focus:outline-none focus-visible:ring-2 focus-visible:ring-chapman-red focus-visible:ring-offset-2 rounded"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'next' })}
                disabled={!canAdvance(state)}
                className="inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-8 py-2 font-heading font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-chapman-red focus-visible:ring-offset-2"
              >
                {current >= total ? 'See results' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {state.phase === 'results' && results && (
          <>
            <ResultsView results={results} onRestart={() => dispatch({ type: 'restart' })} />
            <ContactForm />
          </>
        )}
      </main>
    </div>
  )
}
