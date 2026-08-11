-- ============================================================
-- Mentora — Critical Fix: Exception-safe auth trigger
-- Paste this into Supabase SQL Editor and click Run.
-- ============================================================

-- ── Step 1: Fix passwordHash column default ──────────────────
ALTER TABLE public."User"
  ALTER COLUMN "passwordHash" SET DEFAULT 'managed-by-supabase-auth';

ALTER TABLE public."User"
  ALTER COLUMN "fullName" SET DEFAULT '';

-- ── Step 2: Replace trigger with exception-safe version ──────
-- The inner BEGIN...EXCEPTION block catches ANY error from the
-- User table insert so it never propagates to auth.users.
-- This guarantees auth signup always succeeds.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public."User" (
      "id",
      "email",
      "passwordHash",
      "fullName",
      "role",
      "grade"
    ) VALUES (
      NEW.id,
      NEW.email,
      'managed-by-supabase-auth',
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
      NEW.raw_user_meta_data->>'grade'
    )
    ON CONFLICT ("id") DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log but never fail — auth.users insert must always succeed
    RAISE WARNING '[Mentora] handle_new_auth_user failed: % %', SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── Step 3: Add INSERT policy so client-side code works too ──
-- If the trigger's insert failed, AuthContext.tsx will retry the
-- insert from the client. This policy allows that.
DROP POLICY IF EXISTS "user_insert_own" ON public."User";
CREATE POLICY "user_insert_own"
  ON public."User" FOR INSERT
  WITH CHECK (auth.uid() = "id");

-- ── Step 4: Delete the stuck user so they can re-register ────
DELETE FROM public."User"  WHERE "email" = 'nakaidze.davit1@students.gov.ge';
DELETE FROM auth.users     WHERE email   = 'nakaidze.davit1@students.gov.ge';

-- ── Step 5: Confirm the trigger is registered ────────────────
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ── Step 6: Promote to ADMIN (run AFTER you sign up successfully) ──
-- This sets the role to ADMIN for your personal account.
UPDATE public."User"
SET "role" = 'ADMIN'
WHERE "email" = 'nakaidze.davit1@students.gov.ge';

-- Verify:
SELECT "id", "email", "role", "fullName" FROM public."User"
WHERE "email" = 'nakaidze.davit1@students.gov.ge';
