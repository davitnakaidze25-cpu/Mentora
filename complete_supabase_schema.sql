-- ==============================================================================
-- Mentora — COMPLETE SUPABASE POSTGRES SCHEMA (Prisma Compatible)
-- This script safely drops existing tables (to clear bad data) and rebuilds
-- the EXACT schema expected by your Prisma backend and Supabase Auth.
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 0. CLEANUP: Drop existing tables and functions to start fresh
-- ──────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

DROP TABLE IF EXISTS public."Notification" CASCADE;
DROP TABLE IF EXISTS public."Message" CASCADE;
DROP TABLE IF EXISTS public."VerificationDocument" CASCADE;
DROP TABLE IF EXISTS public."Review" CASCADE;
DROP TABLE IF EXISTS public."Booking" CASCADE;
DROP TABLE IF EXISTS public."AvailabilitySlot" CASCADE;
DROP TABLE IF EXISTS public."TutorSubject" CASCADE;
DROP TABLE IF EXISTS public."Subject" CASCADE;
DROP TABLE IF EXISTS public."TutorProfile" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. UTILITIES
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. CREATE TABLES (Exact match to schema.prisma)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public."User" (
  "id"            text PRIMARY KEY,
  "email"         text UNIQUE NOT NULL,
  "passwordHash"  text NOT NULL DEFAULT 'managed-by-supabase-auth',
  "fullName"      text NOT NULL,
  "role"          text NOT NULL DEFAULT 'STUDENT',
  "avatarUrl"     text,
  "phoneNumber"   text,
  "grade"         text,
  "bio"           text,
  "createdAt"     timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_user_updated_at BEFORE UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public."TutorProfile" (
  "id"                 text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"             text UNIQUE NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "headline"           text NOT NULL,
  "bio"                text NOT NULL,
  "hourlyRate"         double precision NOT NULL,
  "institution"        text NOT NULL,
  "degree"             text NOT NULL,
  "graduationYear"     integer NOT NULL,
  "verificationStatus" text NOT NULL DEFAULT 'PENDING',
  "rating"             double precision NOT NULL DEFAULT 5.0,
  "reviewCount"        integer NOT NULL DEFAULT 0,
  "completedHours"     integer NOT NULL DEFAULT 0,
  "responseTimeMins"   integer NOT NULL DEFAULT 15,
  "featured"           boolean NOT NULL DEFAULT false,
  "videoUrl"           text,
  "createdAt"          timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public."Subject" (
  "id"          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        text UNIQUE NOT NULL,
  "category"    text NOT NULL,
  "icon"        text,
  "description" text
);


CREATE TABLE public."TutorSubject" (
  "id"             text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tutorProfileId" text NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "subjectId"      text NOT NULL REFERENCES public."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "level"          text NOT NULL DEFAULT 'UNDERGRADUATE',
  UNIQUE("tutorProfileId", "subjectId")
);


CREATE TABLE public."AvailabilitySlot" (
  "id"             text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tutorProfileId" text NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "dayOfWeek"      integer NOT NULL,
  "startTime"      text NOT NULL,
  "endTime"        text NOT NULL,
  "isBooked"       boolean NOT NULL DEFAULT false
);


CREATE TABLE public."Booking" (
  "id"             text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"      text NOT NULL REFERENCES public."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "tutorProfileId" text NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "subjectId"      text NOT NULL REFERENCES public."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "startTime"      timestamp(3) without time zone NOT NULL,
  "endTime"        timestamp(3) without time zone NOT NULL,
  "status"         text NOT NULL DEFAULT 'PENDING',
  "totalAmount"    double precision NOT NULL,
  "notes"          text,
  "meetingUrl"     text,
  "createdAt"      timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_booking_updated_at BEFORE UPDATE ON public."Booking" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public."Review" (
  "id"             text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId"      text UNIQUE NOT NULL REFERENCES public."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "authorId"       text NOT NULL REFERENCES public."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "tutorProfileId" text NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "rating"         integer NOT NULL,
  "comment"        text NOT NULL,
  "scoreImpact"    text,
  "createdAt"      timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public."VerificationDocument" (
  "id"             text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tutorProfileId" text NOT NULL REFERENCES public."TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "docType"        text NOT NULL,
  "fileUrl"        text NOT NULL,
  "status"         text NOT NULL DEFAULT 'PENDING',
  "createdAt"      timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public."Message" (
  "id"          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "senderId"    text NOT NULL REFERENCES public."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "receiverId"  text NOT NULL REFERENCES public."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "bookingId"   text REFERENCES public."Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "content"     text NOT NULL,
  "isRead"      boolean NOT NULL DEFAULT false,
  "createdAt"   timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public."Notification" (
  "id"        text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    text NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "message"   text NOT NULL,
  "isRead"    boolean NOT NULL DEFAULT false,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. AUTH TRIGGER (Creates User row automatically on signup)
-- ──────────────────────────────────────────────────────────────────────────────
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
      NEW.id::text,
      NEW.email,
      'managed-by-supabase-auth',
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
      NEW.raw_user_meta_data->>'grade'
    )
    ON CONFLICT ("id") DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[Mentora] handle_new_auth_user failed: % %', SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TutorProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users are viewable by everyone" ON public."User" FOR SELECT USING (true);
CREATE POLICY "Public tutor profiles are viewable by everyone" ON public."TutorProfile" FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public."User" FOR INSERT WITH CHECK (auth.uid()::text = "id");
CREATE POLICY "Users can update their own profile" ON public."User" FOR UPDATE USING (auth.uid()::text = "id");

CREATE POLICY "Tutors can insert their own profile" ON public."TutorProfile" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Tutors can update their own profile" ON public."TutorProfile" FOR UPDATE USING (auth.uid()::text = "userId");

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. ADMIN PROMOTION
-- ──────────────────────────────────────────────────────────────────────────────
UPDATE public."User"
SET "role" = 'ADMIN'
WHERE "email" = 'nakaidze.davit1@students.gov.ge';
