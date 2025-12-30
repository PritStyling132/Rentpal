const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Register a new user
 * POST /api/auth/signup
 */
const signup = asyncHandler(async (req, res) => {
  const { email, password, name, phone, pinCode, userType, businessName, businessAddress, gstNumber } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and name are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters',
    });
  }

  // Validate owner-specific fields
  if (userType === 'owner' && !businessName) {
    return res.status(400).json({
      success: false,
      error: 'Business name is required for owner accounts',
    });
  }

  // Create user
  const user = await authService.createUser({
    email,
    password,
    name,
    phone,
    pinCode,
    userType,
    businessName,
    businessAddress,
    gstNumber,
  });

  // Login the user after signup
  const loginResult = await authService.loginUser(email, password);

  res.status(201).json({
    success: true,
    data: loginResult,
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  const result = await authService.loginUser(email, password);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required',
    });
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  await authService.logout(req.user.id, refreshToken);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      profile: user.profile,
      isAdmin: user.userRoles.some((r) => r.role === 'admin'),
      isOwner: user.userRoles.some((r) => r.role === 'owner') || user.profile?.userType === 'owner',
    },
  });
});

/**
 * Upgrade user to owner
 * POST /api/auth/upgrade-to-owner
 */
const upgradeToOwner = asyncHandler(async (req, res) => {
  const { businessName, businessAddress, gstNumber } = req.body;

  if (!businessName) {
    return res.status(400).json({
      success: false,
      error: 'Business name is required',
    });
  }

  const user = await authService.upgradeToOwner(req.user.id, {
    businessName,
    businessAddress,
    gstNumber,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      profile: user.profile,
      isAdmin: user.userRoles.some((r) => r.role === 'admin'),
      isOwner: true,
    },
  });
});

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters',
    });
  }

  const user = await authService.getUserById(req.user.id);

  // Verify current password
  const isValid = await authService.comparePassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect',
    });
  }

  // Update password
  const { prisma } = require('../config/database');
  const newHash = await authService.hashPassword(newPassword);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: newHash },
  });

  // Revoke all refresh tokens
  await authService.revokeAllUserTokens(req.user.id);

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  });
});

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
  upgradeToOwner,
  changePassword,
};
