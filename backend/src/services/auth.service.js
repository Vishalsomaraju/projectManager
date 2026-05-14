const bcrypt = require('bcryptjs');
const { prisma, redis } = require('../config/db');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokens');

class AuthService {
  async register({ email, username, displayName, password }) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        passwordHash,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const { token: refreshToken, tokenId } = generateRefreshToken(user.id);
    await storeRefreshToken(redis, user.id, tokenId, refreshToken);

    const { passwordHash: _, ...userProfile } = user;
    return { user: userProfile, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const accessToken = generateAccessToken(user.id);
    const { token: refreshToken, tokenId } = generateRefreshToken(user.id);
    await storeRefreshToken(redis, user.id, tokenId, refreshToken);

    const { passwordHash: _, ...userProfile } = user;
    return { user: userProfile, accessToken, refreshToken };
  }

  async refresh(token) {
    const payload = await verifyRefreshToken(redis, token);
    if (!payload) throw new Error('Invalid or expired refresh token');

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error('User not found');

    const accessToken = generateAccessToken(user.id);
    return { accessToken };
  }

  async logout(token) {
    const payload = await verifyRefreshToken(redis, token);
    if (payload) {
      await revokeRefreshToken(redis, payload.sub, payload.jti);
    }
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  }
}

module.exports = new AuthService();
