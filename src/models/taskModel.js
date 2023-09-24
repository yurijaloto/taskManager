const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'The description of the task is required'],
    min: [2, 'cannot be empty'],
    max: 50
  },

  completed: {
    type: Boolean,
    default: false
  },

  owner: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User'
  }
},
{
  timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task