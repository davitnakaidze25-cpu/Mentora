import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: generate a Google Meet-style placeholder link
function generateMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const seg = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${seg()}-${seg()}-${seg()}`;
}

// Helper: create a notification
async function createNotification(userId: string, message: string) {
  return prisma.notification.create({ data: { userId, message } });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Seed core subjects so they always exist
  for (const [name, category] of [['Math', 'STEM'], ['Physics', 'STEM'], ['STEM', 'STEM']] as const) {
    await prisma.subject.upsert({ where: { name }, create: { name, category }, update: {} });
  }

  // --- Auth Routes ------------------------------------------------------------
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, fullName, role, grade } = req.body as {
        email: string;
        password: string;
        fullName: string;
        role: 'STUDENT' | 'TUTOR' | 'PARENT' | 'ADMIN';
        grade?: string;
      };

      if (!email || !password || !fullName || !role) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
      }

      if (role === 'STUDENT' && !grade) {
        return res.status(400).json({ success: false, error: 'Grade is required for students.' });
      }

      if (role === 'TUTOR' && !email.toLowerCase().endsWith('@students.gov.ge')) {
        return res.status(400).json({ success: false, error: 'Tutors must register with a @students.gov.ge institutional email address.' });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: role ?? 'STUDENT',
          grade,
          avatarUrl: '/guest-avatar.png'
        }
      });

      if (role === 'TUTOR') {
        await prisma.tutorProfile.create({
          data: {
            userId: user.id,
            headline: 'Komarovi Mentor',
            bio: '',
            hourlyRate: 25,
            institution: 'Komarovi School N199',
            degree: 'Student',
            graduationYear: 2026,
          },
        });
      }

      res.status(201).json({ success: true, data: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      res.json({ success: true, data: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/auth/users/:id', async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          tutorProfile: {
            include: {
              user: true,
              subjects: { include: { subject: true } },
              availabilitySlots: true,
              reviewsReceived: { include: { author: true } },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/auth/users/:id', async (req, res) => {
    try {
      const { fullName, avatarUrl, bio, grade } = req.body as { fullName?: string; avatarUrl?: string; bio?: string; grade?: string };
      const updates: any = {};
      if (fullName) updates.fullName = fullName;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      if (bio !== undefined) updates.bio = bio;
      if (grade !== undefined) updates.grade = grade;

      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, error: 'No valid profile updates were provided.' });
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: updates,
      });

      res.json({ success: true, data: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- API Routes --------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', system: 'Mentora Academic Backend', timestamp: new Date().toISOString() });
  });

  // --- Tutor Routes ---
  const mapTutor = (t: any) => ({
    id: t.id,
    fullName: t.user?.fullName || 'Komarovi Mentor',
    title: t.headline,
    avatarUrl: t.user?.avatarUrl || '',
    institution: t.institution,
    degree: t.degree,
    graduationYear: t.graduationYear,
    verified: t.verificationStatus === 'VERIFIED',
    verificationStatus: t.verificationStatus,
    featured: t.featured,
    hourlyRate: t.hourlyRate,
    rating: t.rating,
    reviewCount: t.reviewCount,
    completedHours: t.completedHours,
    responseTimeMins: t.responseTimeMins,
    bio: t.bio,
    teachingApproach: 'First-principles problem solving.',
    subjects: t.subjects.map((ts: any) => ts.subject.name),
    levels: t.subjects.map((ts: any) => ts.level),
    achievements: [],
    availabilitySlots: t.availabilitySlots.map((s: any) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][s.dayOfWeek],
      time: s.startTime,
      isBooked: s.isBooked,
    })),
    reviews: t.reviewsReceived.map((r: any) => ({
      id: r.id,
      authorName: r.author.fullName,
      authorRole: r.author.role,
      rating: r.rating,
      date: r.createdAt.toISOString().split('T')[0],
      comment: r.comment,
      subjectName: 'Physics/Math',
      scoreImpact: r.scoreImpact || '',
    })),
  });

  app.get('/api/tutor-profile/user/:userId', async (req, res) => {
    try {
      const tutor = await prisma.tutorProfile.findUnique({
        where: { userId: req.params.userId },
        include: {
          user: true,
          subjects: { include: { subject: true } },
          availabilitySlots: true,
          reviewsReceived: { include: { author: true } },
        },
      });

      if (!tutor) {
        return res.status(404).json({ success: false, error: 'Tutor profile not found.' });
      }

      res.json({ success: true, data: mapTutor(tutor) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/tutors', async (req, res) => {
    try {
      const { query, subject, level, minPrice, maxPrice, minRating, institution, sortBy, status } = req.query;

      let prismaTutors = await prisma.tutorProfile.findMany({
        include: {
          user: true,
          subjects: { include: { subject: true } },
          availabilitySlots: true,
          reviewsReceived: { include: { author: true } },
        },
      });

      if (status && typeof status === 'string' && status !== 'All') {
        prismaTutors = prismaTutors.filter((t) => t.verificationStatus === status);
      } else {
        prismaTutors = prismaTutors.filter((t) => t.verificationStatus === 'VERIFIED');
      }

      let results = prismaTutors.map(mapTutor);

      if (query && typeof query === 'string' && query.trim() !== '') {
        const q = query.toLowerCase();
        results = results.filter(
          (t) =>
            t.fullName.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            t.institution.toLowerCase().includes(q) ||
            t.bio.toLowerCase().includes(q) ||
            t.subjects.some((s: string) => s.toLowerCase().includes(q))
        );
      }

      if (subject && typeof subject === 'string' && subject !== 'All') {
        results = results.filter((t) => t.subjects.includes(subject));
      }

      if (level && typeof level === 'string' && level !== 'All') {
        results = results.filter((t) => t.levels.includes(level as any));
      }

      if (minPrice) results = results.filter((t) => t.hourlyRate >= Number(minPrice));
      if (maxPrice) results = results.filter((t) => t.hourlyRate <= Number(maxPrice));
      if (minRating) results = results.filter((t) => t.rating >= Number(minRating));

      if (institution && typeof institution === 'string' && institution !== 'All') {
        results = results.filter((t) => t.institution.toLowerCase().includes(institution.toLowerCase()));
      }

      if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
      else if (sortBy === 'price_asc') results.sort((a, b) => a.hourlyRate - b.hourlyRate);
      else if (sortBy === 'price_desc') results.sort((a, b) => b.hourlyRate - a.hourlyRate);
      else if (sortBy === 'hours') results.sort((a, b) => b.completedHours - a.completedHours);

      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/tutors/:id', async (req, res) => {
    try {
      const tutor = await prisma.tutorProfile.findUnique({
        where: { id: req.params.id },
        include: {
          subjects: { include: { subject: true } },
          availabilitySlots: true,
          reviewsReceived: { include: { author: true } },
          user: true,
        },
      });

      if (!tutor) {
        return res.status(404).json({ success: false, error: 'Tutor not found' });
      }

      res.json({ success: true, data: mapTutor(tutor) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/tutors/:id', async (req, res) => {
    try {
      const { verificationStatus, headline, bio, hourlyRate, institution, degree, graduationYear, subjects } = req.body as {
        verificationStatus?: string;
        headline?: string;
        bio?: string;
        hourlyRate?: number;
        institution?: string;
        degree?: string;
        graduationYear?: number;
        subjects?: string[];
      };
      const { id } = req.params;

      const updates: any = {};
      if (verificationStatus !== undefined) updates.verificationStatus = verificationStatus;
      if (headline !== undefined) updates.headline = headline;
      if (bio !== undefined) updates.bio = bio;
      if (hourlyRate !== undefined) updates.hourlyRate = Number(hourlyRate);
      if (institution !== undefined) updates.institution = institution;
      if (degree !== undefined) updates.degree = degree;
      if (graduationYear !== undefined) updates.graduationYear = graduationYear;

      // Run scalar updates first — independent of subjects
      if (Object.keys(updates).length > 0) {
        await prisma.tutorProfile.update({ where: { id }, data: updates });
      }

      // Update subjects separately so a failure here doesn't block scalar saves
      if (subjects && Array.isArray(subjects)) {
        await prisma.tutorSubject.deleteMany({ where: { tutorProfileId: id } });

        for (const subName of subjects) {
          let subjectObj = await prisma.subject.findUnique({ where: { name: subName } });
          if (!subjectObj) {
            subjectObj = await prisma.subject.create({ data: { name: subName, category: 'STEM' } });
          }
          await prisma.tutorSubject.create({
            data: { tutorProfileId: id, subjectId: subjectObj.id },
          });
        }
      }

      const updatedTutor = await prisma.tutorProfile.findUnique({
        where: { id },
        include: {
          user: true,
          subjects: { include: { subject: true } },
          availabilitySlots: true,
          reviewsReceived: { include: { author: true } },
        },
      });

      if (!updatedTutor) return res.status(404).json({ success: false, error: 'Tutor profile not found.' });

      res.json({
        success: true,
        data: mapTutor(updatedTutor),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await prisma.subject.findMany();
      res.json({ success: true, data: subjects });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Booking Routes ---
  const mapBooking = (b: any) => ({
    id: b.id,
    tutorId: b.tutorProfileId,
    tutorName: b.tutorProfile?.user?.fullName || 'Tutor',
    tutorAvatar: b.tutorProfile?.user?.avatarUrl || '',
    tutorInstitution: b.tutorProfile?.institution || 'Komarovi',
    subjectName: b.subject?.name || 'Subject',
    date: b.startTime instanceof Date ? b.startTime.toISOString() : b.startTime,
    timeSlot: b.timeSlot || 'Time negotiable via chat',
    durationMins: 60,
    status: b.status,
    totalPrice: b.totalAmount,
    studentId: b.studentId,
    studentName: b.student?.fullName || 'Student',
    studentNotes: b.notes,
    meetingLink: b.meetingUrl,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
  });

  app.get('/api/bookings', async (req, res) => {
    try {
      const { studentId, tutorProfileId } = req.query;
      const where: any = {};
      if (studentId) where.studentId = studentId;
      if (tutorProfileId) where.tutorProfileId = tutorProfileId;

      const bookings = await prisma.booking.findMany({
        where,
        include: { tutorProfile: { include: { user: true } }, subject: true, student: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: bookings.map(mapBooking) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const { tutorId, subjectName, date, timeSlot, studentId, studentName, studentNotes, totalPrice } = req.body;

      // Use studentId from body — do NOT create ghost users by name lookup
      let user = studentId
        ? await prisma.user.findUnique({ where: { id: studentId } })
        : null;

      if (!user) {
        // Fallback: find by name (legacy path, only if no studentId provided)
        user = await prisma.user.findFirst({ where: { fullName: studentName } });
      }

      if (!user) {
        return res.status(400).json({ success: false, error: 'Student user not found. Please log in.' });
      }

      let subject = await prisma.subject.findUnique({ where: { name: subjectName } });
      if (!subject) {
        subject = await prisma.subject.create({ data: { name: subjectName || 'Physics', category: 'STEM' } });
      }

      const tutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId }, include: { user: true } });
      if (!tutor) {
        return res.status(404).json({ success: false, error: 'Tutor not found' });
      }

      const startTime = date ? new Date(date) : new Date();
      const endTime = new Date(startTime.getTime() + 3600000);

      const booking = await prisma.booking.create({
        data: {
          studentId: user.id,
          tutorProfileId: tutor.id,
          subjectId: subject.id,
          startTime,
          endTime,
          totalAmount: totalPrice || tutor.hourlyRate || 0,
          notes: studentNotes || '',
          // No meetingUrl yet — generated only when mentor accepts
        },
        include: { tutorProfile: { include: { user: true } }, subject: true, student: true },
      });

      // Notification for the Mentor
      await createNotification(
        tutor.userId,
        `📚 New booking request from ${user.fullName} for ${subjectName}.`
      );

      res.status(201).json({ success: true, data: mapBooking(booking) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/bookings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updateData: any = { status };

      // Generate meet link when mentor accepts
      if (status === 'CONFIRMED') {
        updateData.meetingUrl = generateMeetLink();
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: updateData,
        include: { tutorProfile: { include: { user: true } }, student: true, subject: true },
      });

      // Notify student on accept or decline
      if (status === 'CONFIRMED') {
        await createNotification(
          booking.studentId,
          `✅ ${booking.tutorProfile.user.fullName} accepted your booking for ${booking.subject?.name || 'your session'}! A meeting link has been generated.`
        );
      } else if (status === 'DECLINED' || status === 'CANCELLED') {
        await createNotification(
          booking.studentId,
          `❌ ${booking.tutorProfile.user.fullName} declined your booking request for ${booking.subject?.name || 'your session'}.`
        );
      } else if (status === 'COMPLETED') {
        await createNotification(
          booking.studentId,
          `🎓 Your session with ${booking.tutorProfile.user.fullName} has been marked as completed. You can now leave a review!`
        );
      }

      res.json({ success: true, data: mapBooking(booking) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Review Routes ---
  app.get('/api/reviews/eligibility/:studentId/:tutorProfileId', async (req, res) => {
    try {
      const { studentId, tutorProfileId } = req.params;

      // Find a COMPLETED booking between this student and tutor without an existing review
      const booking = await prisma.booking.findFirst({
        where: {
          studentId,
          tutorProfileId,
          status: 'COMPLETED',
          review: null,
        },
      });

      res.json({ success: true, data: { canReview: !!booking, bookingId: booking?.id || null } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const { bookingId, authorId, tutorProfileId, rating, comment } = req.body as {
        bookingId: string;
        authorId: string;
        tutorProfileId: string;
        rating: number;
        comment: string;
      };

      if (!bookingId || !authorId || !tutorProfileId || !rating || !comment) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5.' });
      }

      // Verify booking is COMPLETED and belongs to this student
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, studentId: authorId, tutorProfileId, status: 'COMPLETED' },
        include: { student: true },
      });

      if (!booking) {
        return res.status(403).json({ success: false, error: 'You can only review completed sessions.' });
      }

      // Check for existing review (unique constraint will also enforce this)
      const existing = await prisma.review.findUnique({ where: { bookingId } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'You have already reviewed this session.' });
      }

      const review = await prisma.review.create({
        data: { bookingId, authorId, tutorProfileId, rating, comment },
        include: { author: true },
      });

      // Update tutor's average rating and review count
      const allReviews = await prisma.review.findMany({ where: { tutorProfileId } });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await prisma.tutorProfile.update({
        where: { id: tutorProfileId },
        data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length },
      });

      // Get tutor userId for notification
      const tutor = await prisma.tutorProfile.findUnique({ where: { id: tutorProfileId } });
      if (tutor) {
        await createNotification(
          tutor.userId,
          `⭐ ${booking.student.fullName} left you a ${rating}-star review!`
        );
      }

      res.status(201).json({ success: true, data: review });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Notification Routes ---
  app.get('/api/notifications/:userId', async (req, res) => {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.params.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: notifications });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
      const notification = await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true },
      });
      res.json({ success: true, data: notification });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/notifications/read-all/:userId', async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.params.userId, isRead: false },
        data: { isRead: true },
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Global Messenger Routes ---

  // GET all conversations for a user (grouped by other party)
  app.get('/api/messages/conversations/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Get all messages involving this user
      const messages = await prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        include: { sender: true, receiver: true },
        orderBy: { createdAt: 'desc' },
      });

      // Group by the other party
      const convMap = new Map<string, any>();
      for (const msg of messages) {
        const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            otherUserId: otherId,
            otherUserName: otherUser.fullName,
            otherUserAvatar: otherUser.avatarUrl || '',
            bookingId: msg.bookingId,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            unreadCount: 0,
          });
        }
        // Count unread messages sent TO this user
        if (msg.receiverId === userId && !msg.isRead) {
          convMap.get(otherId).unreadCount += 1;
        }
      }

      res.json({ success: true, data: Array.from(convMap.values()) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET messages between two users
  app.get('/api/messages/:userId/:otherUserId', async (req, res) => {
    try {
      const { userId, otherUserId } = req.params;
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      });

      // Mark incoming messages as read
      await prisma.message.updateMany({
        where: { senderId: otherUserId, receiverId: userId, isRead: false },
        data: { isRead: true },
      });

      res.json({ success: true, data: messages });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST a new message (global messenger)
  app.post('/api/messages', async (req, res) => {
    try {
      const { senderId, receiverId, content, bookingId } = req.body;

      if (!senderId || !receiverId || !content) {
        return res.status(400).json({ success: false, error: 'senderId, receiverId, and content are required.' });
      }

      const sender = await prisma.user.findUnique({ where: { id: senderId } });
      if (!sender) return res.status(404).json({ success: false, error: 'Sender not found.' });

      const message = await prisma.message.create({
        data: { senderId, receiverId, content, bookingId: bookingId || null },
        include: { sender: true },
      });

      // Notify receiver
      await createNotification(receiverId, `💬 New message from ${sender.fullName}: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`);

      res.status(201).json({ success: true, data: message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Legacy: GET/POST messages by booking ID (for backward compat)
  app.get('/api/bookings/:id/messages', async (req, res) => {
    try {
      const messages = await prisma.message.findMany({
        where: { bookingId: req.params.id },
        orderBy: { createdAt: 'asc' },
        include: { sender: true },
      });
      res.json({ success: true, data: messages });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/bookings/:id/messages', async (req, res) => {
    try {
      const { senderId, receiverId, content } = req.body;
      const sender = await prisma.user.findUnique({ where: { id: senderId } });

      const message = await prisma.message.create({
        data: { bookingId: req.params.id, senderId, receiverId, content },
        include: { sender: true },
      });

      if (sender) {
        await createNotification(receiverId, `💬 New message from ${sender.fullName}: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`);
      }

      res.status(201).json({ success: true, data: message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Admin Routes ---

  // GET all users (admin)
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { search, role } = req.query;
      const where: any = {};
      if (role && typeof role === 'string' && role !== 'All') where.role = role;
      if (search && typeof search === 'string' && search.trim()) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { tutorProfile: { select: { id: true, verificationStatus: true, featured: true, rating: true, hourlyRate: true } } },
      });
      res.json({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          avatarUrl: u.avatarUrl,
          createdAt: u.createdAt,
          grade: u.grade,
          tutorProfile: u.tutorProfile ? {
            id: u.tutorProfile.id,
            verificationStatus: u.tutorProfile.verificationStatus,
            featured: u.tutorProfile.featured,
            rating: u.tutorProfile.rating,
            hourlyRate: u.tutorProfile.hourlyRate,
          } : null,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE user (admin)
  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // Cascade: delete messages, notifications, reviews, bookings, tutorProfile
      // Collect all booking IDs associated with this user (as student or via tutor profile)
      const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: id } });
      const tutorBookings = tutorProfile
        ? await prisma.booking.findMany({ where: { tutorProfileId: tutorProfile.id }, select: { id: true } })
        : [];
      const studentBookings = await prisma.booking.findMany({ where: { studentId: id }, select: { id: true } });
      const allBookingIds = [...tutorBookings, ...studentBookings].map((b) => b.id);
      // Delete messages referencing those bookings (no cascade in schema)
      if (allBookingIds.length > 0) {
        await prisma.message.deleteMany({ where: { bookingId: { in: allBookingIds } } });
      }
      // Delete all direct messages sent/received by this user
      await prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
      await prisma.notification.deleteMany({ where: { userId: id } });
      if (tutorProfile) {
        await prisma.review.deleteMany({ where: { tutorProfileId: tutorProfile.id } });
        await prisma.review.deleteMany({ where: { authorId: id } });
        await prisma.booking.deleteMany({ where: { tutorProfileId: tutorProfile.id } });
        await prisma.tutorSubject.deleteMany({ where: { tutorProfileId: tutorProfile.id } });
        await prisma.availabilitySlot.deleteMany({ where: { tutorProfileId: tutorProfile.id } });
        await prisma.verificationDocument.deleteMany({ where: { tutorProfileId: tutorProfile.id } });
        await prisma.tutorProfile.delete({ where: { id: tutorProfile.id } });
      }
      await prisma.booking.deleteMany({ where: { studentId: id } });
      await prisma.review.deleteMany({ where: { authorId: id } });
      await prisma.user.delete({ where: { id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH user role (admin)
  app.patch('/api/admin/users/:id/role', async (req, res) => {
    try {
      const { role } = req.body as { role: string };
      const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: role as any } });
      res.json({ success: true, data: { id: user.id, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE tutor profile (admin)
  app.delete('/api/admin/tutors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // 1. Get all booking IDs for this tutor so we can clean their children
      const bookings = await prisma.booking.findMany({ where: { tutorProfileId: id }, select: { id: true } });
      const bookingIds = bookings.map((b) => b.id);
      // 2. Delete messages attached to those bookings (no cascade in schema)
      if (bookingIds.length > 0) {
        await prisma.message.deleteMany({ where: { bookingId: { in: bookingIds } } });
      }
      // 3. Reviews cascade from Booking, but deleteMany is safe regardless
      await prisma.review.deleteMany({ where: { tutorProfileId: id } });
      // 4. Now safe to delete bookings
      await prisma.booking.deleteMany({ where: { tutorProfileId: id } });
      // 5. Clean up remaining tutor relations
      await prisma.tutorSubject.deleteMany({ where: { tutorProfileId: id } });
      await prisma.availabilitySlot.deleteMany({ where: { tutorProfileId: id } });
      await prisma.verificationDocument.deleteMany({ where: { tutorProfileId: id } });
      // 6. Finally delete the profile
      await prisma.tutorProfile.delete({ where: { id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH tutor featured flag (admin)
  app.patch('/api/admin/tutors/:id/featured', async (req, res) => {
    try {
      const { featured } = req.body as { featured: boolean };
      const tutor = await prisma.tutorProfile.update({ where: { id: req.params.id }, data: { featured } });
      res.json({ success: true, data: { id: tutor.id, featured: tutor.featured } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET all bookings (admin)
  app.get('/api/admin/bookings', async (req, res) => {
    try {
      const { status } = req.query;
      const where: any = {};
      if (status && typeof status === 'string' && status !== 'All') where.status = status;
      const bookings = await prisma.booking.findMany({
        where,
        include: { tutorProfile: { include: { user: true } }, subject: true, student: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: bookings.map(mapBooking) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE booking (admin)
  app.delete('/api/admin/bookings/:id', async (req, res) => {
    try {
      await prisma.review.deleteMany({ where: { bookingId: req.params.id } });
      await prisma.message.deleteMany({ where: { bookingId: req.params.id } });
      await prisma.booking.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH booking status (admin)
  app.patch('/api/admin/bookings/:id/status', async (req, res) => {
    try {
      const { status } = req.body as { status: string };
      const updateData: any = { status };
      if (status === 'CONFIRMED') updateData.meetingUrl = generateMeetLink();
      const booking = await prisma.booking.update({
        where: { id: req.params.id },
        data: updateData,
        include: { tutorProfile: { include: { user: true } }, subject: true, student: true },
      });
      res.json({ success: true, data: mapBooking(booking) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Mentora Academic] Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

// For Vercel Serverless
export default startServer();
