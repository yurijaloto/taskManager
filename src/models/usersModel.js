const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name is required"],
    min: 1,
    max: [100, "Name is too large"]
  },

  age: Number,

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true, //n funciona - EDIT: funciona sim. Precisa dropar o banco se isso nao tiver sido setado no inico
    validate: [validator.isEmail, 'Email not valid']
  },

  password: {
    type: String,
    required: true,
    min: [8, "Minimum of 8 characters"], //n funciona
    select: false
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ]

  // tokens: {
  //   type: [{String}],
  //   select: false
  // }
},
{
  timestamps: true
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.pre('save', async function(next) {
  const user = this

  //isso é metodo que o mongoose fornece
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 12)
  }

  next()

})

//entender esse statics ai. Pq nao pode ser methods
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email}).select('+password')
  const isPasswordValid = await bcrypt.compare(password, user?.password)

  if (!user || !isPasswordValid) {
    throw new Error("User not found")
  }

  return user
}

const User = new mongoose.model('User', userSchema)

module.exports = User