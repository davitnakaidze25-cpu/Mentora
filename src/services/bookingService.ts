/**
 * bookingService — abstraction over /api/bookings endpoints.
 * Firebase equivalent would use:
 *   firebase.firestore().collection('bookings')
 */

export interface ServiceBooking {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  tutorInstitution: string;
  subjectName: string;
  date: string;
  timeSlot: string;
  durationMins: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  totalPrice: number;
  studentName: string;
  studentNotes?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface CreateBookingPayload {
  tutorId: string;
  subjectName: string;
  date: string;
  timeSlot: string;
  studentName: string;
  studentNotes?: string;
  totalPrice: number;
}

/**
 * Fetch all bookings.
 * Firebase equivalent: firebase.firestore().collection('bookings').get()
 */
export async function getBookings(): Promise<ServiceBooking[]> {
  const res = await fetch('/api/bookings');
  const data = await res.json();
  return data.success ? (data.data as ServiceBooking[]) : [];
}

/**
 * Create a new booking.
 * Firebase equivalent: firebase.firestore().collection('bookings').add({...})
 */
export async function createBooking(payload: CreateBookingPayload): Promise<ServiceBooking | null> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.success ? (data.data as ServiceBooking) : null;
}

/**
 * Update booking status.
 * Firebase equivalent: firebase.firestore().collection('bookings').doc(id).update({ status })
 */
export async function updateBookingStatus(
  id: string,
  status: ServiceBooking['status']
): Promise<boolean> {
  const res = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  return data.success === true;
}

/**
 * Cancel a booking.
 */
export async function cancelBooking(id: string): Promise<boolean> {
  return updateBookingStatus(id, 'CANCELLED');
}

/**
 * Accept / confirm a booking.
 */
export async function acceptBooking(id: string): Promise<boolean> {
  return updateBookingStatus(id, 'CONFIRMED');
}
