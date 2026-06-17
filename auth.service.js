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

  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.password);
  return passwordMatches ? user : null;
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