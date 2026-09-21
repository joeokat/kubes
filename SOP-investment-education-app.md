# Standard Operating Procedure — Investment Education Platform

**Document purpose:** This SOP is the working brief for the engineer (human or AI)
building this product. Follow it as the source of truth. Where a decision isn't
covered here, default to the most conservative, most maintainable option and
flag the assumption rather than guessing silently.

---

## 1. Role

You are a **Senior React Native + Expo Engineer** building a production-grade,
universal application (web + iOS + Android from one codebase). You are expected
to work with the discipline of someone shipping to real paying users on day
one — not a prototype, not a demo. Prioritize correctness, security, and
maintainability by a non-technical founder over cleverness or speed.

The founder (product owner) has **no backend engineering experience** and will
not be maintaining servers. Every architectural decision should minimize
ongoing technical burden on them after launch.

---

## 2. Product overview

**What this is:** An educational platform that teaches complete beginners in
Ghana, and interested US-market learners, how investing works —
concepts, habits, and vocabulary — without ever executing a trade on their
behalf and without giving personalized financial advice.

**What this is not:** Not a brokerage. Not a trading platform. Not a
robo-advisor. No stock, fund, or commodity is ever purchased through this
app. It does not custody money, execute trades, or manage anyone's portfolio.
Every feature that touches "risk," "diversification," or "portfolio" must stay
strictly educational/informational — general concepts, never a personalized
recommendation to buy or sell a specific instrument. See §7 (Compliance
Rules) — this constraint is non-negotiable and overrides feature requests
that would cross it.

**Content localization rule:** Lessons and examples specific to the **Ghana
Stock Exchange and US stock markets** should be written with Ghanaian
learners as the primary audience — local currency (cedis), local context,
local relevance. Every **other** financial lesson or tool (budgeting,
saving habits, compounding, risk/diversification concepts, the expense
tracker) must stay **generic and market-agnostic** by design, so a learner
anywhere else could still apply the same concept to their own local market,
even though Ghana is the only market this platform actively targets. Do
not hard-code Ghana-specific assumptions (currency symbols, exchange
names, tax rules) into anything outside the GSE/US-specific lessons.

**Origin:** The founder previously taught this content informally on a
WhatsApp channel and is now building a proper platform to keep the content
fresh, structured, and scalable without repeating themselves.

**Tone:** Calm, encouraging, unintimidating. Explicitly not modeled on dense
"trading academy" platforms — lessons should feel like a short, well-written
explainer, never a chore, never a sales funnel in disguise.

---

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Expo (React Native) + Expo Router** | Universal target: iOS, Android, and Web from one codebase |
| Web output | `react-native-web` (bundled via Expo) | Enables SEO-relevant public pages (landing, blog, policies) to render as real web pages |
| Language | **TypeScript**, strict mode | No `any` without justification in a comment |
| Styling | **NativeWind** (Tailwind syntax for React Native, also outputs correctly on web via react-native-web) | See §4 for required solutions to known native/web parity gaps |
| Backend | **Supabase** (Postgres + Auth + Storage + Edge Functions) | No custom server to maintain. All business logic lives in Supabase Edge Functions or client-side, never a separate Node service |
| Auth | Supabase Auth, **Google OAuth only** for MVP | Native: `expo-auth-session` + deep linking via `expo-linking`. Web: standard redirect flow |
| Payments | **Paystack** (hosted checkout) | Web: standard redirect. Native: open Paystack's hosted checkout via in-app browser (`expo-web-browser`), never a custom card form. Verify every payment server-side via a Supabase Edge Function that Paystack's webhook calls — never trust a client-reported "payment succeeded" |
| Push notifications | `expo-notifications` | Phase 1.5+, not MVP-blocking |
| Error monitoring | **Sentry** (or equivalent) | Required before public launch — see §12 |
| Analytics | Deferred to Phase 2 | Do not add a third-party analytics SDK without the founder's explicit sign-off (privacy policy implications) |

**Version pinning rule:** Every dependency in `package.json` must be pinned to
an exact version (no `^` or `~` ranges) for the MVP build, and
`package-lock.json` (or `bun.lock`/`pnpm-lock.yaml`, whichever is chosen) must
be committed. Do not upgrade a pinned dependency mid-build without re-testing
the full app. This project has previously broken in production from
unpinned dependency drift — treat this rule as load-bearing, not a style
preference.

---

## 4. Styling rules

- Tailwind utility classes via NativeWind, applied consistently across native
  and web output — no separate native-only or web-only stylesheets unless a
  platform genuinely requires different layout (use `Platform.select` sparingly
  and only when necessary).
- Design should feel calm and editorial, not like a dense fintech dashboard —
  generous whitespace, a restrained color palette, no more than one accent
  color for calls-to-action.
- Typography: one serif or distinctive display font for headings, one clean
  sans-serif for body/UI text. Avoid anything that reads as a generic
  Bootstrap/Material default.
- All interactive elements (buttons, links, form fields) must have visible
  focus and pressed states — this is a financial-adjacent product and must
  feel trustworthy, not janky.
- Support light mode only for MVP unless the founder requests dark mode.
- Every screen must render correctly at common mobile widths (360–430px) and
  as a responsive web layout (up to ~1280px) — this is a universal app, not a
  mobile app with a web afterthought.

### 4.1 Known native/web styling parity issues — required solutions

React Native, react-native-web, and NativeWind do not behave identically to
plain CSS. These are known, recurring failure points — do not rediscover
them by trial and error mid-build. Follow the prescribed solution for each:

| Issue | Required solution |
|---|---|
| Raw text rendered outside a `<Text>` component crashes on native (but not on web) | Always wrap every string in `<Text>` — never assume web-style bare text nodes work |
| `position: fixed` has no native equivalent | Use `position: 'absolute'` with a `Platform.OS === 'web'` check for anything that must stay fixed while scrolling on web (e.g. a sticky header) |
| Box shadows render inconsistently across platforms | iOS: `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`. Android: `elevation`. Web: standard `box-shadow` via NativeWind. Build one small `Shadow` wrapper component that applies the right platform props, rather than repeating this per screen |
| Percentage heights (`h-full`, `h-1/2`) are unreliable in RN flexbox unless every parent in the chain has an explicit height | Prefer `flex-1` and explicit `dimensions` over percentage heights; if a percentage height doesn't render, check the full parent chain before assuming NativeWind is broken |
| Nesting a `ScrollView`/`FlatList` inside another of the same scroll direction breaks scrolling and throws warnings | Flatten list structures; use `FlatList`'s `ListHeaderComponent`/`ListFooterComponent` instead of wrapping it in another scrollable |
| Custom fonts flash as the system font before loading | Gate the first render behind Expo's `useFonts` hook (`expo-font`) — show a loading state until fonts resolve, on every platform, not just native |
| Notches/status bars/home indicators overlap content on native | Use `react-native-safe-area-context` (`SafeAreaView` / `useSafeAreaInsets`) everywhere instead of manual padding guesses — this is a no-op on web, so it's safe to apply universally |
| Numeric input fields don't show the right mobile keyboard | Always set `keyboardType` explicitly (e.g. `"decimal-pad"` for money amounts) — this is a finance app with heavy numeric entry, so get this right on every input from the start |
| Not every Tailwind class has a NativeWind/RN equivalent (e.g. backdrop blur, complex CSS gradients) | Don't fight NativeWind trying to force an unsupported class. For gradients use `expo-linear-gradient`; for blur use `expo-blur`. Keep a running note in the repo of any class found unsupported so it isn't rediscovered by the next contributor |

If a styling issue arises that isn't listed here, document the issue and the
chosen fix in the repo (a `STYLING_NOTES.md` is sufficient) rather than
silently working around it inline — this keeps the founder's future agent
or developer from re-solving the same problem.

---

## 5. Architecture rules

- **File structure:** Expo Router file-based routing. Group routes logically:
  `app/(public)/` for landing/blog/policies (SEO-relevant, must render
  server-side or statically on web), `app/(auth)/` for login/onboarding,
  `app/(app)/` for the authenticated dashboard experience.
- **State management:** Prefer local component state and Supabase's
  client-side queries/subscriptions over a heavy global state library. Only
  introduce a state library (e.g. Zustand) if prop-drilling genuinely becomes
  unmanageable — justify it in a comment if added.
- **Data layer:** All reads/writes go through the Supabase client SDK
  directly from the app for MVP. The only server-side code permitted is
  Supabase Edge Functions, and only for things the client must never be
  trusted to do itself:
  - Verifying a Paystack payment webhook and unlocking the corresponding
    lesson/premium status
  - Any future logic that must not be tamperable from the client
- **No custom backend server.** Do not introduce Express, Fastify, or any
  standalone Node service. If a task seems to need one, stop and flag it —
  there is almost always a Supabase-native way to do it that doesn't add a
  service the founder would have to run and maintain.
- **Secrets:** No API keys or secrets in client-bundled code beyond
  Supabase's public anon key (which is designed to be public) and Paystack's
  public key. Paystack's secret key lives only in the Edge Function
  environment, never in the app.
- **Offline/error handling:** Every network call must handle failure
  gracefully (toast/inline message, retry where sensible) — never a blank
  screen or unhandled promise rejection. This matters more than usual given
  variable mobile network conditions in the target markets.
- **Financial data integrity:** Writes involving money (expenses, payments,
  savings check-ins, budget allocations) must confirm success before
  updating the UI as complete — no optimistic "assume it worked" for
  anything financial. If a write fails, the user must see that it failed
  and be able to retry, never silently lose the entry.

---

## 6. Data model (Supabase/Postgres)

Build these tables (adjust field types as needed, but keep this shape):

```
profiles              — id (fk auth.users), name, avatar_url, goal, experience_level,
                         premium_status (bool), premium_purchased_at, created_at

lessons                — id, slug, category, title, order_index, content (markdown),
                         is_free (bool), price_ghs (decimal, default 0.50)

lesson_progress        — user_id, lesson_id, completed_at, quiz_score

payments                — user_id, lesson_id (nullable — null means lifetime premium),
                          amount, currency, paystack_reference, status, created_at

forum_threads            — id, user_id, title, category, created_at

forum_replies             — id, thread_id, user_id, body, created_at, report_count

savings_challenges         — id, user_id, target_amount, frequency, vehicle_label,
                              start_date, status

savings_checkins            — id, challenge_id, amount, logged_at

health_quiz_responses        — id, user_id, income_range, spend_buckets (jsonb),
                                savings_rate, emergency_months, score, band, computed_at

blog_posts                    — id, title, slug, body, published_at, author, is_premium (bool, default true)

budget_frameworks              — id, user_id, name, categories (jsonb: [{label, percent}]),
                                  is_active (bool), created_at
                                  -- see §8 (MVP item 5) for the default template and category meanings

expenses                        — id, user_id, amount, category_label, note,
                                   spent_at (date), created_at
```

Row-level security (RLS) must be enabled on every table from the start —
users can only read/write their own rows except where content is explicitly
public (lessons, blog posts, forum threads/replies for reading).

---

## 7. Compliance rules (non-negotiable)

- Every lesson, the footer, and any risk/portfolio-related screen must
  carry visible, unavoidable language to the effect of: *"This platform is
  for education only. Nothing here is financial, investment, or trading
  advice, and no outcome is promised. [Company] is not a registered
  investment advisor or broker-dealer."*
- The following pages must exist, be publicly accessible without login, and
  be linked from the footer on every screen: **Terms of Service, Privacy
  Policy, Risk Disclaimer, Refund Policy, Community Guidelines.**
- **Diversification/risk-analysis features must never recommend a specific
  instrument.** Acceptable: "Your holdings are concentrated in one sector —
  concentration generally increases risk." Not acceptable: "Consider buying
  [specific stock/fund]." If a feature request would require the latter,
  stop and flag it to the founder rather than implementing it.
- The expense tracker/budgeting tool (MVP item 5, §8) is arithmetic against
  the user's own declared numbers and framework — this is not investment
  advice and may freely tell a user "you're over your Wants allocation this
  month," since that's just math against their own stated plan, not a
  recommendation about any financial instrument.
- The platform never custodies funds, executes trades, or connects to a
  brokerage/bank account. The 90-day savings challenge, portfolio tracker,
  and expense tracker are all entirely self-reported/manual by the user —
  no financial account integration in MVP or Phase 1.5.
- Forum: a "Report" action must exist on every thread/reply from MVP launch.
  Do not ship the forum without it.

---

## 8. Feature specification (MVP scope — build this first, in this order)

1. **Auth & onboarding** — Google sign-in (web + native), then a 3-step quiz
   (interest area, experience level, primary goal) writing to `profiles`.
2. **Dashboard** — a short, skippable guided tour (4-5 tooltip steps) on
   first visit pointing to: first free lesson, health meter, savings
   challenge. Shows lesson progress and current health-meter score once set.
3. **Curriculum ("Investing 101" track)** — 7 lessons per the outline already
   agreed with the founder, written universally per §2's localization rule
   except where a lesson is explicitly about the GSE or US markets. First
   lesson free; remaining 6 unlock at GH₵0.50 each via Paystack, or all
   unlocked immediately with the $20 lifetime premium purchase. Each lesson
   ends in a 3-question quiz gating the next lesson.
4. **Financial health meter** — self-reported quiz (income range, spend
   buckets, savings rate, emergency fund months) producing a score + band
   (e.g. Building / Steady / Strong) with plain-language tips. Recalculates
   whenever the user retakes it. Once the expense tracker (item 5) has
   enough logged data, blend it into a richer, living score instead of a
   point-in-time quiz.
5. **Expense tracker & budgeting tool.** Full spec:
   - User logs an expense (amount + what it was for) as it happens, daily
     over time — this is the core data-entry loop.
   - User selects a **budget framework**: a set of categories with
     percentage allocations that sum to 100%. The default template offered
     is the founder's own framework (adjustable by the user):
     - 🏠 55% — Essentials (rent, food, transport, and other necessities)
     - 🍿 5% — Free spending
     - 💳 10% — Debt repayment (or investing, if debt-free)
     - 🎯 15% — Short-term goals
     - 📈 15% — Long-term wealth building
     - The standard 50/30/20 (Needs/Wants/Savings) should also be offered as
       an alternate preset. In both cases, **category labels and percentages
       must be fully user-editable** — the founder's split is a starting
       point, not a fixed rule.
   - Each logged expense is tagged to one category. The app compares
     cumulative spend per category against the user's income and chosen
     percentages for the period (recommend monthly, adjustable).
   - **Spending meter/dashboard:** a visual gauge per category (under / near
     / over allocation) plus an overall health view, echoing the same visual
     language as the financial health meter (item 4) so the two feel like
     one system, not two separate tools.
   - **Warnings:** when a category exceeds its allocated percentage, the
     user is alerted in-app (push notification comes later, once §9's
     notification plumbing exists).
   - **Recommendations:** plain-language, generic suggestions tied to their
     own numbers (e.g. "Free spending is 40% over plan this month — consider
     pausing discretionary purchases until next period"). This is arithmetic
     against the user's own declared framework, not investment advice — see
     §7.
6. **90-day savings challenge** — user sets a target amount, frequency, and
   a vehicle label (free text, e.g. "mutual fund", "savings account"); logs
   manual check-ins; sees a streak and progress bar.
7. **Public forum** — categories, threads, replies, report action. Open to
   any signed-in user.
8. **Blog** — gated behind `premium_status = true`. Founder publishes posts
   manually for MVP (no CMS automation yet).
9. **Pricing/payment flow** — GH₵0.50 per lesson, $20 one-time for lifetime
   premium, both via Paystack hosted checkout, verified server-side via
   Edge Function webhook before any unlock is granted.
10. **Public policy pages** — per §7.

## 9. Feature specification — Phase 1.5 (after MVP validates)

- **Watchlist** — user adds US stocks/commodities to track (data via a
  free-tier market data API — do not commit to a specific paid vendor
  without founder sign-off, given GSE has poor free data availability).
- **Market intelligence feed** — curated headlines (RSS aggregation),
  founder approves before publish.

## 10. Feature specification — Phase 2

- **Portfolio diversification insights** — self-reported holdings,
  visualized concentration, generic educational framing only (§7 applies).
- **Risk tolerance quiz** — outputs a general profile label, pairs with the
  diversification feature.
- Expanded GSE market data (paid feed, once justified by revenue).
- Native app store submission (this is when Apple/Google in-app purchase
  requirements must be revisited — see §11).

---

## 11. Known constraint to revisit later

The web build uses Paystack directly, which is compliant. **If/when this
ships as a native iOS/Android app through the App Store/Play Store**, Apple
and Google both require digital content purchases (lesson unlocks, lifetime
premium) to go through their own in-app purchase systems, not Paystack
directly. This SOP intentionally defers that decision — do not build native
IAP in MVP. Flag it back to the founder before any App Store/Play Store
submission is attempted.

---

## 12. Release engineering & safety rules (applies to every release, not just MVP)

These rules exist because the founder is not a backend/release engineer and
will not be manually catching problems before users see them — the process
itself has to catch them.

- **Environments:** separate Supabase projects for development, staging,
  and production. A development build must never be able to read or write
  production data, under any configuration.
- **Versioning:** Semantic Versioning (MAJOR.MINOR.PATCH). Maintain a
  `CHANGELOG.md` updated with every release — what changed, and why.
- **Testing gates before any release:**
  - Automated unit tests for anything involving calculation: the health
    meter scoring, the budget/expense percentage math, and quiz scoring.
    These are the pieces most likely to quietly go wrong and least likely
    to be caught by eyeballing the UI.
  - Integration tests for the two flows that involve real money or
    identity: authentication and payment verification.
  - A manual smoke-test checklist covering every MVP feature (§8), run on
    web, iOS, and Android before each release — not just the platform that
    was being actively worked on.
- **Security, run before every release:**
  - Confirm RLS policies still block a non-privileged test account from
    reading/writing another user's rows — test this explicitly, don't
    assume it still holds after schema changes.
  - Run a dependency vulnerability scan (`npm audit` or equivalent). Any
    high/critical finding must be resolved or explicitly accepted with the
    founder's sign-off before release — never silently ignored.
  - Confirm no secret or key beyond the public Supabase/Paystack keys is
    present in the client bundle (see §5).
- **Error monitoring:** Sentry (or equivalent) must be wired up before
  public launch. Every unhandled exception must be caught by an error
  boundary (React) or global handler — a user should see a clear "something
  went wrong, please retry" message, never a blank or frozen screen.
- **Rollback plan:** Expo's OTA update system (`expo-updates`) allows
  JavaScript-only fixes to reach users instantly without an App Store/Play
  Store resubmission — use this for the vast majority of bug fixes. Any
  change to native code (new native module, native permission, etc.)
  requires a full store resubmission and is subject to review latency —
  the agent must flag which category a given fix falls into so the founder
  knows what to expect.
- **Backups:** confirm Supabase's automated backups are enabled on the
  production project. Daily backups are an acceptable recovery point for
  MVP; document this assumption so it can be revisited as the user base
  grows.
- **Data integrity:** per §5, no financial write (expense, payment,
  savings check-in) may be treated as successful in the UI until the
  database confirms it. Silent data loss on anything money-related is
  treated as a release-blocking bug, not a minor issue.

---

## 13. Definition of done (per release)

Use this checklist for the MVP launch and every release after it:

- All features scoped for this release are built and functioning
  end-to-end on web, iOS, and Android from the same codebase.
- Every payment path verified server-side; no client-trusted unlock exists.
- RLS enabled and explicitly re-tested on every table touched this release.
- All required policy pages (§7) remain live and linked from the footer.
- No secrets present in the client bundle.
- Dependency versions pinned; lockfile committed and up to date.
- Automated tests (§12) passing; manual smoke-test checklist completed on
  all three platforms.
- Error monitoring confirmed active and receiving events in production.
- `CHANGELOG.md` updated; version number bumped per semver.
- For any native-code change: store submission requirements reviewed and
  the founder informed of expected review latency before release.
