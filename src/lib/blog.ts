export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  published_at: string | null;
  author: string;
  is_premium: boolean;
  category?: string;
  excerpt?: string;
  read_time_mins?: number;
  created_at?: string;
}

export interface BlogFilterOptions {
  category?: string;
  premiumOnly?: boolean;
}

/**
 * Baseline educational articles published by the founder.
 * These serve as seed posts and offline fallback content.
 */
export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-compounding-time",
    title: "Why Starting Early Beats Timing the Market",
    slug: "why-starting-early-beats-timing-the-market",
    category: "Mindset",
    author: "Kubes Editorial",
    is_premium: false,
    published_at: "2026-10-01T10:00:00Z",
    read_time_mins: 3,
    excerpt:
      "Compounding is mathematical leverage. Discover why consistent small sums saved early outperform larger sums invested late.",
    body: `Many first-time investors delay getting started because they feel their monthly savings are too small to matter. 

This hesitation stems from an intuitive misunderstanding of exponential arithmetic. Compounding returns do not care about the size of your starting capital as much as they reward time.

Consider two hypothetical savers: Saida saves GH₵200 a month starting at age 22, stopping completely at age 32. Kwame waits until age 32, then saves GH₵200 every single month until age 65. Even though Kwame contributed for over three times as many years, Saida's portfolio often ends up larger simply because her initial funds had three extra decades to compound upon themselves.

The takeaway for beginners is straightforward:
1. Building the automated saving reflex is more valuable than waiting for a windfall.
2. Market timing is notoriously inefficient—dollar-cost averaging removes emotion.
3. Every year of delay requires drastically higher future contributions to achieve the same financial baseline.

Begin with what you have today, maintain consistency, and let mathematics do the heavy lifting over decades.`,
  },
  {
    id: "post-inflation-shield",
    title: "Navigating Inflation: Preserving Real Purchasing Power",
    slug: "navigating-inflation-preserving-purchasing-power",
    category: "Macro Basics",
    author: "Kubes Editorial",
    is_premium: true,
    published_at: "2026-10-08T09:00:00Z",
    read_time_mins: 4,
    excerpt:
      "Cash sitting idle in a zero-interest account quietly loses purchasing power each year. Learn how productive assets serve as a hedge.",
    body: `Inflation is often described as the silent tax on cash. When the price of everyday staples—food, transport, housing—rises by 15% to 25% year-over-year, 100 units of currency can no longer buy the same basket of goods twelve months later.

Holding cash in an ordinary checking account guarantees a negative real return after inflation. While cash is essential for immediate liquidity and your 3–6 month emergency fund, money designated for long-term wealth must be put to work in productive assets.

Productive assets are businesses, equities, and real assets that possess pricing power. When input costs rise, well-managed companies adjust their revenues accordingly, allowing equity ownership to keep pace with or outstrip price inflation over multi-year cycles.

Key considerations for learners:
• Cash is for safety and near-term survival; equities and productive assets are for long-term purchasing power defense.
• Short-term inflation spikes feel alarming, but historical multi-decade equity returns have historically outpaced inflation.
• Diversifying across local opportunities and broad global index funds mitigates single-currency depreciation risk.`,
  },
  {
    id: "post-ghana-treasury-bills",
    title: "Understanding Ghana Treasury Bills & Fixed Income",
    slug: "understanding-ghana-treasury-bills-fixed-income",
    category: "Ghana Markets",
    author: "Kubes Editorial",
    is_premium: true,
    published_at: "2026-10-12T11:00:00Z",
    read_time_mins: 4,
    excerpt:
      "A deep dive into how 91-day, 182-day, and 364-day Government of Ghana Treasury Bills operate, auction mechanics, and CSD registration.",
    body: `For many savers in Ghana, Government of Ghana Treasury Bills (T-Bills) represent the first formal step beyond ordinary savings accounts.

What is a Treasury Bill?
A Treasury Bill is a short-term sovereign debt instrument issued by the Bank of Ghana on behalf of the government. In essence, you are lending money to the government for a defined maturity window:
• 91-Day Bills (3 months)
• 182-Day Bills (6 months)
• 364-Day Bills (1 year)

How Returns Work:
Treasury Bills are discount instruments. If you purchase a GH₵1,000 face-value 91-day bill yielding an annualized return, you pay a discounted upfront price (e.g., GH₵930) and receive the full GH₵1,000 face value upon maturity.

How to Access T-Bills in Ghana:
1. Open a Central Securities Depository (CSD) account through any licensed commercial bank or SEC-registered broker.
2. Submit your bid ahead of the Bank of Ghana's weekly Friday auction.
3. Choose whether to automatically roll over the principal and interest upon maturity or cash out.

Remember: While T-Bills offer predictable nominal yields and carry low default risk on local currency terms, their returns must always be evaluated relative to prevailing inflation rates.`,
  },
  {
    id: "post-index-funds-vs-stock-picking",
    title: "Index Funds vs. Stock Picking: The Evidence-Based Approach",
    slug: "index-funds-vs-stock-picking-evidence-based",
    category: "Investing 101",
    author: "Kubes Editorial",
    is_premium: true,
    published_at: "2026-10-15T14:00:00Z",
    read_time_mins: 5,
    excerpt:
      "Why over 85% of professional fund managers fail to beat passive index benchmarks over 10-year periods, and what beginners should learn from this.",
    body: `Financial media frequently glorifies stock picking: finding the next explosive tech company or timing commodity surges. But empirical data over decades paints a very different reality for everyday investors.

According to the SPIVA (S&P Indices Versus Active) scorecards published over the past 20 years, more than 85% of professional, full-time active mutual fund managers underperform simple broad-market passive index funds (like the S&P 500) over rolling 10-year and 15-year windows.

Why Active Stock Picking Often Fails:
1. High Turnover Costs: Frequent buying and selling incurs transaction fees, commissions, and tax drag.
2. Human Psychology: Retail investors predictably buy when enthusiasm peaks and sell during panic selloffs.
3. Information Asymmetry: Competing against algorithmic institutional traders on individual quarterly earnings is a steep uphill climb.

The Passive Indexing Advantage:
By purchasing an exchange-traded fund (ETF) that tracks hundreds or thousands of companies simultaneously, you capture the overall growth of the market while paying ultra-low expense ratios. If one individual holding goes bankrupt, dozens of others expand, protecting your portfolio from idiosyncratic disaster.

For long-term beginners, disciplined low-cost passive diversification remains one of the most reliable wealth-building tools ever created.`,
  },
];

/**
 * Calculates estimated read time in minutes based on average 200 words per minute.
 */
export function calculateReadTime(text: string): number {
  if (!text || text.trim().length === 0) return 1;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Extracts a clean excerpt from article text.
 */
export function generateExcerpt(text: string, maxLength: number = 140): string {
  if (!text) return "";
  const cleaned = text.replace(/[#*`_]/g, "").trim().replace(/\s+/g, " ");
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + "...";
}

/**
 * Checks whether a user has permission to read the full body of a post.
 */
export function canAccessBlogPost(post: BlogPost, isPremium: boolean): boolean {
  if (!post.is_premium) return true;
  return isPremium;
}

/**
 * Storage key helper for offline/instant cache
 */
const BLOG_CACHE_KEY = "@kubes_cached_blog_posts";

/**
 * Fetches all blog posts from Supabase (or fallback default posts) with offline caching.
 */
export async function fetchBlogPosts(
  filter?: BlogFilterOptions
): Promise<{ data: BlogPost[]; error: Error | null }> {
  // Check local cache
  let cachedPosts: BlogPost[] = DEFAULT_BLOG_POSTS;
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const cached = await AsyncStorage.getItem(BLOG_CACHE_KEY);
    if (cached) {
      cachedPosts = JSON.parse(cached);
    }
  } catch (_e) {}

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to cached or curated default posts
      let filtered = cachedPosts;
      if (filter?.category) {
        filtered = filtered.filter((p) => p.category === filter.category);
      }
      if (filter?.premiumOnly) {
        filtered = filtered.filter((p) => p.is_premium);
      }
      return { data: filtered, error: null };
    }

    const posts: BlogPost[] = data.map((d: any) => ({
      id: d.id,
      title: d.title,
      slug: d.slug,
      body: d.body,
      published_at: d.published_at,
      author: d.author || "Kubes Editorial",
      is_premium: d.is_premium ?? true,
      category: d.category || "Market Insight",
      read_time_mins: calculateReadTime(d.body),
      excerpt: generateExcerpt(d.body),
    }));

    // Cache locally
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem(BLOG_CACHE_KEY, JSON.stringify(posts));
    } catch (_e) {}

    let result = posts;
    if (filter?.category) {
      result = result.filter((p) => p.category === filter.category);
    }
    if (filter?.premiumOnly) {
      result = result.filter((p) => p.is_premium);
    }

    return { data: result, error: null };
  } catch (err) {
    return { data: cachedPosts, error: null };
  }
}

/**
 * Fetches a single blog post by its slug.
 */
export async function fetchBlogPostBySlug(
  slug: string,
  isPremiumUser: boolean
): Promise<{ post: BlogPost | null; isGated: boolean; error: Error | null }> {
  const allPostsResult = await fetchBlogPosts();
  const found = allPostsResult.data.find((p) => p.slug === slug);

  if (!found) {
    return { post: null, isGated: false, error: new Error("Post not found.") };
  }

  const hasAccess = canAccessBlogPost(found, isPremiumUser);
  return {
    post: found,
    isGated: !hasAccess,
    error: null,
  };
}

