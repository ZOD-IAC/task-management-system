const mongoose = require('mongoose');
const Task = require('./task.model');

const create = (taskData) => Task.create(taskData);

const findById = (id) => Task.findById(id);

const findByIdAndUser = (id, userId) => Task.findOne({ _id: id, user: userId });

const findWithFilters = (userId, filters, { skip, limit, sort }) => {
  const query = { user: userId, ...filters };
  return Task.find(query).sort(sort).skip(skip).limit(limit);
};

const countWithFilters = (userId, filters) => {
  return Task.countDocuments({ user: userId, ...filters });
};

const updateByIdAndUser = (id, userId, updates) => {
  return Task.findOneAndUpdate({ _id: id, user: userId }, updates, {
    new: true,
    runValidators: true,
  });
};

const deleteByIdAndUser = (id, userId) => {
  return Task.findOneAndDelete({ _id: id, user: userId });
};

const getStatusCounts = async (userId) => {
  const results = await Task.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  return results;
};

const countAllForUser = (userId) => Task.countDocuments({ user: userId });

module.exports = {
  create,
  findById,
  findByIdAndUser,
  findWithFilters,
  countWithFilters,
  updateByIdAndUser,
  deleteByIdAndUser,
  getStatusCounts,
  countAllForUser,
};
