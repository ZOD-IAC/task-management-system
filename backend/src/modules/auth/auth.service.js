const ApiError = require('../../utils/ApiError');
const generateToken = require('../../utils/generateToken');
const authRepository = require('./auth.repository');

const register = async ({ name, email, password }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await authRepository.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email, true);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

const getProfile = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return { id: user._id, name: user.name, email: user.email };
};

module.exports = { register, login, getProfile };
