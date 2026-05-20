import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import {
  insertUser,
  isUniqueEmailError,
  selectUserByEmail,
  selectUserById,
  updateUserProfile,
} from './db.mjs';
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

  app.post('/api/auth/register', async (req, res) => {
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
      const { id } = await insertUser(email, hash, '', '');
      const user = { id, email };
      const token = signToken(user);
      setAuthCookie(res, token);
      const inserted = await selectUserById(id);
      if (!inserted) {
        res.status(500).json({ error: 'server', message: 'Account created but could not load profile.' });
        return;
      }
      res.status(201).json({ user: rowToUser(inserted) });
    } catch (e) {
      if (isUniqueEmailError(e)) {
        res.status(409).json({ error: 'conflict', message: 'An account with this email already exists.' });
        return;
      }
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'validation', message: 'Email and password are required.' });
      return;
    }

    try {
      const row = await selectUserByEmail(email);
      if (!row || !bcrypt.compareSync(password, row.password_hash)) {
        res.status(401).json({ error: 'unauthorized', message: 'Invalid email or password.' });
        return;
      }

      const user = { id: row.id, email: row.email };
      const token = signToken(user);
      setAuthCookie(res, token);
      res.json({ user: rowToUser(row) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Login failed.' });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearAuthCookie(res);
    res.status(204).end();
  });

  app.get('/api/auth/me', async (req, res) => {
    const tokenUser = userFromToken(req);
    if (!tokenUser) {
      res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
      return;
    }
    try {
      const row = await selectUserById(tokenUser.id);
      if (!row) {
        clearAuthCookie(res);
        res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
        return;
      }
      res.json({ user: rowToUser(row) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not load profile.' });
    }
  });

  app.put('/api/profile', async (req, res) => {
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
    try {
      await updateUserProfile(tokenUser.id, displayName, avatarUrl);
      const row = await selectUserById(tokenUser.id);
      if (!row) {
        res.status(404).json({ error: 'not_found', message: 'User not found.' });
        return;
      }
      res.json({ user: rowToUser(row) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not update profile.' });
    }
  });
}
