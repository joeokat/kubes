-- =============================================================================
-- Migration: 20260921000000_add_onboarding_to_profiles.sql
-- Project: Kubes (Universal Investment Education Platform)
-- Description: Add interest_area and onboarding_completed columns to profiles.
-- =============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS interest_area TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure handle_new_user trigger continues to initialize new profiles gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url, onboarding_completed)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

