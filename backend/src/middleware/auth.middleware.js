const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_secret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (error) {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
      req.user = { id: payload.sub };
    } catch (error) {
      // Ignore invalid token in optional auth
    }
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
};
