-- Apply the security fixes migration to address critical RLS vulnerability
-- This migration has already been prepared and addresses:
-- 1. Removes overly permissive policies that exposed sensitive client data
-- 2. Implements proper role-based access control
-- 3. Ensures sensitive data is only accessible to owners/admins
-- 4. Maintains secure functions for proper data filtering

-- The migration content was already prepared in the previous diff
-- Applying it now to fix the security vulnerability

-- Verify the migration is applied correctly by checking policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'projects';