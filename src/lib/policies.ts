export interface PolicyDocument {
  slug: string;
  title: string;
  shortDescription: string;
  lastUpdated: string;
  sections: Array<{
    heading: string;
    content: string[];
  }>;
}

export const POLICIES: Record<string, PolicyDocument> = {
  terms: {
    slug: "terms",
    title: "Terms of Service",
    shortDescription: "Rules and terms governing the use of the Kubes educational software platform.",
    lastUpdated: "October 17, 2026",
    sections: [
      {
        heading: "1. Purpose and Educational Scope",
        content: [
          "Kubes is an educational software platform operated to teach beginners basic financial literacy, budgeting frameworks, and fundamental investment concepts.",
          "Kubes is NOT a registered investment advisor, broker-dealer, financial planner, or tax advisor. Kubes does not execute securities transactions, custody funds, or offer personalized investment advice.",
          "All educational materials, lessons, calculators, and forum discussions are provided for general educational purposes only. Nothing contained on the platform constitutes an offer to buy or sell securities.",
        ],
      },
      {
        heading: "2. User Accounts and Eligibility",
        content: [
          "To access personalized features such as the curriculum progress tracker, financial health meter, expense logger, and forum, you must register using an authorized authentication provider (Google OAuth).",
          "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        ],
      },
      {
        heading: "3. Non-Custodial Nature & Manual Self-Reporting",
        content: [
          "Kubes is strictly non-custodial. The 90-day savings challenge, expense tracker, and portfolio tools rely entirely on self-reported, manual inputs by the user.",
          "Kubes never connects directly to your bank accounts, mobile money wallets, or brokerage accounts. The platform does not hold, transfer, or manage user assets.",
        ],
      },
      {
        heading: "4. Digital Purchases & Access",
        content: [
          "Certain premium features, including single lesson unlocks (GH₵0.50) and Lifetime Premium access ($20.00), are processed securely via Paystack.",
          "Purchases grant a non-transferable, non-exclusive license to access the educational materials for personal, non-commercial use.",
        ],
      },
      {
        heading: "5. Limitation of Liability",
        content: [
          "To the fullest extent permitted by applicable law, Kubes, its founders, and contributors shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform or reliance on educational content.",
          "All investment decisions are made solely at your own discretion and risk. You should consult a licensed financial professional before making any financial commitment.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    shortDescription: "How Kubes collects, protects, and respects your personal and financial information.",
    lastUpdated: "October 17, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        content: [
          "Account Information: When signing in with Google OAuth, we receive your name, email address, and avatar URL.",
          "Educational & Self-Reported Data: We store your onboarding answers, quiz responses, manually entered expenses, savings challenge milestones, and public forum contributions.",
          "Technical Data: We collect anonymized crash reports and performance telemetry via Sentry to improve app stability.",
        ],
      },
      {
        heading: "2. How We Use Your Data",
        content: [
          "To deliver the educational experience, calculate your personal health meter score, track your 90-day savings streak, and store your budget categories.",
          "To verify payment unlocks and lifetime premium status server-side via Paystack webhooks.",
          "We never sell, rent, or monetize your personal data or self-reported financial numbers to advertisers or third-party data brokers.",
        ],
      },
      {
        heading: "3. Third-Party Service Providers",
        content: [
          "Supabase: Provides secure database hosting, authentication, and row-level security (RLS) ensuring that your private financial entries can only be accessed by your authenticated user session.",
          "Paystack: Handles payment card and mobile money processing. Kubes never receives or stores your full credit card numbers or mobile money PINs.",
          "Sentry: Monitors errors and crashes with sensitive variables sanitized.",
        ],
      },
      {
        heading: "4. Data Security and Retention",
        content: [
          "We enforce Row-Level Security (RLS) on every database table. Your expenses, health quiz responses, and progress are isolated to your own user identifier.",
          "You may request the full deletion of your account and associated records at any time by contacting support.",
        ],
      },
    ],
  },
  "risk-disclaimer": {
    slug: "risk-disclaimer",
    title: "Risk Disclaimer",
    shortDescription: "Essential disclosures regarding capital risk, market volatility, and investment decisions.",
    lastUpdated: "October 17, 2026",
    sections: [
      {
        heading: "1. General Risk Warning",
        content: [
          "All investments in financial instruments—including Ghana Stock Exchange (GSE) equities, treasury bills, mutual funds, and US stock indices—carry the inherent risk of loss of capital.",
          "The value of investments and the income derived from them can fluctuate downwards as well as upwards. You may not recover the full amount of capital initially invested.",
        ],
      },
      {
        heading: "2. No Guarantee of Performance",
        content: [
          "Past performance, historical index returns, and compounding examples presented in curriculum lessons are strictly educational models. They are not a guarantee, projection, or promise of future results.",
          "Kubes makes no representations or warranties regarding market returns, economic stability, currency fluctuations (such as GHS/USD exchange rate volatility), or inflation rates.",
        ],
      },
      {
        heading: "3. Not Personalized Financial Advice",
        content: [
          "Nothing on Kubes constitutes personalized financial, investment, legal, or tax advice. The platform's calculators, health meter bands, and budget allocations are generic mathematical tools tailored solely to user-entered figures.",
          "Before executing any financial transaction or purchasing any securities, you should conduct independent due diligence and consult a licensed, independent financial advisor registered with the Securities and Exchange Commission (SEC Ghana) or relevant regulatory body.",
        ],
      },
    ],
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Refund Policy",
    shortDescription: "Our policy regarding digital purchases, single lesson unlocks, and lifetime premium.",
    lastUpdated: "October 17, 2026",
    sections: [
      {
        heading: "1. Digital Educational Content",
        content: [
          "Kubes offers digital educational content delivered immediately upon purchase via Paystack. This includes single lesson unlocks (GH₵0.50) and Lifetime Premium access ($20.00).",
          "Because access to full educational notes, interactive quizzes, and premium market analyses is provisioned instantly upon database payment verification, purchases are generally non-refundable once digital access has been granted.",
        ],
      },
      {
        heading: "2. Technical Delivery Issues & Duplicate Charges",
        content: [
          "If you were charged more than once for the same transaction due to a network error, mobile money latency, or payment gateway duplication, we will promptly refund the duplicate transaction upon verification.",
          "If a payment was confirmed by your payment provider but our system failed to unlock your content within 24 hours after contacting support, you are entitled to a full refund.",
        ],
      },
      {
        heading: "3. How to Request Assistance",
        content: [
          "To request a refund review for duplicate charges or technical fulfillment issues, please contact support@kubes.app with your Paystack payment reference, account email, and date of transaction within 14 days of purchase.",
          "Approved refunds are returned to the original payment method (mobile money wallet or bank card) within 5–10 business days depending on your bank or network operator.",
        ],
      },
    ],
  },
  "community-guidelines": {
    slug: "community-guidelines",
    title: "Community Guidelines",
    shortDescription: "Standards for respectful, constructive learning and discussion within the Kubes forum.",
    lastUpdated: "October 17, 2026",
    sections: [
      {
        heading: "1. Calm, Constructive, and Educational",
        content: [
          "The Kubes community forum exists to help beginners ask questions, share saving habits, and demystify financial concepts in a calm, supportive setting.",
          "Treat fellow learners with respect and patience. There are no stupid questions when learning how money works.",
        ],
      },
      {
        heading: "2. Prohibited Content and Conduct",
        content: [
          "No Buy/Sell Directives or Market Tips: Do not tell other users to 'buy stock X' or 'short instrument Y'. Discuss concepts and education, not specific investment tips.",
          "No Get-Rich-Quick, Ponzi, or Unregulated Schemes: Promotion of speculative schemes, unofficial WhatsApp investment signal groups, unlicensed investment platforms, or suspicious crypto tokens will result in immediate permanent banning.",
          "No Spam, Self-Promotion, or Referral Links: Do not post referral codes, promotional affiliate links, or unsolicited advertising.",
          "No Harassment, Hate Speech, or Abusive Behavior: Respect diversity of backgrounds and perspectives. Personal attacks are strictly prohibited.",
        ],
      },
      {
        heading: "3. In-App Reporting & Moderation",
        content: [
          "Every thread and reply features a built-in 'Report' button. If you encounter spam, harassment, or financial advice violations, tap Report immediately.",
          "The platform moderation team reviews reported content promptly and reserves the right to remove content, suspend posting privileges, or terminate accounts that violate these guidelines.",
        ],
      },
    ],
  },
};

export function getAllPolicies(): PolicyDocument[] {
  return Object.values(POLICIES);
}

export function getPolicyBySlug(slug: string): PolicyDocument | null {
  return POLICIES[slug] || null;
}

