import { Router } from 'express';
import * as authService from './auth.service.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();
const TOKEN_NAME = 'token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
};

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' });
    }
    const user = await authService.registerUser(email, password);
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    if (error.message === 'CONFLICT') {
      return res.status(409).json({ error: 'E-Mail bereits vergeben.' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ error: 'E-Mail oder Passwort ungültig.' });
    }

    const user = await authService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'E-Mail oder Passwort ungültig.' });
    }

    const token = authService.generateToken(user);
    res.cookie(TOKEN_NAME, token, COOKIE_OPTIONS);
    return res.json({ id: user.id, email: user.email });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res) => {
  return res.json({ id: req.user.userId, email: req.user.email });
});

router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.json({ success: true });
});

router.get('/sse-token', authenticate, (req, res) => {
  try {
    const token = authService.generateToken({
      id: req.user.userId,
      email: req.user.email
    });
    return res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Generieren des SSE-Tokens' });
  }
});

export default router;