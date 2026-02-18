
-- Predictions table to store query history
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_text TEXT NOT NULL,
  headline TEXT,
  source_name TEXT,
  prediction TEXT NOT NULL CHECK (prediction IN ('REAL', 'FAKE')),
  confidence NUMERIC(5,2) NOT NULL,
  probability_score NUMERIC(5,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sources tracking table
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_checks INTEGER NOT NULL DEFAULT 0,
  fake_count INTEGER NOT NULL DEFAULT 0,
  reliability_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  is_unreliable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- Public read/insert for predictions (no auth required for this demo)
CREATE POLICY "Anyone can view predictions" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can create predictions" ON public.predictions FOR INSERT WITH CHECK (true);

-- Public read for sources, insert/update via backend
CREATE POLICY "Anyone can view sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sources" ON public.sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sources" ON public.sources FOR UPDATE USING (true);
