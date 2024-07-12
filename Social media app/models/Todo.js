const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
});

module.exports = mongoose.model('Todo', todoSchema);
