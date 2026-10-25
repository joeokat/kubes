-- =============================================================================
-- Migration: 20261025000000_add_watchlist_items.sql
-- Project: Kubes (Universal Investment Education Platform)
-- Description: Watchlist items table with strict Row-Level Security (RLS)
--              for Phase 1.5 per PRD §7 and SOP §9.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('us_stock', 'gh_stock', 'commodity')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_watchlist_symbol UNIQUE (user_id, symbol)
);

-- Enable Row Level Security (Golden Rule §3 & SOP §6)
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own watchlist items
CREATE POLICY "Users can view own watchlist items"
    ON public.watchlist_items FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Users can add items to their own watchlist
CREATE POLICY "Users can insert own watchlist items"
    ON public.watchlist_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own watchlist items
CREATE POLICY "Users can update own watchlist items"
    ON public.watchlist_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Users can remove items from their own watchlist
CREATE POLICY "Users can delete own watchlist items"
    ON public.watchlist_items FOR DELETE
    USING (auth.uid() = user_id);

