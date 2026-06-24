import { describe, it, expect } from 'vitest'
import { QUESTIONS, visibleQuestions, optionsFor, type Answers } from '@/data/questions'

const goalQuestion = QUESTIONS.find((q) => q.id === 'goal')!
const goalValues = (a: Answers) => optionsFor(goalQuestion, a).map((o) => o.value)

describe('questions config', () => {
  it('has unique question ids', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('shows only the three core questions before a goal is chosen (non-alumni)', () => {
    const visible = visibleQuestions({ year: 'second', college: 'argyros' })
    expect(visible.map((q) => q.id)).toEqual(['year', 'college', 'goal'])
  })

  it('reveals materials follow-ups only when goal is materials', () => {
    const visible = visibleQuestions({ goal: 'materials' }).map((q) => q.id)
    expect(visible).toContain('materials_which')
    expect(visible).toContain('materials_mode')
    expect(visible).not.toContain('jobsearch_need')
  })

  it('reveals jobsearch follow-ups only when goal is jobsearch', () => {
    const visible = visibleQuestions({ goal: 'jobsearch' }).map((q) => q.id)
    expect(visible).toContain('jobsearch_need')
    expect(visible).toContain('jobsearch_region')
    expect(visible).not.toContain('materials_which')
  })
})

describe('persona-adaptive goals', () => {
  it('offers alumni a career-change goal but not "explore my major"', () => {
    const values = goalValues({ year: 'alumni' })
    expect(values).toContain('career_change')
    expect(values).not.toContain('explore')
  })

  it('offers first-years exploration but not career-change', () => {
    const values = goalValues({ year: 'first' })
    expect(values).toContain('explore')
    expect(values).not.toContain('career_change')
  })
})

describe('industry / career-change branch', () => {
  it('shows industry questions to alumni even before a goal', () => {
    const ids = visibleQuestions({ year: 'alumni', college: 'argyros' }).map((q) => q.id)
    expect(ids).toContain('industry_current')
    expect(ids).toContain('industry_switch')
  })

  it('shows the target-industry question only after choosing to switch', () => {
    const base: Answers = { year: 'alumni', college: 'argyros', industry_current: 'finance' }
    expect(visibleQuestions(base).map((q) => q.id)).not.toContain('industry_target')
    expect(visibleQuestions({ ...base, industry_switch: 'yes' }).map((q) => q.id)).toContain('industry_target')
    expect(visibleQuestions({ ...base, industry_switch: 'no' }).map((q) => q.id)).not.toContain('industry_target')
  })

  it('does not show industry questions to a third-year job seeker', () => {
    const ids = visibleQuestions({ year: 'third', college: 'argyros', goal: 'jobsearch' }).map((q) => q.id)
    expect(ids).not.toContain('industry_current')
    expect(ids).not.toContain('industry_switch')
  })
})
