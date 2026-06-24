import { describe, it, expect } from 'vitest'
import { QUESTIONS, visibleQuestions } from '@/data/questions'

describe('questions config', () => {
  it('has unique question ids', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('shows only the three core questions before a goal is chosen', () => {
    const visible = visibleQuestions({ year: 'senior', college: 'argyros' })
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
