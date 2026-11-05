-- Supabase Database Schema for PostMed English Trends

CREATE TABLE IF NOT EXISTS public.words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT UNIQUE NOT NULL,
    meaning TEXT NOT NULL,
    total_count INT DEFAULT 0,
    trends JSONB DEFAULT '{}'::jsonb,
    schools JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL REFERENCES public.words(word) ON DELETE CASCADE,
    year TEXT NOT NULL,
    school TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    question_no INT NOT NULL,
    sentence TEXT NOT NULL,
    options JSONB NOT NULL,
    answer VARCHAR(2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Words" ON public.words FOR SELECT USING (true);
CREATE POLICY "Public Read Contexts" ON public.exam_contexts FOR SELECT USING (true);
