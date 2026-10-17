CREATE TABLE IF NOT EXISTS public.forum_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) BETWEEN 5 AND 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (num_nonnulls(thread_id, reply_id) = 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_reports_reporter_thread
    ON public.forum_reports(reporter_id, thread_id)
    WHERE thread_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_reports_reporter_reply
    ON public.forum_reports(reporter_id, reply_id)
    WHERE reply_id IS NOT NULL;

ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own forum reports"
    ON public.forum_reports FOR SELECT
    USING (auth.uid() = reporter_id);

CREATE POLICY "Users can submit their own forum reports"
    ON public.forum_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);