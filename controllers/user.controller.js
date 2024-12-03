const { userService } = require('../services');

exports.registerUser = async (req, res) => {
  try {
    const  user = await userService.registerNewUser(req.body);

    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || error,
      error: true,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const token = await userService.loginUser(req.body);

    const cookieOptions = {
      http: true,
      secure: true,
    };
     
    return res.cookie('token', token, cookieOptions).status(200).json({
      message: 'Logged in successfully',
      token,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || error,
      error: true,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const cookieOptions = {
      http: true,
      secure: true,
    };

    return res.cookie('token', '', cookieOptions).status(200).json({
      message: 'Out of session',
      logout: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

exports.getUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token || '';

    const user = await userService.getUserDataFromToken(token);

    return res.status(200).json({
      message: 'User details',
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || error,
      error: true,
    });
  }
};

exports.updateUserDetails = async (req, res) => {
  const { token, userData } = req.body;
  try {

  const updatedUser = await userService.updateUser(token, userData);

    return res.status(200).json({
      message: 'User has been successfully updated',
      user: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || error,
      error: true,
    });
  }
};
