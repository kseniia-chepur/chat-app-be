const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { userService, conversationService } = require('../services');
const ConversationModel = require('../models/conversation.model');

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

  socket.join(user?._id?.toString());

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

    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    socket.emit('messages', getConversationMessage?.messages || []);
  });

  socket.on('new message', async (data) => {
    const {
      conversation,
      message,
    } = await conversationService.createConversation(data);

    const conversationMessages = await conversationService.updateConversation(
      data,
      conversation,
      message
    );

    io.to(data?.sender).emit(
      'messages',
      conversationMessages?.messages,
      message.quote || []
    );
    io.to(data?.receiver).emit(
      'messages',
      conversationMessages?.messages || []
    );

    const conversationSender = await conversationService.getConversationMessages(
      data?.sender
    );
    const conversationReceiver = await conversationService.getConversationMessages(
      data?.receiver
    );
    io.to(data?.sender).emit('conversation', conversationSender);
    io.to(data?.receiver).emit('conversation', conversationReceiver);
  });

  socket.on('sidebar', async (currentUserId) => {
    const conversation = await conversationService.getConversationMessages(
      currentUserId
    );
    socket.emit('conversation', conversation);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(user?._id);
  });
});

module.exports = {
  app,
  server,
};
