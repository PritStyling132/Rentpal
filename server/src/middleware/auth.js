const authService = require('../services/auth.service');
const { prisma } = require('../config/database');

/**
 * Middleware to verify JWT access token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired access token',
      });
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        userRoles: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      profile: user.profile,
      roles: user.userRoles.map((r) => r.role),
      isAdmin: user.userRoles.some((r) => r.role === 'admin'),
      isOwner: user.userRoles.some((r) => r.role === 'owner') || user.profile?.userType === 'owner',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
  next();
};

/**
 * Middleware to check if user has owner role
 */
const requireOwner = (req, res, next) => {
  if (!req.user?.isOwner && !req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Owner access required',
    });
  }
  next();
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user?.roles.includes(role) && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: `${role} access required`,
      });
    }
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyAccessToken(token);

    if (!decoded) {
      req.user = null;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        userRoles: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.profile,
        roles: user.userRoles.map((r) => r.role),
        isAdmin: user.userRoles.some((r) => r.role === 'admin'),
        isOwner: user.userRoles.some((r) => r.role === 'owner') || user.profile?.userType === 'owner',
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireOwner,
  requireRole,
  optionalAuth,
};
