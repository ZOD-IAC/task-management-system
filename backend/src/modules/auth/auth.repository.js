const User = require('./user.model');

const findByEmail = (email, withPassword = false) => {
  const query = User.findOne({ email });
  return withPassword ? query.select('+password') : query;
};

const findById = (id) => User.findById(id);

const create = (userData) => User.create(userData);

module.exports = { findByEmail, findById, create };
