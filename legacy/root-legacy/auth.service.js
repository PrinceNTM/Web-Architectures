import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../src/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const SALT_ROUNDS = Number.isInteger(BCRYPT_SALT_ROUNDS) && BCRYPT_SALT_ROUNDS >= 10
  ? BCRYPT_SALT_ROUNDS
  : 10;
const DUMMY_HASH = bcrypt.hashSync('dummy_password_to_prevent_timing_attacks', SALT_ROUNDS);

/**
 * Registriert einen neuen Benutzer.
 */
export const registerUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    throw new Error('CONFLICT');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
    },
  });
};

/**
 * Überprüft die Zugangsdaten eines Benutzers.
 */
export const authenticateUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Timing-safe-ish check: bcrypt.compare sollte immer ausgeführt werden, 
  // um User-Enumeration durch Zeitmessung zu erschweren.
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  if (!user || !passwordMatches) return null;
  return user;
};

/**
 * Erzeugt einen JWT für einen Benutzer.
 */
export const generateToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '24h', algorithm: 'HS256' }
  );
};