const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class AuthService {
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access token
   */
  generateAccessToken(user, profile) {
    const payload = {
      userId: user.id,
      email: user.email,
      userType: profile?.userType || 'user',
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Generate refresh token and store in database
   */
  async generateRefreshToken(userId) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token and get user
   */
  async verifyRefreshToken(token) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { profile: true, userRoles: true } } },
    });

    if (!refreshToken) {
      return null;
    }

    if (refreshToken.revokedAt || refreshToken.expiresAt < new Date()) {
      return null;
    }

    return refreshToken.user;
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Create new user with profile
   */
  async createUser(userData) {
    const { email, password, name, phone, pinCode, userType, businessName, businessAddress, gstNumber } = userData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user with profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      // Create profile
      await tx.profile.create({
        data: {
          id: newUser.id,
          name,
          phone,
          pinCode,
          userType: userType || 'user',
          businessName: userType === 'owner' ? businessName : null,
          businessAddress: userType === 'owner' ? businessAddress : null,
          gstNumber: userType === 'owner' ? gstNumber : null,
        },
      });

      // Create user role
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          role: userType === 'owner' ? 'owner' : 'user',
        },
      });

      return newUser;
    });

    return user;
  }

  /**
   * Login user
   */
  async loginUser(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        userRoles: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await this.comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user, user.profile);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: { timestamp: new Date().toISOString() },
      },
    });

    // Check if admin
    const isAdmin = user.userRoles.some(r => r.role === 'admin');
    const isOwner = user.userRoles.some(r => r.role === 'owner') || user.profile?.userType === 'owner';

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      profile: user.profile,
      isAdmin,
      isOwner,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    const user = await this.verifyRefreshToken(refreshToken);
    if (!user) {
      throw new Error('Invalid or expired refresh token');
    }

    const accessToken = this.generateAccessToken(user, user.profile);

    return { accessToken };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId,
        action: 'USER_LOGOUT',
        details: { timestamp: new Date().toISOString() },
      },
    });
  }

  /**
   * Get user by ID with profile and roles
   */
  async getUserById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userRoles: true,
      },
    });
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId, role) {
    const userRole = await prisma.userRole.findFirst({
      where: { userId, role },
    });
    return !!userRole;
  }

  /**
   * Upgrade user to owner
   */
  async upgradeToOwner(userId, businessData) {
    const { businessName, businessAddress, gstNumber } = businessData;

    await prisma.$transaction(async (tx) => {
      // Update profile
      await tx.profile.update({
        where: { id: userId },
        data: {
          userType: 'owner',
          businessName,
          businessAddress,
          gstNumber,
        },
      });

      // Add owner role if not exists
      await tx.userRole.upsert({
        where: { userId_role: { userId, role: 'owner' } },
        create: { userId, role: 'owner' },
        update: {},
      });
    });

    return this.getUserById(userId);
  }
}

module.exports = new AuthService();
