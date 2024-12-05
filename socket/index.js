const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { userService } = require('../services');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FE_URL,
    credentials: true,
  },
});

const onlineUsers = new Set();

io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  const user = await userService.getUserDataFromToken(token);

  socket.join(user?._id);

  onlineUsers.add(user?._id?.toString());

  io.emit('onlineUsers', [...onlineUsers]);

  socket.on('chat page', async (userId) => {
    const userData = await userService.getUserById(userId);

    const payload = {
      _id: userData?._id,
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      email: userData?.email,
      photo: userData?.photo,
      online: onlineUsers.has(userId),
    };

    socket.emit('chat user', payload);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(user?._id);
  });
});

module.exports = {
  app,
  server,
};
