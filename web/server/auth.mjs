import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { getDb } from './db.mjs';
import { AUTH_COOKIE, parseSessionUser } from './session.mjs';

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeDisplayName(name) {
  return String(name || '').trim().slice(0, 60);
}

function normalizeAvatarUrl(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  if (s.startsWith('data:image/')) {
    if (s.length > 2_800_000) return null;
    return /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(s) ? s : null;
  }
  if (s.length > 500) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

function rowToUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name || '',
    avatarUrl: row.avatar_url || '',
  };
}

export function mountAuth(app, { jwtSecret, cookieSecure }) {
  app.use(cookieParser());

  const db = getDb();
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, display_name, avatar_url) VALUES (?, ?, ?, ?)');
  const selectByEmail = db.prepare(
    'SELECT id, email, password_hash, display_name, avatar_url FROM users WHERE email = ?',
  );
  const selectById = db.prepare('SELECT id, email, display_name, avatar_url FROM users WHERE id = ?');
  const updateProfile = db.prepare('UPDATE users SET display_name = ?, avatar_url = ? WHERE id = ?');

  function signToken(user) {
    return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
  }

  function setAuthCookie(res, token) {
    res.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: Boolean(cookieSecure),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  function clearAuthCookie(res) {
    res.clearCookie(AUTH_COOKIE, {
      path: '/',
      sameSite: 'lax',
      secure: Boolean(cookieSecure),
    });
  }

  function userFromToken(req) {
    return parseSessionUser(req, jwtSecret);
  }

  app.post('/api/auth/register', (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'validation', message: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'validation', message: 'Password must be at least 8 characters.' });
      return;
    }
    if (password.length > 128) {
      res.status(400).json({ error: 'validation', message: 'Password is too long.' });
      return;
    }

    const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
    try {
      const info = insertUser.run(email, hash, '', '');
      const user = { id: Number(info.lastInsertRowid), email };
      const token = signToken(user);
      setAuthCookie(res, token);
      const inserted = selectById.get(user.id);
      res.status(201).json({ user: rowToUser(inserted) });
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'conflict', message: 'An account with this email already exists.' });
        return;
      }
      throw e;
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'validation', message: 'Email and password are required.' });
      return;
    }

    const row = selectByEmail.get(email);
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      res.status(401).json({ error: 'unauthorized', message: 'Invalid email or password.' });
      return;
    }

    const user = { id: row.id, email: row.email };
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user: rowToUser(row) });
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearAuthCookie(res);
    res.status(204).end();
  });

  app.get('/api/auth/me', (req, res) => {
    const tokenUser = userFromToken(req);
    if (!tokenUser) {
      res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
      return;
    }
    const row = selectById.get(tokenUser.id);
    if (!row) {
      clearAuthCookie(res);
      res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
      return;
    }
    res.json({ user: rowToUser(row) });
  });

  app.put('/api/profile', (req, res) => {
    const tokenUser = userFromToken(req);
    if (!tokenUser) {
      res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
      return;
    }
    const displayName = normalizeDisplayName(req.body?.displayName);
    const avatarUrl = normalizeAvatarUrl(req.body?.avatarUrl);
    if (avatarUrl === null) {
      res.status(400).json({
        error: 'validation',
        message: 'Avatar must be empty, a valid http/https URL, or a supported image upload.',
      });
      return;
    }
    updateProfile.run(displayName, avatarUrl, tokenUser.id);
    const row = selectById.get(tokenUser.id);
    if (!row) {
      res.status(404).json({ error: 'not_found', message: 'User not found.' });
      return;
    }
    res.json({ user: rowToUser(row) });
  });
}
