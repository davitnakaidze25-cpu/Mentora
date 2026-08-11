-- ============================================================
-- Mentora — Supabase PostgreSQL Migration (idempotent)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / IF EXISTS
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. Helper: auto-update "updatedAt" on any table that has it
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 1. Create Tables (IF NOT EXISTS — safe to re-run)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public."User" (
  "id"           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email"        text UNIQUE NOT NULL,
  "passwordHash" text NOT NULL DEFAULT 'managed-by-supabase-auth',
  "fullName"     text NOT NULL,
  "role"         text NOT NULL DEFAULT 'STUDENT'
                   CHECK ("role" IN ('STUDENT', 'TUTOR', 'PARENT', 'ADMIN')),
  "avatarUrl"    text,
  "phoneNumber"  text,
  "grade"        text,
  "bio"          text,
  "createdAt"    timestamptz NOT NULL DEFAULT now(),
  "updatedAt"    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_updated_at ON public."User";
CREATE TRIGGER trg_user_updated_at
  BEFORE UPDATE ON public."User"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE IF NOT EXISTS public."TutorProfile" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"             uuid UNIQUE NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "headline"           text NOT NULL DEFAULT '',
  "bio"                text NOT NULL DEFAULT '',
  "hourlyRate"         numeric NOT NULL DEFAULT 15,
  "institution"        text NOT NULL DEFAULT '',
  "institutionLogo"    text,
  "degree"             text NOT NULL DEFAULT '',
  "graduationYear"     integer NOT NULL DEFAULT 2028,
  "verificationStatus" text NOT NULL DEFAULT 'PENDING'
                         CHECK ("verificationStatus" IN ('PENDING', 'VERIFIED', 'REJECTED')),
  "rating"             numeric NOT NULL DEFAULT 5.0,
  "reviewCount"        integer NOT NULL DEFAULT 0,
  "completedHours"     integer NOT NULL DEFAULT 0,
  "responseTimeMins"   integer NOT NULL DEFAULT 15,
  "featured"           boolean NOT NULL DEFAULT false,
  "videoUrl"           text,
  "subjects"           text[] NOT NULL DEFAULT '{}',
  "createdAt"          timestamptz NOT NULL DEFAULT now(),
  "updatedAt"          timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_tutor_profile_updated_at ON public."TutorProfile";
CREATE TRIGGER trg_tutor_profile_updated_at
  BEFORE UPDATE ON public."TutorProfile"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add missing columns to TutorProfile if the old migration already ran
ALTER TABLE public."TutorProfile" ADD COLUMN IF NOT EXISTS "institutionLogo" text;
ALTER TABLE public."TutorProfile" ADD COLUMN IF NOT EXISTS "subjects" text[] NOT NULL DEFAULT '{}';


CREATE TABLE IF NOT EXISTS public."Subject" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"         text UNIQUE NOT NULL,
  "category"     text NOT NULL,
  "icon"         text,
  "description"  text,
  "popularCount" integer NOT NULL DEFAULT 0
);

ALTER TABLE public."Subject" ADD COLUMN IF NOT EXISTS "popularCount" integer NOT NULL DEFAULT 0;


CREATE TABLE IF NOT EXISTS public."TutorSubject" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tutorProfileId" uuid NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE CASCADE,
  "subjectId"      uuid NOT NULL REFERENCES public."Subject"("id") ON DELETE CASCADE,
  "level"          text NOT NULL DEFAULT 'SCHOOL',
  UNIQUE("tutorProfileId", "subjectId")
);


CREATE TABLE IF NOT EXISTS public."AvailabilitySlot" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tutorProfileId" uuid NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE CASCADE,
  "dayOfWeek"      integer NOT NULL CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  "startTime"      text NOT NULL,
  "endTime"        text NOT NULL,
  "isBooked"       boolean NOT NULL DEFAULT false
);


CREATE TABLE IF NOT EXISTS public."Booking" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId"      uuid NOT NULL REFERENCES public."User"("id"),
  "tutorProfileId" uuid NOT NULL REFERENCES public."TutorProfile"("id"),
  "subjectId"      uuid REFERENCES public."Subject"("id"),
  "startTime"      timestamptz NOT NULL,
  "endTime"        timestamptz NOT NULL,
  "status"         text NOT NULL DEFAULT 'PENDING'
                     CHECK ("status" IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','DECLINED')),
  "totalAmount"    numeric NOT NULL,
  "notes"          text,
  "meetingLink"    text,
  "createdAt"      timestamptz NOT NULL DEFAULT now(),
  "updatedAt"      timestamptz NOT NULL DEFAULT now()
);

-- Rename meetingUrl → meetingLink if old migration created it as meetingUrl
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'meetingUrl'
  ) THEN
    ALTER TABLE public."Booking" RENAME COLUMN "meetingUrl" TO "meetingLink";
  END IF;
END;
$$;

ALTER TABLE public."Booking" ADD COLUMN IF NOT EXISTS "meetingLink" text;

DROP TRIGGER IF EXISTS trg_booking_updated_at ON public."Booking";
CREATE TRIGGER trg_booking_updated_at
  BEFORE UPDATE ON public."Booking"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE IF NOT EXISTS public."Review" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId"      uuid UNIQUE REFERENCES public."Booking"("id") ON DELETE CASCADE,
  "authorId"       uuid NOT NULL REFERENCES public."User"("id"),
  "tutorProfileId" uuid NOT NULL REFERENCES public."TutorProfile"("id"),
  "rating"         integer NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "comment"        text NOT NULL,
  "scoreImpact"    text,
  "createdAt"      timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS public."VerificationDocument" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tutorProfileId" uuid NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE CASCADE,
  "docType"        text NOT NULL,
  "fileUrl"        text NOT NULL,
  "status"         text NOT NULL DEFAULT 'PENDING'
                     CHECK ("status" IN ('PENDING','APPROVED','REJECTED')),
  "createdAt"      timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS public."Message" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "senderId"   uuid NOT NULL REFERENCES public."User"("id"),
  "receiverId" uuid NOT NULL REFERENCES public."User"("id"),
  "bookingId"  uuid REFERENCES public."Booking"("id"),
  "content"    text NOT NULL,
  "isRead"     boolean NOT NULL DEFAULT false,
  "createdAt"  timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS public."Notification" (
  "id"        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    uuid NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "message"   text NOT NULL,
  "isRead"    boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 2. Auth Trigger — auto-create "User" row on signup
--    SECURITY DEFINER bypasses RLS so new users can have
--    their profile row created before their first request.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public."User" ("id", "email", "fullName", "role", "grade")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    NEW.raw_user_meta_data->>'grade'
  )
  ON CONFLICT ("id") DO NOTHING;  -- idempotent: safe on email-confirm events too
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ────────────────────────────────────────────────────────────
-- 3. Enable Row Level Security
-- ────────────────────────────────────────────────────────────
ALTER TABLE public."User"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TutorProfile"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subject"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TutorSubject"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AvailabilitySlot"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Review"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification"         ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- 4. RLS Policies (drop-and-recreate = idempotent)
-- ────────────────────────────────────────────────────────────

-- ── User ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "user_select_own"   ON public."User";
DROP POLICY IF EXISTS "user_update_own"   ON public."User";

CREATE POLICY "user_select_own"
  ON public."User" FOR SELECT
  USING (auth.uid() = "id");

-- INSERT is intentionally omitted: the auth trigger handles it.
-- If you need emergency client-side inserts (e.g. during testing),
-- uncomment the line below temporarily:
-- CREATE POLICY "user_insert_own" ON public."User" FOR INSERT WITH CHECK (auth.uid() = "id");

CREATE POLICY "user_update_own"
  ON public."User" FOR UPDATE
  USING (auth.uid() = "id")
  WITH CHECK (auth.uid() = "id");


-- ── TutorProfile ──────────────────────────────────────────
DROP POLICY IF EXISTS "tutor_profile_select_public" ON public."TutorProfile";
DROP POLICY IF EXISTS "tutor_profile_insert_own"    ON public."TutorProfile";
DROP POLICY IF EXISTS "tutor_profile_update_own"    ON public."TutorProfile";

CREATE POLICY "tutor_profile_select_public"
  ON public."TutorProfile" FOR SELECT
  USING (true);

CREATE POLICY "tutor_profile_insert_own"
  ON public."TutorProfile" FOR INSERT
  WITH CHECK ("userId" = auth.uid());

CREATE POLICY "tutor_profile_update_own"
  ON public."TutorProfile" FOR UPDATE
  USING ("userId" = auth.uid())
  WITH CHECK ("userId" = auth.uid());


-- ── Subject ───────────────────────────────────────────────
DROP POLICY IF EXISTS "subject_select_public" ON public."Subject";
CREATE POLICY "subject_select_public"
  ON public."Subject" FOR SELECT
  USING (true);


-- ── TutorSubject ──────────────────────────────────────────
DROP POLICY IF EXISTS "tutor_subject_select_public" ON public."TutorSubject";
DROP POLICY IF EXISTS "tutor_subject_insert_own"    ON public."TutorSubject";
DROP POLICY IF EXISTS "tutor_subject_delete_own"    ON public."TutorSubject";

CREATE POLICY "tutor_subject_select_public"
  ON public."TutorSubject" FOR SELECT
  USING (true);

CREATE POLICY "tutor_subject_insert_own"
  ON public."TutorSubject" FOR INSERT
  WITH CHECK (
    "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );

CREATE POLICY "tutor_subject_delete_own"
  ON public."TutorSubject" FOR DELETE
  USING (
    "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );


-- ── AvailabilitySlot ─────────────────────────────────────
DROP POLICY IF EXISTS "slot_select_public" ON public."AvailabilitySlot";
DROP POLICY IF EXISTS "slot_insert_own"    ON public."AvailabilitySlot";
DROP POLICY IF EXISTS "slot_update_own"    ON public."AvailabilitySlot";
DROP POLICY IF EXISTS "slot_delete_own"    ON public."AvailabilitySlot";

CREATE POLICY "slot_select_public"
  ON public."AvailabilitySlot" FOR SELECT
  USING (true);

CREATE POLICY "slot_insert_own"
  ON public."AvailabilitySlot" FOR INSERT
  WITH CHECK (
    "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );

CREATE POLICY "slot_update_own"
  ON public."AvailabilitySlot" FOR UPDATE
  USING (
    "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );

CREATE POLICY "slot_delete_own"
  ON public."AvailabilitySlot" FOR DELETE
  USING (
    "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );


-- ── Booking ───────────────────────────────────────────────
DROP POLICY IF EXISTS "booking_select_participants" ON public."Booking";
DROP POLICY IF EXISTS "booking_insert_student"      ON public."Booking";
DROP POLICY IF EXISTS "booking_update_participants" ON public."Booking";

CREATE POLICY "booking_select_participants"
  ON public."Booking" FOR SELECT
  USING (
    "studentId" = auth.uid()
    OR "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );

CREATE POLICY "booking_insert_student"
  ON public."Booking" FOR INSERT
  WITH CHECK ("studentId" = auth.uid());

CREATE POLICY "booking_update_participants"
  ON public."Booking" FOR UPDATE
  USING (
    "studentId" = auth.uid()
    OR "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );


-- ── Review ────────────────────────────────────────────────
DROP POLICY IF EXISTS "review_select_public"  ON public."Review";
DROP POLICY IF EXISTS "review_insert_student" ON public."Review";

CREATE POLICY "review_select_public"
  ON public."Review" FOR SELECT
  USING (true);

CREATE POLICY "review_insert_student"
  ON public."Review" FOR INSERT
  WITH CHECK (
    "authorId" = auth.uid()
    AND "bookingId" IN (SELECT "id" FROM public."Booking" WHERE "studentId" = auth.uid())
  );


-- ── VerificationDocument ──────────────────────────────────
DROP POLICY IF EXISTS "verdoc_select_own_tutor" ON public."VerificationDocument";
DROP POLICY IF EXISTS "verdoc_insert_own_tutor" ON public."VerificationDocument";

CREATE POLICY "verdoc_select_own_tutor"
  ON public."VerificationDocument" FOR SELECT
  USING (
    "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );

CREATE POLICY "verdoc_insert_own_tutor"
  ON public."VerificationDocument" FOR INSERT
  WITH CHECK (
    "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
  );


-- ── Message ───────────────────────────────────────────────
DROP POLICY IF EXISTS "message_select_participants" ON public."Message";
DROP POLICY IF EXISTS "message_insert_sender"       ON public."Message";
DROP POLICY IF EXISTS "message_update_receiver"     ON public."Message";

CREATE POLICY "message_select_participants"
  ON public."Message" FOR SELECT
  USING ("senderId" = auth.uid() OR "receiverId" = auth.uid());

CREATE POLICY "message_insert_sender"
  ON public."Message" FOR INSERT
  WITH CHECK ("senderId" = auth.uid());

CREATE POLICY "message_update_receiver"
  ON public."Message" FOR UPDATE
  USING ("receiverId" = auth.uid());


-- ── Notification ──────────────────────────────────────────
DROP POLICY IF EXISTS "notification_select_own" ON public."Notification";
DROP POLICY IF EXISTS "notification_update_own" ON public."Notification";

CREATE POLICY "notification_select_own"
  ON public."Notification" FOR SELECT
  USING ("userId" = auth.uid());

CREATE POLICY "notification_update_own"
  ON public."Notification" FOR UPDATE
  USING ("userId" = auth.uid());
