-- =============================================================================
-- Migration: 20260920000000_base_schema.sql
-- Project: Kubes (Universal Investment Education Platform)
-- Description: Base database schema with strict Row-Level Security (RLS)
--              enabled on every table per SOP §6.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    avatar_url TEXT,
    goal TEXT,
    experience_level TEXT,
    interest_area TEXT,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    premium_status BOOLEAN NOT NULL DEFAULT FALSE,
    premium_purchased_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. LESSONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    price_ghs NUMERIC(10, 2) NOT NULL DEFAULT 0.50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are readable by everyone"
    ON public.lessons FOR SELECT
    USING (TRUE);

CREATE POLICY "Lessons are modifiable only by service role"
    ON public.lessons FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- -----------------------------------------------------------------------------
-- 3. LESSON_PROGRESS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ,
    quiz_score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson progress"
    ON public.lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
    ON public.lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
    ON public.lesson_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lesson progress"
    ON public.lesson_progress FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. PAYMENTS
-- Server-side webhook verified only; client never inserts directly
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL,
    paystack_reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Payments can only be inserted or updated by service role"
    ON public.payments FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- -----------------------------------------------------------------------------
-- 5. FORUM_THREADS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view forum threads"
    ON public.forum_threads FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own forum threads"
    ON public.forum_threads FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own forum threads"
    ON public.forum_threads FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forum threads"
    ON public.forum_threads FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. FORUM_REPLIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    report_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view forum replies"
    ON public.forum_replies FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own forum replies"
    ON public.forum_replies FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own forum replies"
    ON public.forum_replies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forum replies"
    ON public.forum_replies FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. SAVINGS_CHALLENGES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_amount NUMERIC(12, 2) NOT NULL,
    frequency TEXT NOT NULL,
    vehicle_label TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.savings_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings challenges"
    ON public.savings_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own savings challenges"
    ON public.savings_challenges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings challenges"
    ON public.savings_challenges FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings challenges"
    ON public.savings_challenges FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. SAVINGS_CHECKINS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.savings_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.savings_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings checkins"
    ON public.savings_checkins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own savings checkins"
    ON public.savings_checkins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings checkins"
    ON public.savings_checkins FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings checkins"
    ON public.savings_checkins FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. HEALTH_QUIZ_RESPONSES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    income_range TEXT NOT NULL,
    spend_buckets JSONB NOT NULL DEFAULT '{}'::JSONB,
    savings_rate NUMERIC(5, 2) NOT NULL,
    emergency_months NUMERIC(5, 2) NOT NULL,
    score INTEGER NOT NULL,
    band TEXT NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.health_quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health quiz responses"
    ON public.health_quiz_responses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health quiz responses"
    ON public.health_quiz_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health quiz responses"
    ON public.health_quiz_responses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health quiz responses"
    ON public.health_quiz_responses FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 10. BLOG_POSTS
-- Premium-gated: visible if not premium or if user has premium_status = true
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    body TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    author TEXT NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Non-premium blog posts are viewable by anyone"
    ON public.blog_posts FOR SELECT
    USING (NOT is_premium);

CREATE POLICY "Premium blog posts are viewable by premium users"
    ON public.blog_posts FOR SELECT
    USING (
        is_premium AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.premium_status = TRUE
        )
    );

CREATE POLICY "Blog posts are modifiable only by service role"
    ON public.blog_posts FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- -----------------------------------------------------------------------------
-- 11. BUDGET_FRAMEWORKS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budget_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    categories JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.budget_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget frameworks"
    ON public.budget_frameworks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budget frameworks"
    ON public.budget_frameworks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget frameworks"
    ON public.budget_frameworks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget frameworks"
    ON public.budget_frameworks FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 12. EXPENSES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    category_label TEXT NOT NULL,
    note TEXT,
    spent_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- INDEXES for Query Optimization
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_savings_challenges_user ON public.savings_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_checkins_challenge ON public.savings_checkins(challenge_id);
CREATE INDEX IF NOT EXISTS idx_savings_checkins_user ON public.savings_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_health_quiz_user ON public.health_quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_spent ON public.expenses(user_id, spent_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at DESC);

-- -----------------------------------------------------------------------------
-- AUTH TRIGGER: Auto-provision user profile
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

