-- =============================================================================
-- Migration: 20261025020000_add_risk_tolerance_responses.sql
-- Project: Kubes (Universal Investment Education Platform)
-- Description: Risk tolerance quiz responses with strict Row-Level Security (RLS)
--              for Phase 2 per PRD §7 and SOP §10.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.risk_tolerance_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::JSONB,
    score INTEGER NOT NULL,
    profile_label TEXT NOT NULL,
    profile_band TEXT NOT NULL CHECK (profile_band IN ('conservative', 'moderate', 'growth')),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (Golden Rule §3 & SOP §6)
ALTER TABLE public.risk_tolerance_responses ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own risk tolerance responses
CREATE POLICY "Users can view own risk tolerance responses"
    ON public.risk_tolerance_responses FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Users can insert their own risk tolerance responses
CREATE POLICY "Users can insert own risk tolerance responses"
    ON public.risk_tolerance_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own risk tolerance responses
CREATE POLICY "Users can update own risk tolerance responses"
    ON public.risk_tolerance_responses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own risk tolerance responses
CREATE POLICY "Users can delete own risk tolerance responses"
    ON public.risk_tolerance_responses FOR DELETE
    USING (auth.uid() = user_id);

-- Performance index for fast latest-score lookups
CREATE INDEX IF NOT EXISTS idx_risk_tolerance_user_computed
    ON public.risk_tolerance_responses (user_id, computed_at DESC);

