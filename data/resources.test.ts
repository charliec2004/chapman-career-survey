import { describe, it, expect } from 'vitest'
import { RESOURCES, COLLEGE_TO_OFFICE, getResource } from '@/data/resources'

describe('resource catalog', () => {
  it('every resource id matches its map key', () => {
    for (const [key, value] of Object.entries(RESOURCES)) {
      expect(value.id).toBe(key)
    }
  })

  it('maps every college to an existing office resource of kind office', () => {
    for (const officeId of Object.values(COLLEGE_TO_OFFICE)) {
      const office = RESOURCES[officeId]
      expect(office).toBeDefined()
      expect(office.kind).toBe('office')
    }
  })

  it('undeclared routes to the central office', () => {
    expect(COLLEGE_TO_OFFICE.undeclared).toBe('office-central')
  })

  it('law office uses Symplicity scheduling and the verified email', () => {
    const law = getResource('office-law')
    expect(law.action.scheduling).toBe('Symplicity')
    expect(law.action.email).toBe('lawcareerservices@chapman.edu')
  })

  it('vmock points at the verified Chapman Career AI login', () => {
    expect(getResource('vmock').action.href).toBe('https://www.vmock.com/chapman/login')
  })
})
