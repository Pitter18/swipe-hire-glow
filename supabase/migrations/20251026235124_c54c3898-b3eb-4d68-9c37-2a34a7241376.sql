-- Update the app_role enum to include job_seeker and recruiter roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'job_seeker';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'recruiter';