const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

const generateAccessToken = (userId) => {
  return jwt.sign({ sub: userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  const tokenId = uuidv4();
  const token = jwt.sign(
    { sub: userId, type: 'refresh', jti: tokenId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return { token, tokenId };
};

const storeRefreshToken = async (prisma, userId, tokenId, token) => {
  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
};

const revokeRefreshToken = async (prisma, tokenId) => {
  await prisma.refreshToken.deleteMany({
    where: { id: tokenId },
  });
};

const verifyRefreshToken = async (prisma, token) => {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    if (payload.type !== 'refresh') return null;

    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });
    
    if (!storedToken || storedToken.token !== token || storedToken.expiresAt < new Date()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
};
