export type GoalValue =
  | 'explore' | 'materials' | 'interviews' | 'jobsearch'
  | 'network' | 'gradschool' | 'international' | 'career_change'

export type QuestionId =
  | 'year' | 'college' | 'goal'
  | 'industry_current' | 'industry_switch' | 'industry_target'
  | 'explore_assessment' | 'explore_mode'
  | 'materials_which' | 'materials_mode'
  | 'interview_type' | 'interview_mode'
  | 'jobsearch_need' | 'jobsearch_region'
  | 'network_focus'
  | 'gradschool_stage'
  | 'international_region'

export type AnswerValue = string | string[]
export type Answers = Partial<Record<QuestionId, AnswerValue>>

export interface Option { value: string; label: string }

export interface Question {
  id: QuestionId
  prompt: string
  helpText?: string
  type: 'single' | 'multi'
  /** Static list, or a function of the current answers (used for persona-adaptive goals). */
  options: Option[] | ((a: Answers) => Option[])
  isVisible: (answers: Answers) => boolean
}

/** Resolve a question's options against the current answers. */
export function optionsFor(q: Question, a: Answers): Option[] {
  return typeof q.options === 'function' ? q.options(a) : q.options
}

// ---- Personas (derived from class year) ------------------------------------

type Persona = 'early' | 'upper' | 'grad' | 'alumni' | 'unknown'

function persona(a: Answers): Persona {
  switch (a.year) {
    case 'first':
    case 'second':
      return 'early'
    case 'third':
    case 'fourth':
      return 'upper'
    case 'grad':
      return 'grad'
    case 'alumni':
      return 'alumni'
    default:
      return 'unknown'
  }
}

const GOAL_LABELS: Record<GoalValue, string> = {
  explore: 'Explore my career or major direction',
  materials: 'Build my application materials',
  interviews: 'Prepare for interviews',
  jobsearch: 'Search for jobs or internships',
  network: 'Network and find mentors',
  gradschool: 'Plan for grad school',
  international: 'Work or intern internationally',
  career_change: 'Change careers or industries',
}

// Which goals each persona sees, in display order.
const PERSONA_GOALS: Record<Persona, GoalValue[]> = {
  early: ['explore', 'materials', 'network', 'international'],
  upper: ['explore', 'materials', 'interviews', 'jobsearch', 'network', 'gradschool', 'international'],
  grad: ['materials', 'interviews', 'jobsearch', 'network', 'gradschool', 'career_change', 'international'],
  alumni: ['career_change', 'network', 'jobsearch', 'materials', 'interviews', 'international'],
  unknown: ['explore', 'materials', 'interviews', 'jobsearch', 'network', 'gradschool', 'international', 'career_change'],
}

function goalOptions(a: Answers): Option[] {
  return PERSONA_GOALS[persona(a)].map((v) => ({ value: v, label: GOAL_LABELS[v] }))
}

// ---- Industries (for alumni / career-changers / explorers) -----------------

export const INDUSTRIES: Option[] = [
  { value: 'tech', label: 'Technology & Software' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'entertainment', label: 'Film, TV & Entertainment' },
  { value: 'marketing', label: 'Marketing, Advertising & PR' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government & Public Policy' },
  { value: 'nonprofit', label: 'Nonprofit & Social Impact' },
  { value: 'law', label: 'Law & Legal' },
  { value: 'engineering', label: 'Engineering & Manufacturing' },
  { value: 'science', label: 'Science & Research' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'arts', label: 'Arts & Design' },
]

/** Industry questions are shown to alumni/grads and to anyone exploring or switching fields. */
function showIndustry(a: Answers): boolean {
  const p = persona(a)
  return p === 'alumni' || p === 'grad' || a.goal === 'explore' || a.goal === 'career_change'
}

const always = (_: Answers): boolean => true
const whenGoal = (g: GoalValue) => (a: Answers): boolean => typeof a.goal === 'string' && a.goal === g

export const QUESTIONS: Question[] = [
  {
    id: 'year', type: 'single', isVisible: always,
    prompt: 'Where are you in your Chapman journey?',
    options: [
      { value: 'first', label: 'First year' },
      { value: 'second', label: 'Second year' },
      { value: 'third', label: 'Third year' },
      { value: 'fourth', label: 'Fourth year' },
      { value: 'grad', label: 'Graduate student' },
      { value: 'alumni', label: 'Alumni' },
    ],
  },
  {
    id: 'college', type: 'single', isVisible: always,
    prompt: 'Which college or school are you in?',
    helpText: 'This helps us connect you with the right career office.',
    options: [
      { value: 'argyros', label: 'Argyros (Business & Economics)' },
      { value: 'dodge', label: 'Dodge (Film & Media Arts)' },
      { value: 'engineering', label: 'Fowler (Engineering)' },
      { value: 'schmid', label: 'Schmid (Science & Technology)' },
      { value: 'crean', label: 'Crean (Health & Behavioral Sciences)' },
      { value: 'wilkinson', label: 'Wilkinson (Arts, Humanities & Social Sciences)' },
      { value: 'attallah', label: 'Attallah (Educational Studies)' },
      { value: 'copa', label: 'College of Performing Arts' },
      { value: 'communication', label: 'School of Communication' },
      { value: 'law', label: 'Fowler School of Law' },
      { value: 'pharmacy', label: 'School of Pharmacy' },
      { value: 'undeclared', label: 'Undeclared / Other' },
    ],
  },
  {
    id: 'goal', type: 'single', isVisible: always,
    prompt: 'What brings you here today?',
    helpText: 'Pick the one that fits best right now.',
    options: goalOptions, // persona-adaptive
  },

  // ---- Industry / career-change branch -------------------------------------
  {
    id: 'industry_current', type: 'single', isVisible: showIndustry,
    prompt: 'Which industry are you in or closest to?',
    options: [
      ...INDUSTRIES,
      { value: 'none', label: 'Not in one yet / still exploring' },
    ],
  },
  {
    id: 'industry_switch', type: 'single', isVisible: showIndustry,
    prompt: 'Are you looking to break into a different industry?',
    options: [
      { value: 'yes', label: 'Yes — a different field' },
      { value: 'no', label: 'No — staying in my field' },
    ],
  },
  {
    id: 'industry_target', type: 'single',
    isVisible: (a) => showIndustry(a) && a.industry_switch === 'yes',
    prompt: 'Which industry are you aiming for?',
    options: INDUSTRIES,
  },

  {
    id: 'explore_assessment', type: 'single', isVisible: whenGoal('explore'),
    prompt: 'Have you taken a career or personality assessment yet?',
    options: [
      { value: 'no', label: 'Not yet' },
      { value: 'yes', label: 'Yes, I have' },
    ],
  },
  {
    id: 'explore_mode', type: 'single', isVisible: whenGoal('explore'),
    prompt: 'How would you like to explore?',
    options: [
      { value: 'self', label: 'Self-guided online tools' },
      { value: 'advisor', label: 'Talk it through with an advisor' },
    ],
  },

  {
    id: 'materials_which', type: 'multi', isVisible: whenGoal('materials'),
    prompt: 'Which materials do you want to work on?',
    helpText: 'Choose all that apply.',
    options: [
      { value: 'resume', label: 'Resume' },
      { value: 'cover_letter', label: 'Cover letter' },
      { value: 'linkedin', label: 'LinkedIn profile' },
    ],
  },
  {
    id: 'materials_mode', type: 'single', isVisible: whenGoal('materials'),
    prompt: 'What kind of feedback do you want?',
    options: [
      { value: 'ai', label: 'Instant AI feedback' },
      { value: 'human', label: 'A person to review it with me' },
    ],
  },

  {
    id: 'interview_type', type: 'single', isVisible: whenGoal('interviews'),
    prompt: 'What are you preparing for?',
    options: [
      { value: 'general', label: 'General interview practice' },
      { value: 'specific', label: 'A specific upcoming interview' },
    ],
  },
  {
    id: 'interview_mode', type: 'single', isVisible: whenGoal('interviews'),
    prompt: 'How do you want to practice?',
    options: [
      { value: 'self', label: 'On my own, anytime' },
      { value: 'person', label: 'With a person' },
    ],
  },

  {
    id: 'jobsearch_need', type: 'single', isVisible: whenGoal('jobsearch'),
    prompt: 'What do you need most right now?',
    options: [
      { value: 'listings', label: 'Find job / internship listings' },
      { value: 'research', label: 'Research employers and industries' },
      { value: 'contacts', label: 'Find contacts and the hidden job market' },
    ],
  },
  {
    id: 'jobsearch_region', type: 'single', isVisible: whenGoal('jobsearch'),
    prompt: 'Where are you looking?',
    options: [
      { value: 'local', label: 'U.S. / local' },
      { value: 'international', label: 'Internationally' },
    ],
  },

  {
    id: 'network_focus', type: 'single', isVisible: whenGoal('network'),
    prompt: 'What is your networking goal?',
    options: [
      { value: 'alumni', label: 'Connect with alumni and mentors' },
      { value: 'linkedin', label: 'Build my LinkedIn presence' },
    ],
  },

  {
    id: 'gradschool_stage', type: 'single', isVisible: whenGoal('gradschool'),
    prompt: 'Where are you in the grad school process?',
    options: [
      { value: 'deciding', label: 'Deciding whether to go' },
      { value: 'applying', label: 'Applying to programs' },
      { value: 'materials', label: 'Working on application materials' },
    ],
  },

  {
    id: 'international_region', type: 'single', isVisible: whenGoal('international'),
    prompt: 'Any particular region in mind?',
    helpText: 'Optional — it helps us point you to the right guides.',
    options: [
      { value: 'europe', label: 'Europe' },
      { value: 'asia', label: 'Asia' },
      { value: 'americas', label: 'Americas' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
]

export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => q.isVisible(answers))
}
