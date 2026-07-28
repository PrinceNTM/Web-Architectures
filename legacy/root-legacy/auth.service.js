import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../src/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Registriert einen neuen Benutzer.
 */
export const registerUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    throw new Error('CONFLICT');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
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
  const dummyHash = "$2b$10$abcdefghijklmnopqrstuv"; // Fake-Hash für nicht existierende User
  const passwordMatches = await bcrypt.compare(password, user ? user.password : dummyHash);

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
    { expiresIn: '24h' }
  );
};