import {
  visibleQuestions, type Answers, type AnswerValue, type QuestionId, type Question,
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

/** Remove answers for questions that are no longer visible (e.g., after a branch change). */
function pruneAnswers(answers: Answers): Answers {
  const visibleIds = new Set(visibleQuestions(answers).map((q) => q.id))
  const next: Answers = {}
  for (const [id, value] of Object.entries(answers)) {
    if (visibleIds.has(id as QuestionId)) next[id as QuestionId] = value
  }
  return next
}

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false
  return Array.isArray(value) ? value.length > 0 : value.length > 0
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
      if (state.index === 0) return { ...state, phase: 'survey' }
      return { ...state, index: state.index - 1 }
    }

    case 'restart':
      return initialState

    default:
      return state
  }
}
