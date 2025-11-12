-- Add new fields to profiles table for candidates and recruiters
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education text,
ADD COLUMN IF NOT EXISTS company_logo text,
ADD COLUMN IF NOT EXISTS salary_range text;

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;