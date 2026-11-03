-- =============================================================================
-- Migration: 20261025030000_add_portfolio_holdings.sql
-- Project: Kubes (Universal Investment Education Platform)
-- Description: Self-reported portfolio holdings with strict Row-Level Security
--              for Phase 2 per PRD §7 and SOP §10.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK (asset_class IN ('gh_stock', 'us_stock', 'fixed_income', 'cash_equivalent', 'commodity', 'real_estate')),
    amount_ghs NUMERIC(14, 2) NOT NULL CHECK (amount_ghs > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (Golden Rule §3 & SOP §6)
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own self-reported holdings
CREATE POLICY "Users can view own portfolio holdings"
    ON public.portfolio_holdings FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Users can insert their own self-reported holdings
CREATE POLICY "Users can insert own portfolio holdings"
    ON public.portfolio_holdings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own self-reported holdings
CREATE POLICY "Users can update own portfolio holdings"
    ON public.portfolio_holdings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own self-reported holdings
CREATE POLICY "Users can delete own portfolio holdings"
    ON public.portfolio_holdings FOR DELETE
    USING (auth.uid() = user_id);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user
    ON public.portfolio_holdings (user_id);

