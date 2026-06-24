export type ResourceKind = 'tool' | 'office'

export type ResourceId =
  | 'handshake' | 'vmock' | 'careershift' | 'vault' | 'goinglobal'
  | 'panther-network' | 'assessments'
  | 'office-central' | 'office-argyros' | 'office-dodge' | 'office-engineering'
  | 'office-schmid' | 'office-crean' | 'office-wilkinson' | 'office-attallah'
  | 'office-copa' | 'office-communication' | 'office-law' | 'office-pharmacy'

export type CollegeId =
  | 'argyros' | 'dodge' | 'engineering' | 'schmid' | 'crean'
  | 'wilkinson' | 'attallah' | 'copa' | 'communication' | 'law'
  | 'pharmacy' | 'undeclared'

/** Scoring sentinel: resolved by the engine to the student's selected office. */
export type OfficeSelected = 'office-selected'
export type ScoreTargetId = ResourceId | OfficeSelected

export interface ResourceAction {
  href?: string
  label?: string
  email?: string
  phone?: string
  location?: string
  hours?: string
  scheduling?: string
}

export interface Resource {
  id: ResourceId
  kind: ResourceKind
  name: string
  whatItIs: string
  action: ResourceAction
  /** Lower = higher priority; used for deterministic tie-breaking. */
  priority: number
}

const HANDSHAKE_LOGIN = 'https://chapman.joinhandshake.com/login'
const HANDSHAKE_APPT = 'https://chapman.joinhandshake.com/appointments/new'

export const RESOURCES: Record<ResourceId, Resource> = {
  handshake: {
    id: 'handshake', kind: 'tool', name: 'Handshake', priority: 1,
    whatItIs: "Chapman's central hub for booking appointments, finding jobs and internships, and registering for career events.",
    action: { href: HANDSHAKE_LOGIN, label: 'Log in to Handshake' },
  },
  vmock: {
    id: 'vmock', kind: 'tool', name: 'Chapman Career AI (VMock)', priority: 2,
    whatItIs: 'Instant AI feedback on your resume, cover letter, and LinkedIn — plus mock interview practice. Free for Chapman students and alumni.',
    action: { href: 'https://www.vmock.com/chapman/login', label: 'Open Chapman Career AI' },
  },
  'panther-network': {
    id: 'panther-network', kind: 'tool', name: 'The Panther Network', priority: 3,
    whatItIs: 'Connect with 80,000+ Chapman alumni for mentorship, advice, and networking.',
    action: { href: 'https://thepanthernetwork.chapman.edu/', label: 'Join the Panther Network' },
  },
  assessments: {
    id: 'assessments', kind: 'tool', name: 'Career Assessments', priority: 3,
    whatItIs: 'Self-guided tools (O*NET, 16Personalities, and more) plus advisor-led MBTI, Strong Interest Inventory, and CliftonStrengths to clarify your direction.',
    action: { href: 'https://www.chapman.edu/campus-services/career-professional-development/resources/assessment.aspx', label: 'Browse assessments' },
  },
  vault: {
    id: 'vault', kind: 'tool', name: 'Vault (Firsthand)', priority: 4,
    whatItIs: 'In-depth employer and industry rankings, ratings, and reviews to research where you want to work.',
    action: { href: 'https://chapman.firsthand.co', label: 'Explore Vault' },
  },
  careershift: {
    id: 'careershift', kind: 'tool', name: 'CareerShift', priority: 4,
    whatItIs: "Organize your job search and uncover employer and alumni contacts in the 'hidden job market.' Accessed through Handshake.",
    action: { href: HANDSHAKE_LOGIN, label: 'Access via Handshake' },
  },
  goinglobal: {
    id: 'goinglobal', kind: 'tool', name: 'GoinGlobal', priority: 4,
    whatItIs: 'International job and internship listings plus country-specific career guides. Accessed through Handshake.',
    action: { href: 'https://chapman.joinhandshake.com/articles/12398', label: 'Open GoinGlobal' },
  },

  'office-central': {
    id: 'office-central', kind: 'office', name: 'Career & Professional Development (Career House)', priority: 0,
    whatItIs: 'The central career office serving all Chapman students and alumni.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'career@chapman.edu', phone: '(714) 997-6942', location: 'Career House, 342 N. Glassell St., Orange, CA 92866', hours: 'Mon–Fri 8 a.m.–5 p.m.', scheduling: 'Handshake' },
  },
  'office-argyros': {
    id: 'office-argyros', kind: 'office', name: 'Argyros College — Career Advancement', priority: 0,
    whatItIs: 'Career advising and employer outreach for Business & Economics students.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'businesscareers@chapman.edu', phone: '(714) 532-6077', location: 'Beckman Hall 305', scheduling: 'Handshake' },
  },
  'office-dodge': {
    id: 'office-dodge', kind: 'office', name: 'Dodge College Career Center', priority: 0,
    whatItIs: 'Entertainment-industry career advising for Film & Media Arts students.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'dodgecareers@chapman.edu', phone: '(714) 516-5909', location: 'Marion Knott Studios, Room 165', scheduling: 'Handshake' },
  },
  'office-engineering': {
    id: 'office-engineering', kind: 'office', name: 'Fowler School of Engineering — Career Services', priority: 0,
    whatItIs: 'Career advising and industry partnerships for Engineering students.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'samuellee@chapman.edu', phone: '(714) 516-5179', location: 'Swenson Hall, Room N-110', scheduling: 'Handshake' },
  },
  'office-schmid': {
    id: 'office-schmid', kind: 'office', name: 'Schmid College Career Advising', priority: 0,
    whatItIs: 'Career advising for Science & Technology students.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'bejar@chapman.edu', phone: '(714) 628-7346', location: 'Keck Center, Room 157', scheduling: 'Handshake' },
  },
  'office-crean': {
    id: 'office-crean', kind: 'office', name: 'Crean College Career Advising', priority: 0,
    whatItIs: 'Career advising for Health & Behavioral Sciences students.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'aaldana@chapman.edu', phone: '(714) 516-5130', location: 'Crean Hall 136', scheduling: 'Handshake' },
  },
  'office-wilkinson': {
    id: 'office-wilkinson', kind: 'office', name: 'Wilkinson College Career Development', priority: 0,
    whatItIs: 'Career advising for Arts, Humanities & Social Sciences students.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'berthon@chapman.edu', phone: '(714) 628-7255', location: 'Roosevelt Hall 106', scheduling: 'Handshake' },
  },
  'office-attallah': {
    id: 'office-attallah', kind: 'office', name: 'Attallah College of Educational Studies', priority: 0,
    whatItIs: 'Career guidance for Educational Studies students (via Academic Affairs).',
    action: { email: 'jwood@chapman.edu', location: 'Reeves Hall 234', scheduling: 'Contact via email' },
  },
  'office-copa': {
    id: 'office-copa', kind: 'office', name: 'College of Performing Arts — Career Development', priority: 0,
    whatItIs: 'Career advising for Performing Arts students.',
    action: { href: HANDSHAKE_APPT, label: 'Book an appointment', email: 'bogenrei@chapman.edu', phone: '(714) 516-5222', location: 'Hashinger Hall 130-A', scheduling: 'Handshake' },
  },
  'office-communication': {
    id: 'office-communication', kind: 'office', name: 'School of Communication Career Advising', priority: 0,
    // Two advisors serve this school; primary contact below, secondary noted here (per reference doc).
    whatItIs: 'Career advising for School of Communication students. Advisors: Dr. Andrea Weber (aweber@chapman.edu, (714) 516-5182) and Matt Prince (maprince@chapman.edu, (714) 496-9302).',
    action: { email: 'aweber@chapman.edu', phone: '(714) 516-5182', location: 'Doti Hall 203 & 206', scheduling: 'Handshake' },
  },
  'office-law': {
    id: 'office-law', kind: 'office', name: 'Fowler School of Law — Career Services Office', priority: 0,
    whatItIs: 'Career counseling, on-campus recruiting, and professional development for Law students.',
    action: { href: 'https://law-chapman-csm.symplicity.com/students/index.php', label: 'Access Symplicity', email: 'lawcareerservices@chapman.edu', phone: '(714) 628-2550', location: 'Kennedy Hall, Third Floor', scheduling: 'Symplicity' },
  },
  'office-pharmacy': {
    id: 'office-pharmacy', kind: 'office', name: 'School of Pharmacy — Career Office', priority: 0,
    whatItIs: 'Career advising, workshops, and recruiting for Pharmacy students.',
    action: { email: 'fugnetti@chapman.edu', phone: '(714) 516-5413', location: 'Rinker Health Science Campus, Irvine', scheduling: 'Contact the office' },
  },
}

export const COLLEGE_TO_OFFICE: Record<CollegeId, ResourceId> = {
  argyros: 'office-argyros',
  dodge: 'office-dodge',
  engineering: 'office-engineering',
  schmid: 'office-schmid',
  crean: 'office-crean',
  wilkinson: 'office-wilkinson',
  attallah: 'office-attallah',
  copa: 'office-copa',
  communication: 'office-communication',
  law: 'office-law',
  pharmacy: 'office-pharmacy',
  undeclared: 'office-central',
}

export function getResource(id: ResourceId): Resource {
  const r = RESOURCES[id]
  if (!r) throw new Error(`Unknown resource id: ${id}`)
  return r
}
