-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create new policy allowing all authenticated users to view all roles
CREATE POLICY "Authenticated users can view all roles"
ON user_roles
FOR SELECT
TO authenticated
USING (true);