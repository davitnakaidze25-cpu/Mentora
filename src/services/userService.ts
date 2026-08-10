/**
 * userService — abstraction over /api/auth/* endpoints.
 * Mirrors Firebase Auth API shape so migrating to:
 *   firebase.auth().createUserWithEmailAndPassword(email, password)
 * is a single-file swap.
 */

export interface ServiceUser {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'TUTOR' | 'PARENT' | 'ADMIN';
  avatarUrl?: string;
  bio?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: ServiceUser['role'];
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Register a new user.
 * Firebase equivalent: firebase.auth().createUserWithEmailAndPassword(email, password)
 */
export async function registerUser(payload: RegisterPayload): Promise<ServiceUser> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error ?? 'Registration failed');
  return data.data as ServiceUser;
}

/**
 * Login an existing user.
 * Firebase equivalent: firebase.auth().signInWithEmailAndPassword(email, password)
 */
export async function loginUser(payload: LoginPayload): Promise<ServiceUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error ?? 'Login failed');
  return data.data as ServiceUser;
}

export async function updateUserProfile(id: string, payload: Partial<{ fullName: string; avatarUrl: string; bio: string }>): Promise<ServiceUser> {
  const res = await fetch(`/api/auth/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error ?? 'Unable to update profile');
  return data.data as ServiceUser;
}

/**
 * Get a user by ID.
 * Firebase equivalent: firebase.firestore().collection('users').doc(id).get()
 */
export async function getUserById(id: string): Promise<ServiceUser | null> {
  const res = await fetch(`/api/auth/users/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? (data.data as ServiceUser) : null;
}
