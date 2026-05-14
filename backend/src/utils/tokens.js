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

const storeRefreshToken = async (redis, userId, tokenId, token) => {
  const key = `refresh:${userId}:${tokenId}`;
  await redis.set(key, token, 'EX', 7 * 24 * 60 * 60); // 7 days
};

const revokeRefreshToken = async (redis, userId, tokenId) => {
  const key = `refresh:${userId}:${tokenId}`;
  await redis.del(key);
};

const verifyRefreshToken = async (redis, token) => {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    if (payload.type !== 'refresh') return null;

    const key = `refresh:${payload.sub}:${payload.jti}`;
    const storedToken = await redis.get(key);
    
    if (!storedToken || storedToken !== token) return null;
    
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
