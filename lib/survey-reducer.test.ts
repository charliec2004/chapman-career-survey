import { describe, it, expect } from 'vitest'
import {
  initialState, surveyReducer, currentQuestion, canAdvance, progress,
  type SurveyState,
} from '@/lib/survey-reducer'

const start = (): SurveyState => surveyReducer(initialState, { type: 'start' })

describe('survey reducer', () => {
  it('starts on the intro phase', () => {
    expect(initialState.phase).toBe('intro')
  })

  it('moves to the survey on start and shows the first question', () => {
    const s = start()
    expect(s.phase).toBe('survey')
    expect(currentQuestion(s)?.id).toBe('year')
  })

  it('cannot advance until the current question is answered', () => {
    const s = start()
    expect(canAdvance(s)).toBe(false)
    const answered = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    expect(canAdvance(answered)).toBe(true)
  })

  it('walks the core questions in order', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'next' })
    expect(currentQuestion(s)?.id).toBe('college')
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'next' })
    expect(currentQuestion(s)?.id).toBe('goal')
  })

  it('branches: choosing materials surfaces the materials follow-ups', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'materials' })
    s = surveyReducer(s, { type: 'next' })
    expect(currentQuestion(s)?.id).toBe('materials_which')
  })

  it('reaches results after the last visible question', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'senior' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'law' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'gradschool' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'gradschool_stage', value: 'applying' })
    s = surveyReducer(s, { type: 'next' })
    expect(s.phase).toBe('results')
  })

  it('back returns to the previous visible question', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'back' })
    expect(currentQuestion(s)?.id).toBe('year')
  })

  it('back on the first question is a no-op', () => {
    const s = start()
    expect(surveyReducer(s, { type: 'back' })).toEqual(s)
  })

  it('progress is zeroed outside the survey phase', () => {
    expect(progress(initialState)).toEqual({ current: 0, total: 0 })
  })

  it('changing an earlier branch answer drops now-invisible later answers on results', () => {
    // Build a full materials path, then change goal to network and confirm materials answers are gone.
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'materials' })
    s = surveyReducer(s, { type: 'answer', id: 'materials_which', value: ['resume'] })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'network' })
    expect(s.answers.materials_which).toBeUndefined()
  })

  it('progress reports current and total visible questions', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'network' })
    const p = progress(s)
    expect(p.total).toBe(4) // year, college, goal, network_focus
    expect(p.current).toBe(1) // still on year (index 0) -> 1-based
  })

  it('restart returns to intro with no answers', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'restart' })
    expect(s).toEqual(initialState)
  })
})
