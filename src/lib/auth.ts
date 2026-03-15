import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';

export type TokenPayload = {
  userId: string;
  email: string;
};

// Generate a JWT
export async function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify and decode a JWT
export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Helper to get the current authenticated user's ID from cookies
export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId || null;
}
