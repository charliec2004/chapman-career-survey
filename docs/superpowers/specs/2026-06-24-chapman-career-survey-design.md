# Chapman Career Survey — Design Spec

**Date:** 2026-06-24
**Status:** Approved design (pending spec review)
**Owner:** Chapman Career & Professional Development
**Reference data:** [`docs/research/chapman-career-services-reference.md`](../../research/chapman-career-services-reference.md)

---

## 1. Purpose & scope

A Chapman-branded, mobile-first web app: an **adaptive survey** that asks a student a short
series of targeted questions and ends with **tiered, personalized recommendations** for the
Chapman career services that fit their situation — each with a plain-language reason and a
real action link or contact.

**This iteration is a front-end prototype.** It is fully client-side, stores no data, and the
optional contact-capture form is **inert** (shows a styled "not hooked up yet" toast on submit,
with code comments marking the intended future email-to-office hookup).

### In scope
- Adaptive, branching survey (~4–6 questions per student depending on path).
- Deterministic recommendation engine mapping answers → tiered results.
- Tiered results UI: "Primary" + "Also worth exploring", each card with a "Why this fits you".
- Optional, opt-in contact form after results (inert; consent checkbox; client-side validation).
- Chapman-inspired visual design (palette, type, geometric style) — **no official logo/seal**.
- Static export deployable to any static host.

### Out of scope (this iteration)
- Any backend, database, or persistence; sending/storing PII.
- Authentication / Chapman SSO.
- Analytics.
- Live integration of the contact form (documented as a future hookup only).

### Non-goals / YAGNI
- No CMS or admin UI; questions and resources are typed config in the repo.
- No multi-language support.
- No A/B testing framework.

---

## 2. Success criteria
1. A student can complete the survey on a phone in well under 2 minutes.
2. Branching works: a student only sees questions relevant to their goal.
3. Recommendations are deterministic and explainable — the same answers always yield the same
   results, and every recommendation shows a reason traceable to the answers.
4. Results always include the correct **office** to contact (college-specific when known, else
   central) plus targeted **tools**.
5. All links/contacts match the verified reference doc; nothing fabricated.
6. WCAG AA contrast; full keyboard navigation; works on mobile and desktop.
7. `next build` produces a static export that runs from `file://`-style static hosting.

---

## 3. Architecture overview

**Stack:** Next.js (App Router) + TypeScript, static export (`output: 'export'`),
Tailwind CSS with Chapman design tokens. Fully client-side; no network calls.

**Layered separation (each unit independently understandable & testable):**

```
data/
  questions.ts      # Question tree config (typed). Pure data, no logic.
  resources.ts      # Recommendation catalog (typed), derived from the reference doc.
  scoring.ts        # Scoring rules: answer -> resource weights + reason strings. Pure data.
lib/
  recommendation-engine.ts  # Pure functions: answers -> scored, tiered recommendations. Unit-tested.
  survey-reducer.ts         # Navigation/branching state machine (pure reducer). Unit-tested.
components/
  SurveyShell, ProgressBar, QuestionCard (renders question types),
  ResultsView, ResultCard, ContactForm, Toast, BrandLayout
app/
  page.tsx          # Orchestration: wires reducer + components.
  layout.tsx        # Brand fonts, global styles, metadata.
```

**Data flow:**
1. `app/page.tsx` holds survey state via `useReducer(surveyReducer)`.
2. `survey-reducer` computes the next visible question from `questions.ts` based on answers
   (branching). It never references UI.
3. On completion, `recommendation-engine` consumes the answer set + `scoring.ts` + `resources.ts`
   and returns `{ primary: Rec[], alsoExplore: Rec[] }`, each `Rec` carrying its resource data and
   a composed `reasons: string[]`.
4. `ResultsView` renders the tiers; `ContactForm` renders below (inert).

**Why this shape:** questions, catalog, and scoring are *data* the Career Center can edit without
touching logic; the engine and reducer are *pure* and covered by tests; UI is replaceable without
risking the routing logic. Trust boundary: all input is in-app config + user clicks — but the
contact form still validates shape/length/format client-side (defense-in-depth, and ready for the
day it posts to a real endpoint).

---

## 4. The survey flow (questions & branching)

Intro screen → core questions → goal-specific follow-ups → results.

### Core questions (always asked)
- **Q1 Year:** First/second year · Junior · Senior / graduating · Grad student · Alumni
- **Q2 College / major:** Argyros (Business) · Dodge (Film & Media) · Fowler (Engineering) ·
  Schmid (Science & Tech) · Crean (Health & Behavioral) · Wilkinson (Arts/Humanities/Soc Sci) ·
  Attallah (Education) · College of Performing Arts · School of Communication · Law · Pharmacy ·
  Undeclared / Other
- **Q3 Primary goal (main branch):**
  1. Explore career/major direction
  2. Build application materials
  3. Prepare for interviews
  4. Search for jobs/internships
  5. Network & find mentors
  6. Plan for grad school
  7. Work/intern internationally

### Goal-specific follow-ups (only the chosen branch is shown)
- **Explore** → (a) "Taken a career/personality assessment yet?" yes/no;
  (b) "Self-guided online tools or talk with an advisor?"
- **Build materials** → (a) which materials (multi-select: resume / cover letter / LinkedIn);
  (b) "Instant AI feedback or human review?"
- **Interviews** → (a) "General practice or a specific upcoming interview?";
  (b) "Practice on your own anytime, or with a person?"
- **Job/internship search** → (a) "What do you need most: find listings / research employers /
  make contacts?"; (b) "Local/US or international?"
- **Network** → (a) "Connect with alumni/mentors, or build your LinkedIn presence?"
- **Grad school** → (a) "Where are you in the process: deciding / applying / preparing materials?"
- **International** → (a) "Which region (optional)"; folds into GoinGlobal + advising.

Seniors/graduating get a **Career Passport** nudge in results regardless of branch.
Navigation: progress indicator, Back, and change-answer always available.

---

## 5. Recommendation engine

### Model (deterministic, explicit)
- `scoring.ts` defines, per answer option, a list of `{ resourceId, weight, reason }` contributions.
- The engine sums weights per resource across all given answers.
- **Office selection is rule-based, not scored:** if Q2 maps to a college office, that office is
  the primary office; otherwise the central Career House. Law → Symplicity, Pharmacy → its office,
  per the reference doc.
- Resources scoring above a threshold are candidates; sorted by descending weight.
- **Tiering:**
  - **Primary (1–2):** the top tool(s) + the selected office.
  - **Also worth exploring (2–4):** next-highest candidates.
- Deterministic tie-breaking by a fixed resource priority order (stable, reproducible).

### Reason composition
Each contributing answer carries a `reason` fragment (e.g., "You wanted instant feedback on your
resume"). A resource's `reasons[]` is the de-duplicated set of fragments from the answers that
selected it. No free-text generation; reasons are fixed strings keyed to answers.

### Result card contents
`name` · `whatItIs` (one line) · `reasons[]` ("Why this fits you") · `action`
(link and/or contact: email/phone/location/scheduling) — all sourced from `resources.ts`.

---

## 6. Contact form (inert prototype)
- Appears **after** results, opt-in, clearly optional.
- Fields: name, Chapman email, optional note; a **consent checkbox** ("I agree to be contacted by
  Career & Professional Development").
- **Client-side validation:** required fields, email format, length caps, trim. Submit is disabled
  until valid + consent checked.
- **On submit:** no network request. Show a tastefully styled **toast**: e.g., "Thanks! This is a
  prototype — submissions aren't connected yet." Form resets/marks submitted.
- **Code comments** document the intended production hookup: POST sanitized payload to a small
  serverless function / email API that emails the lead (student info + their recommendations) to
  the appropriate Career Center inbox; note FERPA/consent obligations before going live.

---

## 7. Branding implementation
- **Palette tokens** (from reference): Chapman Red `#A50034` (primary accent), Panther Black
  `#231F20` (body), white; Grove `#00966C` / Pacific `#009CA6` as sparing accents; Pillar
  `#6E6259` warm neutral; Sand `#DDCBA4` (never as text on white). Separate neutral grey ramp for UI.
- **Type:** headings `"Futura PT", "Jost", "Century Gothic", Arial, sans-serif`; body
  `"Minion Pro", "Source Serif 4", Georgia, serif` (Jost + Source Serif 4 self-hosted/Google).
- **Style:** clean, lots of white space, bold red accents, thin grey dividers; emulate the
  **window/triangle geometric** motif for framing/section accents. Tagline available:
  "Driven by Curiosity. Inspired by Chapman."
- **Do NOT** reproduce the official logo, window icon, or seal. Use a tasteful text wordmark
  ("Career & Professional Development") and geometric accents instead.

---

## 8. Accessibility & quality
- WCAG AA contrast (mind the Sand caveat); visible focus states; full keyboard operation.
- Semantic HTML; ARIA for progress, radio/checkbox groups, toast (`role="status"`).
- Respect `prefers-reduced-motion`.
- Responsive mobile-first; tap targets ≥ 44px.

## 9. Testing
- **TDD** for `recommendation-engine` and `survey-reducer` (pure functions): branching coverage,
  tiering, office selection, tie-breaking, reason composition — including representative
  end-to-end answer sets per goal.
- Manual responsive check on mobile + desktop; keyboard-only pass.

## 10. Risks / open items
- Reference data has a few **[UNVERIFIED]** items (Pharmacy "CUSPark", Law phone, some "free"
  wording). The app links to durable canonical pages; flagged items to confirm before production
  (see reference doc §7).
- Licensed fonts (Futura/Minion) not embeddable → free substitutes used; acceptable for an
  unofficial prototype.
- Contact form is intentionally non-functional this iteration.
