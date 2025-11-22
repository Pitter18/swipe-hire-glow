-- Create swipes table to track individual likes before mutual matches
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Enable RLS
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own swipes
CREATE POLICY "Users can insert their own swipes"
ON public.swipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = swiper_id);

-- Policy: Users can view swipes they're involved in (needed to check for mutual matches)
CREATE POLICY "Users can view their swipes"
ON public.swipes
FOR SELECT
TO authenticated
USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);