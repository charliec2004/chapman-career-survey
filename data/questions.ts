export type GoalValue =
  | 'explore' | 'materials' | 'interviews' | 'jobsearch'
  | 'network' | 'gradschool' | 'international'

export type QuestionId =
  | 'year' | 'college' | 'goal'
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
  options: Option[]
  isVisible: (answers: Answers) => boolean
}

const always = (_: Answers): boolean => true
const whenGoal = (g: GoalValue) => (a: Answers): boolean => typeof a.goal === 'string' && a.goal === g

export const QUESTIONS: Question[] = [
  {
    id: 'year', type: 'single', isVisible: always,
    prompt: 'Where are you in your Chapman journey?',
    options: [
      { value: 'early', label: 'First or second year' },
      { value: 'junior', label: 'Junior' },
      { value: 'senior', label: 'Senior / graduating' },
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
    options: [
      { value: 'explore', label: 'Explore my career or major direction' },
      { value: 'materials', label: 'Build my application materials' },
      { value: 'interviews', label: 'Prepare for interviews' },
      { value: 'jobsearch', label: 'Search for jobs or internships' },
      { value: 'network', label: 'Network and find mentors' },
      { value: 'gradschool', label: 'Plan for grad school' },
      { value: 'international', label: 'Work or intern internationally' },
    ],
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
      { value: 'unsure', label: "Not sure yet" },
    ],
  },
]

export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => q.isVisible(answers))
}
