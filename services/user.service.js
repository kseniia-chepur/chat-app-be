const UserModel = require('../models/user.model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUser = (searchParam) => UserModel.findOne({ searchParam });

const getUserById = (id) => UserModel.findById(id);

const registerNewUser = async (userData) => {
  const { firstName, lastName, email, password, photo } = userData;

  const isEmailRegistered = await UserModel.findOne({ email });

  if (isEmailRegistered) {
    throw new Error('User already exists');
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedpassword = await bcryptjs.hash(password, salt);

  const newUserData = new UserModel({
    firstName,
    lastName,
    email,
    password: hashedpassword,
    photo,
  });

  const newUser = await newUserData.save();

  return newUser;
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new Error('User is not found');
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Verify your password');
  }

  const tokenData = {
    id: user._id,
    email: user.email,
  };

  const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_VALIDITY_TIME,
  });

  return token;
};

const getUserDataFromToken = async (token) => {
  if (!token) {
    return {
      message: 'Out of session',
      logout: true,
    };
  }

  const decodedTokenData = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await UserModel.findById(decodedTokenData.id).select(
    '-password'
  );

  return user;
};

const updateUser = async (token, userData) => {
  const user = await getUserDataFromToken(token);

  const { firstName, lastName, photo } = userData;

  await UserModel.updateOne({ _id: user._id }, { firstName, lastName, photo });

  const updatedUser = await UserModel.findById(user._id).select('-password');

  return updatedUser;
};

const searchUser = async (searchParam) => {
  const query = new RegExp(searchParam, 'i', 'g');

  const user = await UserModel.find({
    $or: [{ firstName: query }, { lastName: query }, { email: query }],
  }).select('-password');

  return user;
};

module.exports = {
  getUser,
  getUserById,
  registerNewUser,
  loginUser,
  getUserDataFromToken,
  updateUser,
  searchUser,
};
