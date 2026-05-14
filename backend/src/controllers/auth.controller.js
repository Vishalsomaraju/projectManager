const authService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      res.status(400).json({
        error: { code: 'REGISTRATION_FAILED', message: error.message }
      });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.json({ data: result });
    } catch (error) {
      res.status(401).json({
        error: { code: 'AUTH_FAILED', message: error.message }
      });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new Error('Refresh token is required');
      const result = await authService.refresh(refreshToken);
      res.json({ data: result });
    } catch (error) {
      res.status(401).json({
        error: { code: 'REFRESH_FAILED', message: error.message }
      });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        error: { code: 'LOGOUT_FAILED', message: error.message }
      });
    }
  }

  async getMe(req, res) {
    try {
      const user = await authService.getMe(req.user.id);
      res.json({ data: { user } });
    } catch (error) {
      res.status(404).json({
        error: { code: 'USER_NOT_FOUND', message: error.message }
      });
    }
  }
}

module.exports = new AuthController();
