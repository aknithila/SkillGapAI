# SkillGap AI

**An AI career-readiness platform for college students, fresh graduates and career switchers.**

Tell SkillGap AI who you are and which job you want. It shows how job-ready you are, which skills you're missing, and a week-by-week plan to close the gaps. You prove each skill with a hands-on project that AI grades, then practise with a mock interviewer.

Built in ~5 hours for a hackathon by a team of 4 first-year students.

## How it works

**Assess → Skill Gaps → Roadmap → Projects → AI Evaluation → Skill Profile**

1. **Assess:** enter your background, paste your resume, or rate your skills from 1 to 5.
2. **Skill Gaps:** see your readiness %, your skill gaps ranked by priority, a radar chart of you vs. the role, and skills from your previous job that transfer to the new one.
3. **Roadmap:** a 4–6 week plan, with free learning resources and one mini project each week.
4. **Projects + AI Evaluation:** submit your work (a GitHub link plus an explanation) and get a score, a rubric, strengths, improvements and a verdict ("Demonstrated" or "Needs work").
5. **Skill Profile:** a shareable card showing your project-proven skills vs. self-reported ones.
6. **🎤 Gary, the mock interviewer:** 5 questions (3 technical on your gaps, 2 behavioral), feedback after each answer, and a final scorecard.

### ⭐ Tech Dictionary

Tech jargon scares beginners. Every underlined technical word in the app (SQL, API, Docker, dataset…) is clickable. It explains itself simply, with an **everyday Indian-life analogy**, in **English, Tamil or Hindi**, and an "Explain simpler" button makes it even easier. The floating **📖 Ask a term** button lets you look up any word.

> *API: "Like a waiter in a restaurant. You give the order, the waiter brings it from the kitchen. You never enter the kitchen."*

## Roles supported

- Data Analyst
- Frontend Developer
- Cloud / DevOps Engineer

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**, **Recharts**, **lucide-react**
- **Google Gemini** (`gemini-2.5-flash`) via `@google/genai`, called only from server-side API routes
- **zod** to check AI responses
- No database and no login. Your data is saved in the browser (localStorage).

## Getting started

You need [Node.js](https://nodejs.org) 18 or newer, and a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/<your-username>/skillgap-ai.git
cd skillgap-ai
npm install
cp .env.local.example .env.local   # then paste your key after GEMINI_API_KEY=
npm run dev
```

Open http://localhost:3000. For a quick demo, go to **Start assessment** and click **Load demo profile** (Priya, a B.Com graduate who wants to become a Data Analyst).

> **The demo never breaks:** if the Gemini key is missing, the internet is down, or the AI replies with bad data, each API route returns a ready-made example answer from `data/fallbacks/`. These responses have the header `X-Fallback: true`.

## Project structure

```
app/
  page.tsx               Landing page
  assess/                Assessment form
  gaps/                  Readiness, gaps, radar chart
  roadmap/               Week-by-week timeline
  project/[id]/          Project brief, submission, AI evaluation
  profile/               Shareable skill profile
  interview/             Gary mock-interview chat
  api/
    analyze/             Profile → skill gaps
    roadmap/             Gaps → learning plan
    evaluate/            Project submission → score + feedback
    explain/             Term → simple explanation (EN / Tamil / Hindi)
    gary/                Mock interview questions, feedback and report
components/
  Term.tsx               Clickable dictionary word
  TermText.tsx           Auto-detects tech words in AI text
  AskTerm.tsx            Floating "Ask a term" search
  ExplainCard.tsx        Explanation popup content
  RadarSkills.tsx        Radar chart
lib/
  types.ts               Shared TypeScript types
  store.tsx              App state (saved to localStorage)
  gemini.ts              Gemini helper (JSON output, 15s timeout)
  schemas.ts             zod checks for AI responses
data/
  roles.json             Roles and their required skills
  glossary.json          42 beginner tech terms
  fallbacks/             Backup AI responses
```

## Testing the API

```bash
curl -X POST localhost:3000/api/explain -H "Content-Type: application/json" \
  -d '{"term":"API","language":"ta","level":"simple"}'
```

Add `-i` to see the headers. If you see `X-Fallback: true`, Gemini failed, and the terminal running `npm run dev` shows the reason.

## Team

Built by a team of 4 first-year students. <!-- add your names here -->
