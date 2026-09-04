const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
});

const login = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.userId);
  res.status(200).json(new ApiResponse(200, user));
});

module.exports = { register, login, getProfile, logout };
