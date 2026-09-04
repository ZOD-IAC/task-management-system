const Joi = require('joi');
const { TASK_STATUS, TASK_PRIORITY } = require('../../constants');

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(2000).allow('').optional(),
  status: Joi.string().valid(...Object.values(TASK_STATUS)).optional(),
  priority: Joi.string().valid(...Object.values(TASK_PRIORITY)).optional(),
  dueDate: Joi.date().iso().optional().allow(null),
});

// All fields optional on update - partial updates are allowed.
const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(2000).allow('').optional(),
  status: Joi.string().valid(...Object.values(TASK_STATUS)).optional(),
  priority: Joi.string().valid(...Object.values(TASK_PRIORITY)).optional(),
  dueDate: Joi.date().iso().optional().allow(null),
}).min(1);

module.exports = { createTaskSchema, updateTaskSchema };
