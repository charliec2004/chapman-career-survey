import type { Answers } from '@/data/questions'
import {
  RESOURCES, COLLEGE_TO_OFFICE, getResource,
  type Resource, type ResourceId, type CollegeId,
} from '@/data/resources'
import { SCORING } from '@/data/scoring'

export interface Recommendation {
  resource: Resource
  score: number
  reasons: string[]
}

export interface Results {
  primary: Recommendation[]
  alsoExplore: Recommendation[]
  seniorPassportNudge: boolean
}

interface Accum { score: number; reasons: string[] }

const MAX_ALSO_EXPLORE = 4

/** Resolve which office to recommend from the college answer (deny-by-default → central). */
function resolveOfficeId(answers: Answers): ResourceId {
  const college = answers.college as CollegeId | undefined
  if (college && college in COLLEGE_TO_OFFICE) return COLLEGE_TO_OFFICE[college]
  return 'office-central'
}

/** Base reason shown for the recommended office. */
function officeBaseReason(officeId: ResourceId): string {
  return officeId === 'office-central'
    ? 'The central Career & Professional Development office serves all students — a great place to start.'
    : `${getResource(officeId).name} is the dedicated career office for your college — book a one-on-one for personalized guidance.`
}

function addReason(acc: Map<ResourceId, Accum>, id: ResourceId, weight: number, reason: string) {
  const entry = acc.get(id) ?? { score: 0, reasons: [] }
  entry.score += weight
  if (!entry.reasons.includes(reason)) entry.reasons.push(reason)
  acc.set(id, entry)
}

export function recommend(answers: Answers): Results {
  const officeId = resolveOfficeId(answers)
  const acc = new Map<ResourceId, Accum>()

  // Office is always present, with its base reason, before scoring.
  addReason(acc, officeId, 0, officeBaseReason(officeId))

  // Accumulate contributions from every answered question.
  for (const [questionId, answer] of Object.entries(answers)) {
    const optionMap = SCORING[questionId as keyof typeof SCORING]
    if (!optionMap || answer == null) continue
    const values = Array.isArray(answer) ? answer : [answer]
    for (const value of values) {
      const contributions = optionMap[value]
      if (!contributions) continue
      for (const c of contributions) {
        const targetId: ResourceId = c.resourceId === 'office-selected' ? officeId : c.resourceId
        addReason(acc, targetId, c.weight, c.reason)
      }
    }
  }

  const toRec = (id: ResourceId): Recommendation => ({
    resource: getResource(id), score: acc.get(id)!.score, reasons: acc.get(id)!.reasons,
  })

  // Tools with a positive score, sorted by score desc then priority asc then id for stability.
  const toolIds = [...acc.keys()].filter((id) => RESOURCES[id].kind === 'tool' && acc.get(id)!.score > 0)
  toolIds.sort((a, b) => {
    const byScore = acc.get(b)!.score - acc.get(a)!.score
    if (byScore !== 0) return byScore
    const byPriority = RESOURCES[a].priority - RESOURCES[b].priority
    if (byPriority !== 0) return byPriority
    return a.localeCompare(b)
  })

  const office = toRec(officeId)
  const tools = toolIds.map(toRec)

  // Primary: top tool (if any) + the office. Also-explore: remaining tools (≤4).
  const primary: Recommendation[] = tools.length > 0 ? [tools[0], office] : [office]
  const alsoExplore = tools.slice(1, 1 + MAX_ALSO_EXPLORE)

  return { primary, alsoExplore, seniorPassportNudge: answers.year === 'senior' }
}
