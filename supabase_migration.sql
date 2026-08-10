-- Supabase PostgreSQL Migration Script for Mentora
-- Translates the current Prisma schema into Postgres DDL with Row Level Security (RLS)

-- 1. Create Tables

CREATE TABLE public."User" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "email" text UNIQUE NOT NULL,
  "passwordHash" text NOT NULL,
  "fullName" text NOT NULL,
  "role" text DEFAULT 'STUDENT',
  "avatarUrl" text,
  "phoneNumber" text,
  "grade" text,
  "bio" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."TutorProfile" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid UNIQUE REFERENCES public."User"("id") ON DELETE CASCADE,
  "headline" text NOT NULL,
  "bio" text NOT NULL,
  "hourlyRate" numeric NOT NULL,
  "institution" text NOT NULL,
  "degree" text NOT NULL,
  "graduationYear" integer NOT NULL,
  "verificationStatus" text DEFAULT 'PENDING',
  "rating" numeric DEFAULT 5.0,
  "reviewCount" integer DEFAULT 0,
  "completedHours" integer DEFAULT 0,
  "responseTimeMins" integer DEFAULT 15,
  "featured" boolean DEFAULT false,
  "videoUrl" text,
  "createdAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."Subject" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text UNIQUE NOT NULL,
  "category" text NOT NULL,
  "icon" text,
  "description" text
);

CREATE TABLE public."TutorSubject" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tutorProfileId" uuid REFERENCES public."TutorProfile"("id") ON DELETE CASCADE,
  "subjectId" uuid REFERENCES public."Subject"("id") ON DELETE CASCADE,
  "level" text DEFAULT 'UNDERGRADUATE',
  UNIQUE("tutorProfileId", "subjectId")
);

CREATE TABLE public."AvailabilitySlot" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tutorProfileId" uuid REFERENCES public."TutorProfile"("id") ON DELETE CASCADE,
  "dayOfWeek" integer NOT NULL,
  "startTime" text NOT NULL,
  "endTime" text NOT NULL,
  "isBooked" boolean DEFAULT false
);

CREATE TABLE public."Booking" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "studentId" uuid REFERENCES public."User"("id"),
  "tutorProfileId" uuid REFERENCES public."TutorProfile"("id"),
  "subjectId" uuid REFERENCES public."Subject"("id"),
  "startTime" timestamp with time zone NOT NULL,
  "endTime" timestamp with time zone NOT NULL,
  "status" text DEFAULT 'PENDING',
  "totalAmount" numeric NOT NULL,
  "notes" text,
  "meetingUrl" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."Review" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "bookingId" uuid UNIQUE REFERENCES public."Booking"("id") ON DELETE CASCADE,
  "authorId" uuid REFERENCES public."User"("id"),
  "tutorProfileId" uuid REFERENCES public."TutorProfile"("id"),
  "rating" integer NOT NULL,
  "comment" text NOT NULL,
  "scoreImpact" text,
  "createdAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."VerificationDocument" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "tutorProfileId" uuid REFERENCES public."TutorProfile"("id") ON DELETE CASCADE,
  "docType" text NOT NULL,
  "fileUrl" text NOT NULL,
  "status" text DEFAULT 'PENDING',
  "createdAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."Message" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "senderId" uuid REFERENCES public."User"("id"),
  "receiverId" uuid REFERENCES public."User"("id"),
  "bookingId" uuid REFERENCES public."Booking"("id"),
  "content" text NOT NULL,
  "isRead" boolean DEFAULT false,
  "createdAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."Notification" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid REFERENCES public."User"("id") ON DELETE CASCADE,
  "message" text NOT NULL,
  "isRead" boolean DEFAULT false,
  "createdAt" timestamp with time zone DEFAULT now()
);


-- 2. Enable Row Level Security (RLS)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TutorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TutorSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AvailabilitySlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;


-- 3. Define RLS Policies

-- User: Users can only read and update their own data.
CREATE POLICY "Users can view own data" ON public."User" FOR SELECT USING (auth.uid() = "id");
CREATE POLICY "Users can update own data" ON public."User" FOR UPDATE USING (auth.uid() = "id");

-- TutorProfile: Publicly readable. Tutors can update their own profile.
CREATE POLICY "TutorProfiles are public" ON public."TutorProfile" FOR SELECT USING (true);
CREATE POLICY "Tutors can update own profile" ON public."TutorProfile" FOR UPDATE USING ("userId" = auth.uid());

-- Subject: Publicly readable.
CREATE POLICY "Subjects are public" ON public."Subject" FOR SELECT USING (true);

-- TutorSubject: Publicly readable.
CREATE POLICY "TutorSubjects are public" ON public."TutorSubject" FOR SELECT USING (true);

-- AvailabilitySlot: Publicly readable.
CREATE POLICY "Slots are public" ON public."AvailabilitySlot" FOR SELECT USING (true);

-- Booking: Visible only to the student and the tutor involved.
CREATE POLICY "Participants can view their bookings" ON public."Booking" FOR SELECT USING (
  "studentId" = auth.uid() OR 
  "tutorProfileId" IN (SELECT "id" FROM public."TutorProfile" WHERE "userId" = auth.uid())
);

-- Review: Publicly readable.
CREATE POLICY "Reviews are public" ON public."Review" FOR SELECT USING (true);

-- Message: Visible to sender and receiver.
CREATE POLICY "Users can view their messages" ON public."Message" FOR SELECT USING (
  "senderId" = auth.uid() OR "receiverId" = auth.uid()
);
CREATE POLICY "Users can send messages" ON public."Message" FOR INSERT WITH CHECK (
  "senderId" = auth.uid()
);

-- Notification: Private to the user.
CREATE POLICY "Users can view their notifications" ON public."Notification" FOR SELECT USING (
  "userId" = auth.uid()
);
