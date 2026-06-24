import type { ScoreTargetId } from '@/data/resources'
import type { QuestionId } from '@/data/questions'

export interface Contribution {
  resourceId: ScoreTargetId
  weight: number
  reason: string
}

/**
 * For each question, maps an answer option value to the resources it points to,
 * with a weight and a plain-language reason fragment ("Why this fits you").
 * 'office-selected' is resolved by the engine to the student's college office.
 * Reasons are fixed strings — no generated text — so results stay deterministic.
 */
export const SCORING: Partial<Record<QuestionId, Record<string, Contribution[]>>> = {
  // 'goal' is a weak signal (weight 1): it sets the student's mode, but their specific follow-up answers (weight 2-3) should drive the primary recommendation.
  goal: {
    explore: [{ resourceId: 'assessments', weight: 1, reason: 'You want to explore your career or major direction' }],
    materials: [{ resourceId: 'vmock', weight: 1, reason: 'You want to build your application materials' }],
    interviews: [{ resourceId: 'vmock', weight: 1, reason: "You're preparing for interviews" }],
    jobsearch: [{ resourceId: 'handshake', weight: 1, reason: "You're searching for jobs or internships" }],
    network: [{ resourceId: 'panther-network', weight: 1, reason: 'You want to network and find mentors' }],
    gradschool: [
      { resourceId: 'office-selected', weight: 1, reason: "You're planning for grad school" },
      { resourceId: 'panther-network', weight: 1, reason: 'Alumni who attended grad school can offer guidance' },
    ],
    international: [{ resourceId: 'goinglobal', weight: 1, reason: 'You want to work or intern internationally' }],
  },

  explore_assessment: {
    no: [{ resourceId: 'assessments', weight: 2, reason: "You haven't taken a career assessment yet" }],
    yes: [{ resourceId: 'office-selected', weight: 2, reason: 'You can review your assessment results with an advisor' }],
  },
  explore_mode: {
    self: [{ resourceId: 'assessments', weight: 3, reason: 'You prefer self-guided online tools' }],
    advisor: [{ resourceId: 'office-selected', weight: 3, reason: "You'd rather talk it through with an advisor" }],
  },

  materials_which: {
    resume: [{ resourceId: 'vmock', weight: 2, reason: 'You want resume feedback' }],
    cover_letter: [{ resourceId: 'vmock', weight: 2, reason: 'You want cover letter feedback' }],
    linkedin: [
      { resourceId: 'vmock', weight: 2, reason: 'You want LinkedIn profile feedback' },
      { resourceId: 'panther-network', weight: 1, reason: 'A strong LinkedIn helps you network with alumni' },
    ],
  },
  materials_mode: {
    ai: [{ resourceId: 'vmock', weight: 3, reason: 'You want instant AI feedback' }],
    human: [{ resourceId: 'office-selected', weight: 3, reason: 'You want a person to review your materials' }],
  },

  interview_type: {
    general: [{ resourceId: 'vmock', weight: 2, reason: 'You want general interview practice' }],
    specific: [
      { resourceId: 'office-selected', weight: 2, reason: 'You have a specific interview coming up' },
      { resourceId: 'vmock', weight: 1, reason: 'You can rehearse with AI mock interviews' },
    ],
  },
  interview_mode: {
    self: [{ resourceId: 'vmock', weight: 3, reason: 'You want to practice on your own, anytime' }],
    person: [{ resourceId: 'office-selected', weight: 3, reason: 'You want to practice with a person' }],
  },

  jobsearch_need: {
    listings: [{ resourceId: 'handshake', weight: 3, reason: 'You need to find job and internship listings' }],
    research: [{ resourceId: 'vault', weight: 3, reason: 'You want to research employers and industries' }],
    contacts: [
      { resourceId: 'careershift', weight: 3, reason: 'You want to find contacts and the hidden job market' },
      { resourceId: 'panther-network', weight: 1, reason: 'Alumni are a great source of contacts' },
    ],
  },
  jobsearch_region: {
    local: [{ resourceId: 'handshake', weight: 1, reason: "You're focused on U.S. and local opportunities" }],
    international: [{ resourceId: 'goinglobal', weight: 3, reason: "You're looking at international opportunities" }],
  },

  network_focus: {
    alumni: [{ resourceId: 'panther-network', weight: 3, reason: 'You want to connect with alumni and mentors' }],
    linkedin: [
      { resourceId: 'vmock', weight: 3, reason: 'You want to build your LinkedIn presence' },
      { resourceId: 'panther-network', weight: 1, reason: 'LinkedIn pairs well with alumni networking' },
    ],
  },

  gradschool_stage: {
    deciding: [
      { resourceId: 'office-selected', weight: 2, reason: "You're deciding whether grad school is right for you" },
      { resourceId: 'assessments', weight: 1, reason: 'Assessments can help clarify your direction' },
    ],
    applying: [{ resourceId: 'office-selected', weight: 2, reason: "You're applying to programs" }],
    materials: [
      { resourceId: 'vmock', weight: 2, reason: 'You need help with application materials' },
      { resourceId: 'office-selected', weight: 1, reason: 'An advisor can review your application' },
    ],
  },

  international_region: {
    europe: [{ resourceId: 'goinglobal', weight: 1, reason: 'You named a target region (Europe)' }],
    asia: [{ resourceId: 'goinglobal', weight: 1, reason: 'You named a target region (Asia)' }],
    americas: [{ resourceId: 'goinglobal', weight: 1, reason: 'You named a target region (Americas)' }],
    unsure: [{ resourceId: 'goinglobal', weight: 1, reason: 'GoinGlobal can help you explore regions' }],
  },
}
