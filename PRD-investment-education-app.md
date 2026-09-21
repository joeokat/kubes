# Product Requirements Document — Investment Education Platform

**Audience:** human product/engineering team. For the AI-agent build process
and its strict working rules, see the companion `AGENTS.md`. For the detailed
engineering brief (tech stack, architecture, styling, release rules), see
the companion SOP document.

---

## 1. Problem statement

Beginners in Ghana who want to start investing (in the local stock
exchange or US markets) have almost nowhere structured to learn — content
is scattered across YouTube, informal WhatsApp/Telegram groups, or dense
"trading academy" platforms built for a global forex/crypto audience that
overwhelm rather than educate. The founder has been personally teaching this
content on a WhatsApp channel and has outgrown that format.

## 2. Goal

Build a calm, focused platform that takes someone from "I have no idea how
investing works" to "I understand what I'm doing and have a saving habit" —
without ever crossing into giving personalized financial advice, executing
trades, or promising outcomes. Success looks like consistent lesson
completion, sustained use of the savings challenge and expense tracker, and
premium conversions — not raw signups.

## 3. Target users

- **Primary:** Ghanaian beginners with no investing background, curious
  about the Ghana Stock Exchange and/or US stocks, currently priced out of
  or intimidated by existing financial education content.
- **Explicitly not the target:** experienced traders, financial
  professionals, or anyone looking for personalized investment advice or a
  brokerage.

## 4. Non-goals (explicitly out of scope)

- Not a brokerage — no stock, fund, or commodity is ever bought through the
  app.
- Not personalized financial/investment advice at any point.
- Not aiming to produce "advanced" investors — curriculum tops out at a
  solid intermediate/average understanding by design.
- Not connecting to real bank accounts or brokerages in MVP or Phase 1.5.

## 5. Success metrics (for the founder to track post-launch)

- % of signups who complete the free lesson in each category
- % who unlock at least one paid lesson
- % who convert to the $20 lifetime premium
- 90-day savings challenge: % who complete at least 30/90 days of check-ins
- Expense tracker: % of premium/active users logging expenses weekly
- Forum: threads/replies per week, report rate (should stay low)

## 6. User stories by feature (MVP)

**Onboarding**
- As a new user, I can sign in with Google OR Apple in one tap.
- As a new user, I answer 3 short questions (interest area, experience
  level, goal) so the platform can tailor what it highlights to me.
- As a new user, I land on a dashboard with a short, skippable walkthrough
  so I immediately know what to do first.

**Curriculum**
- As a learner, I can read my first lesson for free with no payment
  friction.
- As a learner, I pay GH₵0.50 to unlock each subsequent lesson, or pay
  once ($20) to unlock everything forever including the blog.
- As a learner, I take a short quiz at the end of each lesson before the
  next one unlocks, so I engage with the material rather than skim it.
- As a Ghanaian learner, lessons about the GSE and US stocks speak
  specifically to my context; every other lesson (saving, budgeting,
  investing concepts) is written universally so it still makes sense if
  I'm not in Ghana.

**Financial health meter**
- As a user, I answer a short quiz about my income, spending, and savings
  to get a plain-language score/band telling me where I stand.
- As a user who logs expenses regularly, my score becomes based on my
  actual logged data over time rather than a one-time quiz.

**Expense tracker & budgeting tool**
- As a user, I log an expense (amount + category) as it happens.
- As a user, I pick a budgeting framework — the founder's 55/5/10/15/15
  split by default, or the standard 50/30/20, or my own fully custom
  categories/percentages.
- As a user, I see a spending meter showing whether I'm under, near, or
  over my allocation per category.
- As a user, I get warned when I overspend a category, with a
  plain-language suggestion on what to cut back.

**Savings challenge**
- As a user, I commit to saving any amount I choose, on a frequency I
  choose, toward a savings vehicle I name myself (e.g. "mutual fund").
- As a user, I log each contribution manually and see my streak and
  progress over the 90 days.

**Community & content**
- As any signed-in user, I can post and reply in the public forum, and
  report content that seems wrong or harmful.
- As a premium user, I can read the blog, which the founder updates with
  market news/insights to keep the platform feeling current.

**Trust & compliance**
- As any visitor, I can read the platform's Terms, Privacy Policy, Risk
  Disclaimer, Refund Policy, and Community Guidelines without logging in.
- As any user, I see a clear "this is education, not advice" disclaimer
  anywhere the content could be mistaken for a recommendation.

## 7. Phased roadmap

- **Phase 1 (MVP):** Auth/onboarding, dashboard walkthrough, Investing 101
  curriculum, financial health meter, expense tracker & budgeting tool,
  90-day savings challenge, forum, blog (premium-gated), payments, policy
  pages.
- **Phase 1.5:** Watchlist (US stocks/GH stocks/commodities), curated market
  intelligence feed.
- **Phase 2:** Portfolio diversification insights, risk tolerance quiz,
  expanded GSE market data, native app store submission.

## 8. Monetization

- GH₵0.50 per lesson unlock (beyond the first free lesson per track).
- $20 one-time payment for lifetime access to everything, including the
  blog.
- Payment processor: Paystack (supports GHS, NGN, USD, mobile money, and
  cards).

## 9. Risks and open questions

- **Regulatory:** operating education content across Ghana and US-market
  topics — the founder should get a short legal review of the
  disclaimers and terms before charging real users, even though the
  platform is explicitly non-advisory.
- **Data availability:** GSE has poor free public market data, which
  limits the watchlist/market-intelligence features until a paid data
  feed is justified by revenue.
- **App store payments:** if/when native iOS/Android distribution happens,
  Apple/Google in-app purchase rules will require revisiting the payment
  flow for those platforms specifically (the web version is unaffected).
- **Open question:** should the expense tracker's data ever be exportable
  by the user (e.g. CSV)? Not currently scoped — worth deciding before
  Phase 1 ships if this matters to early users.
