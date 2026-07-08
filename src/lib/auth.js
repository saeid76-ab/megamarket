const jwt = require('jsonwebtoken');
const { cookies } = require('next/headers');
const { prisma } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const COOKIE_NAME = 'megamarket_session';
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // ۷ روز

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE_SECONDS });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// برای استفاده در Server Components / Route Handlers
async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      defaultAddress: true,
      defaultCity: true,
      defaultPostal: true
    }
  });

  return user;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

module.exports = {
  signToken,
  verifyToken,
  getCurrentUser,
  requireAdmin,
  COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS
};
