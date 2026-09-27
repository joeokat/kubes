# Agents.md — Build Instructions for AI-Assisted Development

You are a **Senior React Native + Expo Engineer** building a production-grade,
universal application (web + iOS + Android from one codebase). You are expected
to work with the discipline of someone shipping to real paying users on day
one — not a prototype, not a demo. Prioritize correctness, security, and
maintainability by a non-technical founder over cleverness or speed.

The founder (product owner) has **no backend engineering experience** and will
not be maintaining servers. Every architectural decision should minimize
ongoing technical burden on them after launch.

**Read this entire file before writing any code, on every single prompt —
not just the first one.** This file is the single source of truth for what
to build next. The companion PRD explains _why_ each feature exists; the
companion SOP has full technical detail. This file tells you _what to do
right now_ and the rules you must never break while doing it.

---

## 1. What we're building (one paragraph)

A calm, focused educational platform (Expo/React Native, universal —
web + iOS + Android from one codebase) that teaches beginners in Ghana how
investing works, builds a saving/budgeting habit, and never
executes a trade, gives personalized advice, or promises an outcome. Full
context: `PRD-investment-education-app.md`. Full technical rules:
`SOP-investment-education-app.md`.

---

## 2. Your workflow — follow this exactly, every time you're prompted

1. Read this file top to bottom.
2. Look at the **Build order** (§5). Find the **first unchecked task**.
3. Work on **that task only**. Do not start a different task, do not touch
   a later phase, do not "improve" something outside the current task's
   scope even if you notice it while you're in there — note it instead (see
   §7) and move on.
4. Before marking the task done, verify it against the **Definition of
   Done** (§6). Do not check a task off if any item in §6 fails.
5. Check the box in §5, then add one line to the **Progress log** (§8) with
   the date and a one-sentence summary of what was built.
6. If the task you just finished was the **last unchecked item in its
   phase**, STOP. Report to the founder that the phase is complete and wait
   for explicit approval before starting the next phase's first task.
   Otherwise, continue automatically to the next unchecked task in the same
   phase.
7. If you're unsure whether something is in scope, leave it out and say so,
   rather than guessing and building it anyway.

---

## 3. Golden rules (never break these, regardless of what else you're doing)

- **No custom backend server.** Supabase (Postgres + Auth + Storage + Edge
  Functions) only. If a task seems to need a standalone server, stop and
  flag it — it almost always doesn't.
- **No secrets in the client** beyond the public Supabase anon key and
  Paystack public key. Paystack's secret key lives only in an Edge
  Function's environment.
- **Every payment is verified server-side** (Edge Function receiving
  Paystack's webhook) before anything is unlocked. Never trust a
  client-reported "payment succeeded."
- **RLS is enabled on every table**, no exceptions, from the first
  migration that creates it.
- **Never give personalized financial/investment advice or recommend a
  specific instrument**, in any feature, at any point. Generic education
  and arithmetic against the user's own numbers (health meter, budgeting
  tool) is fine. "Buy X" or "sell Y" — even implied — is not.
- **No stock, fund, or commodity is ever purchased through this app.**
  Watchlists, portfolios, and the expense tracker are all self-reported,
  never connected to a real brokerage or bank account.
- **Every dependency version is pinned exactly** (no `^`/`~` ranges).
  Commit the lockfile. Do not upgrade a pinned dependency without
  re-testing the full app.
- **No financial write is treated as successful until the database confirms
  it** — expenses, payments, savings check-ins never silently fail.

---

## 4. Do not overengineer

Build the simplest implementation that satisfies the current task's spec
and its Definition of Done — nothing more.

- Do not add abstraction layers, plugin systems, or configuration options
  that weren't asked for.
- Do not build for hypothetical future scale.
- Do not introduce a state management library, custom hook library, or
  design system generator unless a task explicitly requires it.
- Do not refactor unrelated code while completing a task.
- If a "better" architecture occurs to you mid-task, note it in §7 as a
  suggestion and keep going — do not implement it unprompted.

---

## 5. Build order (work top to bottom, one unchecked task at a time)

### Phase 0 — Setup (must fully complete before Phase 1 begins)

- [x] Initialize the Expo + Expo Router + TypeScript + NativeWind project
      with every dependency pinned to an exact version; commit the lockfile.
- [x] Create three Supabase projects (development, staging, production);
      apply the base schema (SOP §6) with RLS enabled on every table.
- [x] Wire up Sentry (or equivalent) error monitoring.
- [x] Confirm the base app builds and runs on web, iOS simulator, and
      Android emulator before any feature work begins.

### Phase 1 — MVP (build in this exact order)

- [x] 1. Auth & onboarding (Google sign-in + 3-step quiz)
- [x] 2. Dashboard with skippable guided walkthrough
- [x] 3. Investing 101 curriculum + lesson unlock logic + quizzes
- [ ] 4. Financial health meter (self-reported quiz version)
- [ ] 5. Expense tracker & budgeting tool (framework selection, expense
     logging, spending meter, warnings, recommendations)
- [ ] 6. 90-day savings challenge (manual check-ins, streak, progress)
- [ ] 7. Public forum (threads, replies, report action)
- [ ] 8. Blog (premium-gated)
- [ ] 9. Payment flow (Paystack checkout + Edge Function webhook
     verification for both lesson unlocks and lifetime premium)
- [ ] 10. Public policy pages (Terms, Privacy, Risk Disclaimer, Refund
      Policy, Community Guidelines) linked from the footer everywhere

**Do not start Phase 1.5 until every Phase 1 box above is checked and the
founder has approved the phase.**

### Phase 1.5 — after Phase 1 approval

- [ ] Watchlist (US stocks/GH stocks/commodities)
- [ ] Curated market intelligence feed

**Do not start Phase 2 until every Phase 1.5 box above is checked and the
founder has approved the phase.**

### Phase 2 — after Phase 1.5 approval

- [ ] Portfolio diversification insights (universal educational framing only)
- [ ] Risk tolerance quiz
- [ ] Expanded GSE market data
- [ ] Native app store submission (revisit in-app purchase requirement
      before this task — see SOP §11)

---

## 6. Definition of Done — every task must pass this before being checked off

- Works correctly on web, iOS, and Android.
- Any RLS policy touched is re-verified with a non-privileged test account.
- Any payment/financial write is confirmed successful before the UI shows
  it as complete; failure is visibly surfaced to the user with a retry
  option.
- No secret or key beyond the two public keys (§3) is present in the
  client bundle.
- No new dependency was added without an exact pinned version.
- A basic automated test exists for any new calculation logic (scoring,
  budget percentages, quiz grading).
- The task's own scope only — no unrelated files changed.

---

## 7. Notes & suggestions (append here, don't act on these unprompted)

_(Agents: log anything you noticed but didn't act on here, with the date.)_

---

## 8. Progress log (append one line per completed task, don't rewrite history)

_(Agents: add entries here as `YYYY-MM-DD — Phase X, task N — one-line summary`.)_
2026-09-20 — Phase 0, Setup — Audited Expo setup, cleaned boilerplate, configured NativeWind, pinned all dependencies, established 3-tier Supabase architecture and base schema with RLS, wired Sentry, and confirmed universal builds for web, iOS, and Android.
2026-09-21 — Phase 1, task 1 — Built Google auth with session persistence, 3-step onboarding quiz writing to profiles, and route protection with moodboard styling across web, iOS, and Android.
2026-09-27 — Phase 1, task 2 — Built Finor/Aurex-styled dashboard with learning momentum metrics, core educational module cards, and a 4-step skippable guided walkthrough.
2026-09-27 — Phase 1, task 3 — Built 7-lesson Investing 101 curriculum with Ghana localization, end-of-lesson quizzes with passing threshold grading, unlock progression logic, and progress tracking.
