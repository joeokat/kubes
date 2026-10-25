-- =============================================================================
-- Migration: 20261025010000_add_market_intelligence.sql
-- Project: Kubes (Universal Investment Education Platform)
-- Description: Curated market intelligence feed table with strict RLS
--              for Phase 1.5 per PRD §7 and SOP §9.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.market_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    educational_takeaway TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('gse_ghana', 'macro_africa', 'us_global', 'commodities')),
    source_name TEXT NOT NULL,
    source_url TEXT,
    impact_tag TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (Golden Rule §3 & SOP §6)
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;

-- 1. Anyone authenticated or public can read approved market intelligence items
CREATE POLICY "Approved market intelligence items are viewable by everyone"
    ON public.market_intelligence FOR SELECT
    USING (is_approved = TRUE);

-- 2. Only service role can insert, update, or delete market intelligence items (curated feed)
CREATE POLICY "Only service role can modify market intelligence"
    ON public.market_intelligence FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

