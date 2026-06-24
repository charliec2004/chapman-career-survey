import { describe, it, expect } from 'vitest'
import { recommend } from '@/lib/recommendation-engine'
import type { Answers } from '@/data/questions'

describe('recommendation engine', () => {
  it('routes to the college office based on the college answer', () => {
    const answers: Answers = { year: 'third', college: 'dodge', goal: 'jobsearch', jobsearch_need: 'listings', jobsearch_region: 'local' }
    const ids = [...recommend(answers).primary, ...recommend(answers).alsoExplore].map((r) => r.resource.id)
    expect(ids).toContain('office-dodge')
  })

  it('falls back to the central office for undeclared', () => {
    const answers: Answers = { year: 'first', college: 'undeclared', goal: 'explore', explore_assessment: 'no', explore_mode: 'self' }
    const all = [...recommend(answers).primary, ...recommend(answers).alsoExplore]
    expect(all.some((r) => r.resource.id === 'office-central')).toBe(true)
  })

  it('puts the matching college office in primary and pins the general Career Center last', () => {
    const answers: Answers = { year: 'fourth', college: 'argyros', goal: 'materials', materials_which: ['resume'], materials_mode: 'ai' }
    const results = recommend(answers)
    expect(results.primary.some((r) => r.resource.id === 'office-argyros')).toBe(true)
    const last = results.alsoExplore[results.alsoExplore.length - 1]
    expect(last.resource.id).toBe('office-central')
  })

  it('does not duplicate the office for undeclared students (matches central)', () => {
    const answers: Answers = { year: 'second', college: 'undeclared', goal: 'explore', explore_assessment: 'no', explore_mode: 'self' }
    const offices = [...recommend(answers).primary, ...recommend(answers).alsoExplore].filter((r) => r.resource.kind === 'office')
    expect(offices).toHaveLength(1)
    expect(offices[0].resource.id).toBe('office-central')
  })

  it('routes alumni to Alumni Services with the general Career Center pinned last', () => {
    const answers: Answers = { year: 'alumni', college: 'engineering', goal: 'network', network_focus: 'alumni' }
    const results = recommend(answers)
    expect(results.primary.some((r) => r.resource.id === 'office-alumni')).toBe(true)
    const last = results.alsoExplore[results.alsoExplore.length - 1]
    expect(last.resource.id).toBe('office-central')
  })

  it('puts the top-scoring tool first in the primary tier', () => {
    const answers: Answers = { year: 'third', college: 'engineering', goal: 'jobsearch', jobsearch_need: 'research', jobsearch_region: 'local' }
    const results = recommend(answers)
    expect(results.primary[0].resource.id).toBe('vault')
  })

  it('builds reasons from the answers that selected the resource', () => {
    const answers: Answers = { year: 'third', college: 'crean', goal: 'interviews', interview_type: 'general', interview_mode: 'self' }
    const results = recommend(answers)
    const vmock = results.primary.find((r) => r.resource.id === 'vmock')
    expect(vmock).toBeDefined()
    expect(vmock!.reasons).toContain('You want to practice on your own, anytime')
  })

  it('caps also-explore at four items and dedupes reasons', () => {
    const answers: Answers = { year: 'third', college: 'wilkinson', goal: 'materials', materials_which: ['resume', 'cover_letter', 'linkedin'], materials_mode: 'ai' }
    const results = recommend(answers)
    expect(results.alsoExplore.length).toBeLessThanOrEqual(4)
    const vmock = results.primary.find((r) => r.resource.id === 'vmock')!
    expect(new Set(vmock.reasons).size).toBe(vmock.reasons.length)
  })

  it('produces a sensible non-empty result for the grad-school path', () => {
    const answers: Answers = { year: 'fourth', college: 'crean', goal: 'gradschool', gradschool_stage: 'applying' }
    const results = recommend(answers)
    // Office (college-specific) always present in primary; at least one tool recommended.
    expect(results.primary.some((r) => r.resource.id === 'office-crean')).toBe(true)
    expect(results.primary.some((r) => r.resource.kind === 'tool')).toBe(true)
  })

  it('routes an alumni career-changer to the Panther Network and names the target industry', () => {
    const answers: Answers = {
      year: 'alumni', college: 'argyros', goal: 'career_change',
      industry_current: 'finance', industry_switch: 'yes', industry_target: 'tech',
    }
    const results = recommend(answers)
    // Panther Network should be the featured tool for breaking into a new field.
    expect(results.primary[0].resource.id).toBe('panther-network')
    // A reason should name the actual target industry.
    const allReasons = [...results.primary, ...results.alsoExplore].flatMap((r) => r.reasons)
    expect(allReasons.some((reason) => reason.includes('Technology'))).toBe(true)
  })

  it('flags the senior Career Passport nudge only for seniors', () => {
    const base: Answers = { college: 'argyros', goal: 'jobsearch', jobsearch_need: 'listings', jobsearch_region: 'local' }
    expect(recommend({ ...base, year: 'fourth' }).seniorPassportNudge).toBe(true)
    expect(recommend({ ...base, year: 'third' }).seniorPassportNudge).toBe(false)
  })

  it('is deterministic — same answers in different insertion order produce identical output', () => {
    // Build two objects with the same key-value pairs but different property-insertion order.
    const a: Answers = { year: 'third', college: 'argyros', goal: 'jobsearch', jobsearch_need: 'contacts', jobsearch_region: 'local' }
    const b: Answers = { jobsearch_region: 'local', goal: 'jobsearch', college: 'argyros', jobsearch_need: 'contacts', year: 'third' }
    expect(recommend(a)).toEqual(recommend(b))
  })

  it('is deterministic for multi-select (array) answers regardless of element order', () => {
    const a: Answers = { year: 'third', college: 'wilkinson', goal: 'materials', materials_which: ['resume', 'cover_letter', 'linkedin'], materials_mode: 'ai' }
    const b: Answers = { year: 'third', college: 'wilkinson', goal: 'materials', materials_which: ['linkedin', 'resume', 'cover_letter'], materials_mode: 'ai' }
    expect(recommend(a)).toEqual(recommend(b))
  })
})
