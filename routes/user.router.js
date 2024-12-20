const express = require('express');
const { userController } = require('../controllers');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserDetails);
router.put('/update', userController.updateUserDetails);
router.post('/search', userController.searchUser);


module.exports = router;
