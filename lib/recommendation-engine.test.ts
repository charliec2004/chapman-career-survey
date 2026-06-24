import { describe, it, expect } from 'vitest'
import { recommend } from '@/lib/recommendation-engine'
import type { Answers } from '@/data/questions'

describe('recommendation engine', () => {
  it('routes to the college office based on the college answer', () => {
    const answers: Answers = { year: 'junior', college: 'dodge', goal: 'jobsearch', jobsearch_need: 'listings', jobsearch_region: 'local' }
    const ids = [...recommend(answers).primary, ...recommend(answers).alsoExplore].map((r) => r.resource.id)
    expect(ids).toContain('office-dodge')
  })

  it('falls back to the central office for undeclared', () => {
    const answers: Answers = { year: 'early', college: 'undeclared', goal: 'explore', explore_assessment: 'no', explore_mode: 'self' }
    const all = [...recommend(answers).primary, ...recommend(answers).alsoExplore]
    expect(all.some((r) => r.resource.id === 'office-central')).toBe(true)
  })

  it('always includes exactly one office, and it appears in the primary tier', () => {
    const answers: Answers = { year: 'senior', college: 'argyros', goal: 'materials', materials_which: ['resume'], materials_mode: 'ai' }
    const results = recommend(answers)
    const offices = [...results.primary, ...results.alsoExplore].filter((r) => r.resource.kind === 'office')
    expect(offices).toHaveLength(1)
    expect(results.primary.some((r) => r.resource.kind === 'office')).toBe(true)
  })

  it('puts the top-scoring tool first in the primary tier', () => {
    const answers: Answers = { year: 'junior', college: 'engineering', goal: 'jobsearch', jobsearch_need: 'research', jobsearch_region: 'local' }
    const results = recommend(answers)
    expect(results.primary[0].resource.id).toBe('vault')
  })

  it('builds reasons from the answers that selected the resource', () => {
    const answers: Answers = { year: 'junior', college: 'crean', goal: 'interviews', interview_type: 'general', interview_mode: 'self' }
    const results = recommend(answers)
    const vmock = results.primary.find((r) => r.resource.id === 'vmock')
    expect(vmock).toBeDefined()
    expect(vmock!.reasons).toContain('You want to practice on your own, anytime')
  })

  it('caps also-explore at four items and dedupes reasons', () => {
    const answers: Answers = { year: 'junior', college: 'wilkinson', goal: 'materials', materials_which: ['resume', 'cover_letter', 'linkedin'], materials_mode: 'ai' }
    const results = recommend(answers)
    expect(results.alsoExplore.length).toBeLessThanOrEqual(4)
    const vmock = results.primary.find((r) => r.resource.id === 'vmock')!
    expect(new Set(vmock.reasons).size).toBe(vmock.reasons.length)
  })

  it('produces a sensible non-empty result for the grad-school path', () => {
    const answers: Answers = { year: 'senior', college: 'crean', goal: 'gradschool', gradschool_stage: 'applying' }
    const results = recommend(answers)
    // Office (college-specific) always present in primary; at least one tool recommended.
    expect(results.primary.some((r) => r.resource.id === 'office-crean')).toBe(true)
    expect(results.primary.some((r) => r.resource.kind === 'tool')).toBe(true)
  })

  it('flags the senior Career Passport nudge only for seniors', () => {
    const base: Answers = { college: 'argyros', goal: 'jobsearch', jobsearch_need: 'listings', jobsearch_region: 'local' }
    expect(recommend({ ...base, year: 'senior' }).seniorPassportNudge).toBe(true)
    expect(recommend({ ...base, year: 'junior' }).seniorPassportNudge).toBe(false)
  })

  it('is deterministic — same answers in different insertion order produce identical output', () => {
    // Build two objects with the same key-value pairs but different property-insertion order.
    const a: Answers = { year: 'junior', college: 'argyros', goal: 'jobsearch', jobsearch_need: 'contacts', jobsearch_region: 'local' }
    const b: Answers = { jobsearch_region: 'local', goal: 'jobsearch', college: 'argyros', jobsearch_need: 'contacts', year: 'junior' }
    expect(recommend(a)).toEqual(recommend(b))
  })

  it('is deterministic for multi-select (array) answers regardless of element order', () => {
    const a: Answers = { year: 'junior', college: 'wilkinson', goal: 'materials', materials_which: ['resume', 'cover_letter', 'linkedin'], materials_mode: 'ai' }
    const b: Answers = { year: 'junior', college: 'wilkinson', goal: 'materials', materials_which: ['linkedin', 'resume', 'cover_letter'], materials_mode: 'ai' }
    expect(recommend(a)).toEqual(recommend(b))
  })
})
