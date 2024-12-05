const mongooise = require('mongoose');

const userSchema = new mongooise.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'provide first name'],
    },
    lastName: {
      type: String,
      required: [true, 'provide last name'],
    },
    email: {
      type: String,
      required: [true, 'provide email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'provide password'],
    },
    photo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongooise.model('User', userSchema);

module.exports = UserModel;
