# Chapman Career Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chapman-branded, mobile-first adaptive survey that routes students to the right Chapman career services and ends with tiered, explained recommendations.

**Architecture:** A fully client-side Next.js (App Router) static-export app. Survey questions, the recommendation catalog, and scoring rules are typed *data*; a pure recommendation engine and a pure survey reducer hold the *logic* (both unit-tested via TDD); React components are the replaceable *UI*. No backend, no persistence; the contact form is intentionally inert.

**Tech Stack:** Next.js 15 (App Router) + React 19 + TypeScript, static export (`output: 'export'`), Tailwind CSS v4, `next/font/google` (Jost + Source Serif 4), Vitest + @testing-library/react (jsdom) for tests.

## Global Constraints

- Next.js with `output: 'export'` — must produce a static `out/` build; **no server-only features** (no API routes, no server actions, no dynamic server rendering, no `next/image` optimization → use plain `<img>` or `images: { unoptimized: true }`).
- TypeScript everywhere; `strict` mode on.
- **No data is stored or transmitted.** No analytics. No PII leaves the browser.
- **Contact form is inert:** on submit, no network call; show a toast and reset. Leave code comments documenting the intended future serverless email-to-office hookup and FERPA/consent obligations.
- **Branding (Chapman-inspired, NOT official):** colors — Chapman Red `#A50034` (primary accent), Panther Black `#231F20` (body text), white; Grove `#00966C` / Pacific `#009CA6` sparing accents; Pillar `#6E6259` warm neutral; Sand `#DDCBA4` **never as text on white**. Fonts — headings Jost (Futura substitute), body Source Serif 4 (Minion substitute). **Do NOT reproduce Chapman's official logo, window icon, or seal** — use a text wordmark + geometric (window/triangle) accents only. Tagline available: "Driven by Curiosity. Inspired by Chapman."
- **Accessibility:** WCAG AA contrast, full keyboard operation, visible focus states, semantic HTML + ARIA, honor `prefers-reduced-motion`, tap targets ≥ 44px.
- **All links/contacts must match** `docs/research/chapman-career-services-reference.md` verbatim. Never fabricate URLs/emails/phones.
- Commit after every task with a conventional-commit message.

---

## File Structure

```
next.config.ts              # output: 'export', images unoptimized
postcss.config.mjs          # @tailwindcss/postcss
vitest.config.ts            # jsdom env, react plugin, setup file
vitest.setup.ts             # jest-dom matchers
tsconfig.json               # strict, path alias @/*
app/
  layout.tsx                # fonts, metadata, <html>/<body>
  page.tsx                  # orchestration: reducer + screens
  globals.css               # tailwind import + @theme tokens + base styles
data/
  questions.ts              # Question types + QUESTIONS config (branching via isVisible)
  resources.ts              # Resource types + RESOURCES catalog + COLLEGE_TO_OFFICE
  scoring.ts                # Contribution type + SCORING rules
lib/
  recommendation-engine.ts  # recommend(answers) -> Results  (pure, tested)
  recommendation-engine.test.ts
  survey-reducer.ts         # surveyReducer + helpers (pure, tested)
  survey-reducer.test.ts
components/
  BrandHeader.tsx           # text wordmark + tagline, geometric accent
  ProgressBar.tsx
  QuestionCard.tsx          # renders single/multi question
  IntroScreen.tsx
  ResultsView.tsx           # tiers + senior nudge
  ResultCard.tsx
  ContactForm.tsx           # inert, validated
  Toast.tsx
  ContactForm.test.tsx
```

---

## Task 1: Project scaffold, tooling, and build pipeline

**Files:**
- Create: `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `lib/smoke.test.ts`
- Test: `lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a buildable app skeleton; the `@/*` path alias; a passing Vitest setup. Later tasks import from `@/data/...`, `@/lib/...`, `@/components/...`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "chapman-career-survey",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: completes, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export', // fully static build into out/
  images: { unoptimized: true }, // required for static export
}

export default nextConfig
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
})
```

- [ ] **Step 7: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 8: Create `app/globals.css`** (brand tokens live here)

```css
@import "tailwindcss";

@theme {
  --color-chapman-red: #A50034;
  --color-panther-black: #231F20;
  --color-grove: #00966C;
  --color-pacific: #009CA6;
  --color-pillar: #6E6259;
  --color-sand: #DDCBA4;

  --font-heading: var(--font-jost), "Century Gothic", Arial, sans-serif;
  --font-body: var(--font-source-serif), Georgia, serif;
}

:root { color-scheme: light; }

body {
  background: #ffffff;
  color: var(--color-panther-black);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, .font-heading { font-family: var(--font-heading); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 9: Create `app/layout.tsx`** (fonts + metadata)

```tsx
import type { Metadata } from 'next'
import { Jost, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap' })

export const metadata: Metadata = {
  title: 'Chapman Career Services Finder',
  description: 'Answer a few questions and discover the Chapman career resources that fit you best.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 10: Create placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-heading text-chapman-red">Chapman Career Services Finder</h1>
      <p className="mt-4">Coming together…</p>
    </main>
  )
}
```

- [ ] **Step 11: Write the smoke test `lib/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest'

describe('toolchain smoke test', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 12: Run the smoke test**

Run: `npm test`
Expected: PASS (1 test passed).

- [ ] **Step 13: Verify the static build works**

Run: `npm run build`
Expected: build succeeds and creates an `out/` directory containing `index.html`.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js static-export app with Tailwind and Vitest"
```

---

## Task 2: Resource catalog and college→office mapping

**Files:**
- Create: `data/resources.ts`
- Test: `data/resources.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type ResourceId` (string union, see code), `type CollegeId`, `type ResourceKind = 'tool' | 'office'`
  - `interface ResourceAction { href?: string; label?: string; email?: string; phone?: string; location?: string; hours?: string; scheduling?: string }`
  - `interface Resource { id: ResourceId; kind: ResourceKind; name: string; whatItIs: string; action: ResourceAction; priority: number }`
  - `const RESOURCES: Record<ResourceId, Resource>`
  - `const COLLEGE_TO_OFFICE: Record<CollegeId, ResourceId>`
  - `function getResource(id: ResourceId): Resource`
  - Special scoring sentinel (consumed by scoring/engine, not a real resource): the string literal `'office-selected'` is exported as `type OfficeSelected = 'office-selected'` and `type ScoreTargetId = ResourceId | OfficeSelected`.

- [ ] **Step 1: Write the failing test `data/resources.test.ts`**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run data/resources.test.ts`
Expected: FAIL ("Cannot find module '@/data/resources'").

- [ ] **Step 3: Create `data/resources.ts`** (all data from the reference doc)

```ts
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
    whatItIs: 'Career advising for School of Communication students.',
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run data/resources.test.ts`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add data/resources.ts data/resources.test.ts
git commit -m "feat: add verified Chapman resource catalog and office mapping"
```

---

## Task 3: Questions config with branching

**Files:**
- Create: `data/questions.ts`
- Test: `data/questions.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type QuestionId` (union below), `type GoalValue`, `type CollegeId` re-used from resources.
  - `type AnswerValue = string | string[]`
  - `type Answers = Partial<Record<QuestionId, AnswerValue>>`
  - `interface Option { value: string; label: string }`
  - `interface Question { id: QuestionId; prompt: string; helpText?: string; type: 'single' | 'multi'; options: Option[]; isVisible: (answers: Answers) => boolean }`
  - `const QUESTIONS: Question[]` (ordered)
  - `function visibleQuestions(answers: Answers): Question[]`

- [ ] **Step 1: Write the failing test `data/questions.test.ts`**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run data/questions.test.ts`
Expected: FAIL ("Cannot find module '@/data/questions'").

- [ ] **Step 3: Create `data/questions.ts`**

```ts
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

const always = () => true
const whenGoal = (g: GoalValue) => (a: Answers) => a.goal === g

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run data/questions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/questions.ts data/questions.test.ts
git commit -m "feat: add adaptive survey questions config with branching"
```

---

## Task 4: Scoring rules

**Files:**
- Create: `data/scoring.ts`
- Test: `data/scoring.test.ts`

**Interfaces:**
- Consumes: `ScoreTargetId` from `@/data/resources`; `QuestionId` from `@/data/questions`.
- Produces:
  - `interface Contribution { resourceId: ScoreTargetId; weight: number; reason: string }`
  - `const SCORING: Partial<Record<QuestionId, Record<string, Contribution[]>>>`

- [ ] **Step 1: Write the failing test `data/scoring.test.ts`**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run data/scoring.test.ts`
Expected: FAIL ("Cannot find module '@/data/scoring'").

- [ ] **Step 3: Create `data/scoring.ts`**

```ts
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
  goal: {
    explore: [{ resourceId: 'assessments', weight: 3, reason: 'You want to explore your career or major direction' }],
    materials: [{ resourceId: 'vmock', weight: 3, reason: 'You want to build your application materials' }],
    interviews: [{ resourceId: 'vmock', weight: 3, reason: "You're preparing for interviews" }],
    jobsearch: [{ resourceId: 'handshake', weight: 3, reason: "You're searching for jobs or internships" }],
    network: [{ resourceId: 'panther-network', weight: 3, reason: 'You want to network and find mentors' }],
    gradschool: [
      { resourceId: 'office-selected', weight: 3, reason: "You're planning for grad school" },
      { resourceId: 'panther-network', weight: 1, reason: 'Alumni who attended grad school can offer guidance' },
    ],
    international: [{ resourceId: 'goinglobal', weight: 3, reason: 'You want to work or intern internationally' }],
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run data/scoring.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/scoring.ts data/scoring.test.ts
git commit -m "feat: add deterministic scoring rules mapping answers to resources"
```

---

## Task 5: Recommendation engine

**Files:**
- Create: `lib/recommendation-engine.ts`
- Test: `lib/recommendation-engine.test.ts`

**Interfaces:**
- Consumes: `Answers` from `@/data/questions`; `RESOURCES`, `COLLEGE_TO_OFFICE`, `getResource`, `Resource`, `ResourceId`, `CollegeId` from `@/data/resources`; `SCORING` from `@/data/scoring`.
- Produces:
  - `interface Recommendation { resource: Resource; score: number; reasons: string[] }`
  - `interface Results { primary: Recommendation[]; alsoExplore: Recommendation[]; seniorPassportNudge: boolean }`
  - `function recommend(answers: Answers): Results`

- [ ] **Step 1: Write the failing test `lib/recommendation-engine.test.ts`**

```ts
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

  it('flags the senior Career Passport nudge only for seniors', () => {
    const base: Answers = { college: 'argyros', goal: 'jobsearch', jobsearch_need: 'listings', jobsearch_region: 'local' }
    expect(recommend({ ...base, year: 'senior' }).seniorPassportNudge).toBe(true)
    expect(recommend({ ...base, year: 'junior' }).seniorPassportNudge).toBe(false)
  })

  it('is deterministic — same answers, same output', () => {
    const answers: Answers = { year: 'grad', college: 'schmid', goal: 'network', network_focus: 'alumni' }
    expect(recommend(answers)).toEqual(recommend(answers))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/recommendation-engine.test.ts`
Expected: FAIL ("Cannot find module '@/lib/recommendation-engine'").

- [ ] **Step 3: Create `lib/recommendation-engine.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/recommendation-engine.test.ts`
Expected: PASS (all 8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/recommendation-engine.ts lib/recommendation-engine.test.ts
git commit -m "feat: add deterministic recommendation engine with tiered results"
```

---

## Task 6: Survey reducer (navigation & branching state)

**Files:**
- Create: `lib/survey-reducer.ts`
- Test: `lib/survey-reducer.test.ts`

**Interfaces:**
- Consumes: `Answers`, `AnswerValue`, `QuestionId`, `Question`, `visibleQuestions` from `@/data/questions`.
- Produces:
  - `type Phase = 'intro' | 'survey' | 'results'`
  - `interface SurveyState { phase: Phase; answers: Answers; index: number }`
  - `type SurveyAction = { type: 'start' } | { type: 'answer'; id: QuestionId; value: AnswerValue } | { type: 'next' } | { type: 'back' } | { type: 'restart' }`
  - `const initialState: SurveyState`
  - `function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState`
  - `function currentQuestion(state: SurveyState): Question | null`
  - `function canAdvance(state: SurveyState): boolean`
  - `function progress(state: SurveyState): { current: number; total: number }`

- [ ] **Step 1: Write the failing test `lib/survey-reducer.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import {
  initialState, surveyReducer, currentQuestion, canAdvance, progress,
  type SurveyState,
} from '@/lib/survey-reducer'

const start = (): SurveyState => surveyReducer(initialState, { type: 'start' })

describe('survey reducer', () => {
  it('starts on the intro phase', () => {
    expect(initialState.phase).toBe('intro')
  })

  it('moves to the survey on start and shows the first question', () => {
    const s = start()
    expect(s.phase).toBe('survey')
    expect(currentQuestion(s)?.id).toBe('year')
  })

  it('cannot advance until the current question is answered', () => {
    const s = start()
    expect(canAdvance(s)).toBe(false)
    const answered = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    expect(canAdvance(answered)).toBe(true)
  })

  it('walks the core questions in order', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'next' })
    expect(currentQuestion(s)?.id).toBe('college')
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'next' })
    expect(currentQuestion(s)?.id).toBe('goal')
  })

  it('branches: choosing materials surfaces the materials follow-ups', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'materials' })
    s = surveyReducer(s, { type: 'next' })
    expect(currentQuestion(s)?.id).toBe('materials_which')
  })

  it('reaches results after the last visible question', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'senior' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'law' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'gradschool' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'answer', id: 'gradschool_stage', value: 'applying' })
    s = surveyReducer(s, { type: 'next' })
    expect(s.phase).toBe('results')
  })

  it('back returns to the previous visible question', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'next' })
    s = surveyReducer(s, { type: 'back' })
    expect(currentQuestion(s)?.id).toBe('year')
  })

  it('changing an earlier branch answer drops now-invisible later answers on results', () => {
    // Build a full materials path, then change goal to network and confirm materials answers are gone.
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'materials' })
    s = surveyReducer(s, { type: 'answer', id: 'materials_which', value: ['resume'] })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'network' })
    expect(s.answers.materials_which).toBeUndefined()
  })

  it('progress reports current and total visible questions', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'answer', id: 'college', value: 'argyros' })
    s = surveyReducer(s, { type: 'answer', id: 'goal', value: 'network' })
    const p = progress(s)
    expect(p.total).toBe(4) // year, college, goal, network_focus
    expect(p.current).toBe(1) // still on year (index 0) -> 1-based
  })

  it('restart returns to intro with no answers', () => {
    let s = start()
    s = surveyReducer(s, { type: 'answer', id: 'year', value: 'junior' })
    s = surveyReducer(s, { type: 'restart' })
    expect(s).toEqual(initialState)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/survey-reducer.test.ts`
Expected: FAIL ("Cannot find module '@/lib/survey-reducer'").

- [ ] **Step 3: Create `lib/survey-reducer.ts`**

```ts
import {
  visibleQuestions, type Answers, type AnswerValue, type QuestionId, type Question,
} from '@/data/questions'

export type Phase = 'intro' | 'survey' | 'results'

export interface SurveyState {
  phase: Phase
  answers: Answers
  /** Index into the *current* visible-questions list. */
  index: number
}

export type SurveyAction =
  | { type: 'start' }
  | { type: 'answer'; id: QuestionId; value: AnswerValue }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'restart' }

export const initialState: SurveyState = { phase: 'intro', answers: {}, index: 0 }

/** Remove answers for questions that are no longer visible (e.g., after a branch change). */
function pruneAnswers(answers: Answers): Answers {
  const visibleIds = new Set(visibleQuestions(answers).map((q) => q.id))
  const next: Answers = {}
  for (const [id, value] of Object.entries(answers)) {
    if (visibleIds.has(id as QuestionId)) next[id as QuestionId] = value
  }
  return next
}

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false
  return Array.isArray(value) ? value.length > 0 : value.length > 0
}

export function currentQuestion(state: SurveyState): Question | null {
  if (state.phase !== 'survey') return null
  const visible = visibleQuestions(state.answers)
  return visible[state.index] ?? null
}

export function canAdvance(state: SurveyState): boolean {
  const q = currentQuestion(state)
  if (!q) return false
  return isAnswered(state.answers[q.id])
}

export function progress(state: SurveyState): { current: number; total: number } {
  const total = visibleQuestions(state.answers).length
  return { current: Math.min(state.index + 1, total), total }
}

export function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'start':
      return { phase: 'survey', answers: {}, index: 0 }

    case 'answer': {
      const answers = pruneAnswers({ ...state.answers, [action.id]: action.value })
      // Keep index pointing at the same question the user just answered.
      const visible = visibleQuestions(answers)
      const newIndex = Math.min(state.index, Math.max(visible.length - 1, 0))
      return { ...state, answers, index: newIndex }
    }

    case 'next': {
      if (!canAdvance(state)) return state
      const visible = visibleQuestions(state.answers)
      if (state.index >= visible.length - 1) return { ...state, phase: 'results' }
      return { ...state, index: state.index + 1 }
    }

    case 'back': {
      if (state.index === 0) return { ...state, phase: 'survey' }
      return { ...state, index: state.index - 1 }
    }

    case 'restart':
      return initialState

    default:
      return state
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/survey-reducer.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add lib/survey-reducer.ts lib/survey-reducer.test.ts
git commit -m "feat: add pure survey reducer with branching navigation"
```

---

## Task 7: Presentational components — BrandHeader, ProgressBar, QuestionCard, IntroScreen

**Files:**
- Create: `components/BrandHeader.tsx`, `components/ProgressBar.tsx`, `components/QuestionCard.tsx`, `components/IntroScreen.tsx`

**Interfaces:**
- Consumes: `Question`, `AnswerValue` from `@/data/questions`.
- Produces:
  - `BrandHeader()` — no props.
  - `ProgressBar({ current, total }: { current: number; total: number })`
  - `QuestionCard({ question, value, onChange }: { question: Question; value: AnswerValue | undefined; onChange: (value: AnswerValue) => void })`
  - `IntroScreen({ onStart }: { onStart: () => void })`

- [ ] **Step 1: Create `components/BrandHeader.tsx`**

```tsx
// Chapman-INSPIRED branding only — no official logo, window icon, or seal.
// A text wordmark plus a small geometric (triangle) accent evokes the brand.
export default function BrandHeader() {
  return (
    <header className="border-b-4 border-chapman-red bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
        <span aria-hidden className="inline-block h-0 w-0 border-x-8 border-b-[14px] border-x-transparent border-b-chapman-red" />
        <div>
          <p className="font-heading text-lg font-bold uppercase tracking-wide text-chapman-red">Chapman University</p>
          <p className="font-heading text-xs uppercase tracking-widest text-pillar">Career &amp; Professional Development</p>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create `components/ProgressBar.tsx`**

```tsx
export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="mb-6">
      <div className="mb-1 flex justify-between font-heading text-xs uppercase tracking-wide text-pillar">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-sand/50"
        role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}
        aria-label="Survey progress"
      >
        <div className="h-full rounded-full bg-chapman-red transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/QuestionCard.tsx`**

```tsx
'use client'
import type { Question, AnswerValue } from '@/data/questions'

interface Props {
  question: Question
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
}

export default function QuestionCard({ question, value, onChange }: Props) {
  const selected = Array.isArray(value) ? value : value != null ? [value] : []

  const toggleMulti = (optValue: string) => {
    const set = new Set(selected)
    if (set.has(optValue)) set.delete(optValue)
    else set.add(optValue)
    onChange([...set])
  }

  return (
    <fieldset>
      <legend className="font-heading text-2xl font-bold text-panther-black">{question.prompt}</legend>
      {question.helpText && <p className="mt-1 text-sm text-pillar">{question.helpText}</p>}

      <div className="mt-5 space-y-3">
        {question.options.map((opt) => {
          const isSelected = selected.includes(opt.value)
          const inputType = question.type === 'multi' ? 'checkbox' : 'radio'
          return (
            <label
              key={opt.value}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors',
                'min-h-11 focus-within:ring-2 focus-within:ring-chapman-red',
                isSelected ? 'border-chapman-red bg-chapman-red/5' : 'border-pillar/30 hover:border-chapman-red/60',
              ].join(' ')}
            >
              <input
                className="h-5 w-5 accent-chapman-red"
                type={inputType}
                name={question.id}
                value={opt.value}
                checked={isSelected}
                onChange={() => (question.type === 'multi' ? toggleMulti(opt.value) : onChange(opt.value))}
              />
              <span className="text-base">{opt.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
```

- [ ] **Step 4: Create `components/IntroScreen.tsx`**

```tsx
export default function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="text-center">
      <p className="font-heading text-sm font-bold uppercase tracking-widest text-chapman-red">
        Driven by Curiosity. Inspired by Chapman.
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold text-panther-black sm:text-5xl">
        Find your next career step
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-pillar">
        Answer a few quick questions and we&apos;ll point you to the Chapman career
        services that fit you best — tools to use and the right office to talk to.
      </p>
      <button
        onClick={onStart}
        className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-8 py-3 font-heading text-lg font-bold text-white transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-chapman-red/40"
      >
        Start the survey
      </button>
      <p className="mt-4 text-xs text-pillar">Takes about 2 minutes · No sign-in required</p>
    </section>
  )
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/BrandHeader.tsx components/ProgressBar.tsx components/QuestionCard.tsx components/IntroScreen.tsx
git commit -m "feat: add branded intro, progress, and question UI components"
```

---

## Task 8: Results components — ResultCard, ResultsView

**Files:**
- Create: `components/ResultCard.tsx`, `components/ResultsView.tsx`

**Interfaces:**
- Consumes: `Recommendation`, `Results` from `@/lib/recommendation-engine`.
- Produces:
  - `ResultCard({ rec, featured }: { rec: Recommendation; featured?: boolean })`
  - `ResultsView({ results, onRestart }: { results: Results; onRestart: () => void })`

- [ ] **Step 1: Create `components/ResultCard.tsx`**

```tsx
import type { Recommendation } from '@/lib/recommendation-engine'

export default function ResultCard({ rec, featured = false }: { rec: Recommendation; featured?: boolean }) {
  const { resource, reasons } = rec
  const a = resource.action
  return (
    <article
      className={[
        'rounded-xl border bg-white p-5 shadow-sm',
        featured ? 'border-l-8 border-chapman-red' : 'border-pillar/25',
      ].join(' ')}
    >
      <h3 className="font-heading text-xl font-bold text-panther-black">{resource.name}</h3>
      <p className="mt-1 text-sm text-pillar">{resource.whatItIs}</p>

      {reasons.length > 0 && (
        <div className="mt-3">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-chapman-red">Why this fits you</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <dl className="mt-3 space-y-1 text-sm">
        {a.email && <div><dt className="sr-only">Email</dt><dd><a className="text-chapman-red underline" href={`mailto:${a.email}`}>{a.email}</a></dd></div>}
        {a.phone && <div><dt className="sr-only">Phone</dt><dd>{a.phone}</dd></div>}
        {a.location && <div><dt className="sr-only">Location</dt><dd>{a.location}</dd></div>}
        {a.hours && <div><dt className="sr-only">Hours</dt><dd>{a.hours}</dd></div>}
        {a.scheduling && <div><dt className="sr-only">Scheduling</dt><dd>Scheduling: {a.scheduling}</dd></div>}
      </dl>

      {a.href && (
        <a
          href={a.href} target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-5 py-2 font-heading text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-chapman-red/40"
        >
          {a.label ?? 'Open'}
        </a>
      )}
    </article>
  )
}
```

- [ ] **Step 2: Create `components/ResultsView.tsx`**

```tsx
import type { Results } from '@/lib/recommendation-engine'
import ResultCard from '@/components/ResultCard'

export default function ResultsView({ results, onRestart }: { results: Results; onRestart: () => void }) {
  return (
    <section>
      <h1 className="font-heading text-3xl font-bold text-panther-black">Your recommendations</h1>
      <p className="mt-2 text-pillar">Based on your answers, here&apos;s where to start.</p>

      {results.seniorPassportNudge && (
        <div className="mt-4 rounded-lg border-l-4 border-grove bg-grove/5 p-4 text-sm">
          <strong className="font-heading">Graduating soon?</strong> Ask the Career Center about the{' '}
          <span className="font-semibold">Career Passport Program</span> for seniors.
        </div>
      )}

      <h2 className="mt-8 font-heading text-sm font-bold uppercase tracking-widest text-chapman-red">Start here</h2>
      <div className="mt-3 space-y-4">
        {results.primary.map((rec) => <ResultCard key={rec.resource.id} rec={rec} featured />)}
      </div>

      {results.alsoExplore.length > 0 && (
        <>
          <h2 className="mt-8 font-heading text-sm font-bold uppercase tracking-widest text-pillar">Also worth exploring</h2>
          <div className="mt-3 space-y-4">
            {results.alsoExplore.map((rec) => <ResultCard key={rec.resource.id} rec={rec} />)}
          </div>
        </>
      )}

      <button
        onClick={onRestart}
        className="mt-8 inline-flex min-h-11 items-center rounded-lg border-2 border-chapman-red px-6 py-2 font-heading font-bold text-chapman-red focus:outline-none focus-visible:ring-4 focus-visible:ring-chapman-red/40"
      >
        Start over
      </button>
    </section>
  )
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ResultCard.tsx components/ResultsView.tsx
git commit -m "feat: add tiered results view with explained recommendation cards"
```

---

## Task 9: Toast and inert ContactForm

**Files:**
- Create: `components/Toast.tsx`, `components/ContactForm.tsx`
- Test: `components/ContactForm.test.tsx`

**Interfaces:**
- Consumes: nothing external.
- Produces:
  - `Toast({ message, onDismiss }: { message: string; onDismiss: () => void })`
  - `ContactForm()` — self-contained; manages its own field state + validation + toast.
  - Exported helper `validateContact(values: { name: string; email: string }): { valid: boolean; errors: Record<string, string> }` for unit testing.

- [ ] **Step 1: Write the failing test `components/ContactForm.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm, { validateContact } from '@/components/ContactForm'

describe('validateContact', () => {
  it('rejects empty name and bad email', () => {
    const { valid, errors } = validateContact({ name: '', email: 'nope' })
    expect(valid).toBe(false)
    expect(errors.name).toBeTruthy()
    expect(errors.email).toBeTruthy()
  })
  it('accepts a valid name and email', () => {
    expect(validateContact({ name: 'Pat Panther', email: 'pat@chapman.edu' }).valid).toBe(true)
  })
})

describe('ContactForm (inert prototype)', () => {
  it('does not submit until consent is checked and fields are valid', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    const submit = screen.getByRole('button', { name: /notify me/i })
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText(/name/i), 'Pat Panther')
    await user.type(screen.getByLabelText(/email/i), 'pat@chapman.edu')
    await user.click(screen.getByLabelText(/agree to be contacted/i))
    expect(submit).toBeEnabled()
  })

  it('shows the prototype toast on submit and makes no network call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/name/i), 'Pat Panther')
    await user.type(screen.getByLabelText(/email/i), 'pat@chapman.edu')
    await user.click(screen.getByLabelText(/agree to be contacted/i))
    await user.click(screen.getByRole('button', { name: /notify me/i }))
    expect(await screen.findByRole('status')).toHaveTextContent(/prototype/i)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ContactForm.test.tsx`
Expected: FAIL ("Cannot find module '@/components/ContactForm'").

- [ ] **Step 3: Create `components/Toast.tsx`**

```tsx
'use client'
import { useEffect } from 'react'

export default function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      role="status" aria-live="polite"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[min(92%,28rem)] rounded-lg border-l-4 border-grove bg-panther-black px-4 py-3 text-sm text-white shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <button onClick={onDismiss} aria-label="Dismiss notification" className="font-heading text-white/80 hover:text-white">✕</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/ContactForm.tsx`** (inert; documents future hookup)

```tsx
'use client'
import { useState } from 'react'
import Toast from '@/components/Toast'

// Simple, conservative email shape check (deny-by-default: anything odd is invalid).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact(values: { name: string; email: string }): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  if (values.name.trim().length === 0) errors.name = 'Please enter your name.'
  if (values.name.trim().length > 120) errors.name = 'Name is too long.'
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email.'
  if (values.email.trim().length > 200) errors.email = 'Email is too long.'
  return { valid: Object.keys(errors).length === 0, errors }
}

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const { valid } = validateContact({ name, email })
  const canSubmit = valid && consent

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    // -------------------------------------------------------------------------
    // PROTOTYPE: contact capture is intentionally NOT wired up.
    //
    // Future production hookup (do NOT enable without the items below):
    //   1. POST a sanitized payload { name, email, note, recommendations }
    //      to a small serverless function or email API (e.g. a Cloudflare
    //      Worker / Vercel function) that emails the lead to the appropriate
    //      Career Center inbox. Keep the front-end static; the function is the
    //      only thing that touches PII.
    //   2. Before going live this handles STUDENT PII — required first:
    //        - explicit, logged consent (this checkbox is the UX seed),
    //        - FERPA review with the Career Center,
    //        - server-side validation + rate limiting on the endpoint,
    //        - transport over HTTPS only; never log raw PII.
    // Until then, we show a toast and reset. No network request is made.
    // -------------------------------------------------------------------------
    setToast("Thanks! This is a prototype — submissions aren't connected yet.")
    setName(''); setEmail(''); setNote(''); setConsent(false)
  }

  return (
    <section className="mt-10 rounded-xl border border-pillar/25 bg-sand/20 p-5">
      <h2 className="font-heading text-xl font-bold text-panther-black">Want us to follow up?</h2>
      <p className="mt-1 text-sm text-pillar">Optional — leave your info and the Career Center can reach out.</p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="cf-name" className="block font-heading text-sm font-bold">Name</label>
          <input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
            className="mt-1 w-full rounded-lg border-2 border-pillar/30 px-3 py-2 focus:border-chapman-red focus:outline-none" />
        </div>
        <div>
          <label htmlFor="cf-email" className="block font-heading text-sm font-bold">Chapman email</label>
          <input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200}
            className="mt-1 w-full rounded-lg border-2 border-pillar/30 px-3 py-2 focus:border-chapman-red focus:outline-none" />
        </div>
        <div>
          <label htmlFor="cf-note" className="block font-heading text-sm font-bold">Anything else? <span className="font-normal text-pillar">(optional)</span></label>
          <textarea id="cf-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3}
            className="mt-1 w-full rounded-lg border-2 border-pillar/30 px-3 py-2 focus:border-chapman-red focus:outline-none" />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-chapman-red" />
          <span>I agree to be contacted by Career &amp; Professional Development.</span>
        </label>
        <button type="submit" disabled={!canSubmit}
          className="inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-6 py-2 font-heading font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-chapman-red/40">
          Notify me
        </button>
      </form>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </section>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run components/ContactForm.test.tsx`
Expected: PASS (all tests).

- [ ] **Step 6: Commit**

```bash
git add components/Toast.tsx components/ContactForm.tsx components/ContactForm.test.tsx
git commit -m "feat: add inert contact form with consent, validation, and toast"
```

---

## Task 10: Wire it all together in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx` (replace placeholder)

**Interfaces:**
- Consumes: `surveyReducer`, `initialState`, `currentQuestion`, `canAdvance`, `progress` from `@/lib/survey-reducer`; `recommend` from `@/lib/recommendation-engine`; all components.
- Produces: the running app (no exports consumed elsewhere).

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
'use client'
import { useReducer, useMemo } from 'react'
import { surveyReducer, initialState, currentQuestion, canAdvance, progress } from '@/lib/survey-reducer'
import { recommend } from '@/lib/recommendation-engine'
import BrandHeader from '@/components/BrandHeader'
import IntroScreen from '@/components/IntroScreen'
import ProgressBar from '@/components/ProgressBar'
import QuestionCard from '@/components/QuestionCard'
import ResultsView from '@/components/ResultsView'
import ContactForm from '@/components/ContactForm'

export default function Home() {
  const [state, dispatch] = useReducer(surveyReducer, initialState)
  const question = currentQuestion(state)
  const { current, total } = progress(state)
  const results = useMemo(
    () => (state.phase === 'results' ? recommend(state.answers) : null),
    [state.phase, state.answers],
  )

  return (
    <div className="min-h-dvh bg-white">
      <BrandHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {state.phase === 'intro' && <IntroScreen onStart={() => dispatch({ type: 'start' })} />}

        {state.phase === 'survey' && question && (
          <div>
            <ProgressBar current={current} total={total} />
            <QuestionCard
              question={question}
              value={state.answers[question.id]}
              onChange={(value) => dispatch({ type: 'answer', id: question.id, value })}
            />
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => dispatch({ type: 'back' })}
                className="min-h-11 font-heading font-bold text-pillar hover:text-panther-black focus:outline-none focus-visible:underline"
              >
                ← Back
              </button>
              <button
                onClick={() => dispatch({ type: 'next' })}
                disabled={!canAdvance(state)}
                className="inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-8 py-2 font-heading font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-chapman-red/40"
              >
                {current >= total ? 'See results' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {state.phase === 'results' && results && (
          <>
            <ResultsView results={results} onRestart={() => dispatch({ type: 'restart' })} />
            <ContactForm />
          </>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Type-check and run the full test suite**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all test files pass.

- [ ] **Step 3: Verify the production static build**

Run: `npm run build`
Expected: build succeeds; `out/index.html` exists.

- [ ] **Step 4: Manual smoke check (dev server)**

Run: `npm run dev`, open the local URL. Confirm: intro → start → answer year/college/goal → branch questions appear → results show a featured tool + the correct office + "also worth exploring" → contact form submit shows the toast. Stop the server when done.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire survey flow, results, and contact form into the app"
```

---

## Task 11: Accessibility, responsive polish, and final verification

**Files:**
- Modify: as needed (`app/page.tsx`, components, `app/globals.css`)

**Interfaces:** none new.

- [ ] **Step 1: Add a skip link and main landmark id in `app/page.tsx`**

Add immediately inside the returned root `<div>`, before `<BrandHeader />`:

```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-chapman-red focus:px-3 focus:py-2 focus:text-white">
  Skip to content
</a>
```

And change `<main className="mx-auto max-w-3xl px-4 py-10">` to include `id="main"`:

```tsx
<main id="main" className="mx-auto max-w-3xl px-4 py-10">
```

- [ ] **Step 2: Verify keyboard-only operation manually**

Run: `npm run dev`. Using only Tab/Shift+Tab/Space/Enter/arrow keys: complete the whole flow. Confirm visible focus rings on every interactive element, radio/checkbox groups are reachable, the Back/Next buttons work, and the toast is announced. Stop the server.

- [ ] **Step 3: Verify responsive layout manually**

In the browser dev tools device toolbar, check ~375px (mobile) and ~1280px (desktop): no horizontal scroll, tap targets comfortable, cards readable, progress bar legible. Adjust Tailwind classes only if something breaks.

- [ ] **Step 4: Confirm no Sand-on-white text and AA contrast**

Grep for accidental low-contrast text: confirm `text-sand` is not used anywhere.

Run: `grep -rn "text-sand" app components` 
Expected: no matches (Sand is used only as a background tint like `bg-sand/20`).

- [ ] **Step 5: Run the full suite and final static build**

Run: `npm test && npm run build`
Expected: all tests pass; `out/` regenerates with `index.html`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add skip link, a11y and responsive polish, final verification"
```

---

## Self-Review (completed against the spec)

- **Spec §1 scope (adaptive survey, tiered results, inert opt-in form, static, Chapman-inspired):** Tasks 3 (branching), 5 (tiering), 9 (inert form), 1 (static export), 2/7/8 + Global Constraints (branding). ✓
- **Spec §2 success criteria:** <2 min flow (short branched survey, Task 3); branching (Tasks 3/6); deterministic + explainable (Tasks 4/5, tests assert determinism & reasons); always-an-office (Task 5 test); verified links (Task 2 data from reference); a11y/responsive (Task 11); static build (Tasks 1/10/11). ✓
- **Spec §3 architecture/layering:** data/ (Tasks 2–4), lib/ pure + tested (Tasks 5–6), components/ (Tasks 7–9), app/ orchestration (Task 10). ✓
- **Spec §4 questions & branching:** all core + 7 goal branches encoded in Task 3 matching the spec list. ✓
- **Spec §5 engine (rule-based office, scored tools, tiering, tie-break, reasons):** Task 5 implements and tests each. ✓
- **Spec §6 contact form (after results, opt-in, consent, client validation, toast, comments):** Task 9. ✓
- **Spec §7 branding tokens/type/style/no-logo:** Global Constraints + Tasks 1 (tokens/fonts) and 7 (text wordmark + triangle accent). ✓
- **Spec §8 accessibility:** Task 11 + ARIA in components (Tasks 7–9). ✓
- **Spec §9 testing (TDD on engine + reducer):** Tasks 5–6 are test-first; Task 9 tests the form. ✓
- **Placeholder scan:** no TBD/TODO/"add validation"-style steps; all code is concrete. ✓
- **Type consistency:** `Answers`, `AnswerValue`, `QuestionId`, `ResourceId`, `ScoreTargetId`, `Recommendation`, `Results`, `SurveyState`, `surveyReducer`, `recommend`, `validateContact` names are consistent across tasks. ✓
