-- Add read status to messages table
ALTER TABLE public.messages 
ADD COLUMN read BOOLEAN NOT NULL DEFAULT false;

-- Create index for better query performance
CREATE INDEX idx_messages_read ON public.messages(match_id, read);

-- Update RLS policy to allow users to mark messages as read
CREATE POLICY "Users can mark messages as read in their matches"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.recruiter_id = auth.uid() OR matches.job_seeker_id = auth.uid())
    AND messages.sender_id != auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.recruiter_id = auth.uid() OR matches.job_seeker_id = auth.uid())
    AND messages.sender_id != auth.uid()
  )
);