import jwt from 'jsonwebtoken';

export const AUTH_COOKIE = 'auth_token';

/** @returns {{ id: number, email: string } | null} */
export function parseSessionUser(req, jwtSecret) {
  const raw = req.cookies?.[AUTH_COOKIE];
  if (!raw || typeof raw !== 'string') return null;
  try {
    const payload = jwt.verify(raw, jwtSecret);
    const id = typeof payload.sub === 'number' ? payload.sub : Number(payload.sub);
    const email = typeof payload.email === 'string' ? payload.email : '';
    if (!Number.isFinite(id) || !email) return null;
    return { id, email };
  } catch {
    return null;
  }
}
