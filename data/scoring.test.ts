import { describe, it, expect } from 'vitest'
import { SCORING } from '@/data/scoring'
import { RESOURCES } from '@/data/resources'

const isValidTarget = (id: string) => id === 'office-selected' || id in RESOURCES

describe('scoring rules', () => {
  it('every contribution targets a real resource or the office sentinel', () => {
    for (const byOption of Object.values(SCORING)) {
      for (const contributions of Object.values(byOption!)) {
        for (const c of contributions) {
          expect(isValidTarget(c.resourceId), c.resourceId).toBe(true)
          expect(c.weight).toBeGreaterThan(0)
          expect(c.reason.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('maps the job-search "research" option to Vault', () => {
    const ids = SCORING.jobsearch_need!.research.map((c) => c.resourceId)
    expect(ids).toContain('vault')
  })

  it('maps the materials "ai" option to VMock', () => {
    const ids = SCORING.materials_mode!.ai.map((c) => c.resourceId)
    expect(ids).toContain('vmock')
  })
})
