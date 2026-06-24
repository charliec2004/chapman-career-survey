import {
  visibleQuestions, optionsFor, type Answers, type AnswerValue, type QuestionId, type Question,
} from '@/data/questions'

export type Phase = 'intro' | 'survey' | 'results'

export interface SurveyState {
  phase: Phase
  answers: Answers
  /** Index into the *current* visible-questions list. */
  index: number
}

export type SurveyAction =
  | { type: 'start' }
  | { type: 'answer'; id: QuestionId; value: AnswerValue }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'restart' }

export const initialState: SurveyState = { phase: 'intro', answers: {}, index: 0 }

/**
 * Drop answers that are no longer valid after a change:
 *  - questions that became invisible (branch changed), and
 *  - values no longer offered (e.g. a persona-specific goal after the year changes,
 *    so options are persona-adaptive).
 * Iterates to a fixed point so dropping one answer (e.g. an invalid goal) also
 * removes the follow-ups that depended on it.
 */
function pruneAnswers(answers: Answers): Answers {
  let current: Answers = answers
  for (let pass = 0; pass < 6; pass++) {
    const visible = visibleQuestions(current)
    const next: Answers = {}
    for (const q of visible) {
      const value = current[q.id]
      if (value == null) continue
      const valid = new Set(optionsFor(q, current).map((o) => o.value))
      if (Array.isArray(value)) {
        const kept = value.filter((v) => valid.has(v))
        if (kept.length > 0) next[q.id] = kept
      } else if (valid.has(value)) {
        next[q.id] = value
      }
    }
    if (Object.keys(next).length === Object.keys(current).length) return next
    current = next
  }
  return current
}

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false
  // Both string and string[] expose .length; empty means unanswered.
  return value.length > 0
}

export function currentQuestion(state: SurveyState): Question | null {
  if (state.phase !== 'survey') return null
  const visible = visibleQuestions(state.answers)
  return visible[state.index] ?? null
}

export function canAdvance(state: SurveyState): boolean {
  const q = currentQuestion(state)
  if (!q) return false
  return isAnswered(state.answers[q.id])
}

export function progress(state: SurveyState): { current: number; total: number } {
  if (state.phase !== 'survey') return { current: 0, total: 0 }
  const total = visibleQuestions(state.answers).length
  return { current: Math.min(state.index + 1, total), total }
}

export function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'start':
      return { phase: 'survey', answers: {}, index: 0 }

    case 'answer': {
      const answers = pruneAnswers({ ...state.answers, [action.id]: action.value })
      // Keep index pointing at the same question the user just answered.
      const visible = visibleQuestions(answers)
      const newIndex = Math.min(state.index, Math.max(visible.length - 1, 0))
      return { ...state, answers, index: newIndex }
    }

    case 'next': {
      if (!canAdvance(state)) return state
      const visible = visibleQuestions(state.answers)
      if (state.index >= visible.length - 1) return { ...state, phase: 'results' }
      return { ...state, index: state.index + 1 }
    }

    case 'back': {
      // From the first question, Back returns to the intro / "Start the survey" screen.
      if (state.index === 0) return { ...state, phase: 'intro' }
      return { ...state, index: state.index - 1 }
    }

    case 'restart':
      return initialState

    default:
      return state
  }
}
