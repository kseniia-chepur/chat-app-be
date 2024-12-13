const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { userService, conversationService } = require('../services');

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
  const currentUser = await userService.getUserDataFromToken(token);

  socket.join(currentUser?._id?.toString());

  onlineUsers.add(currentUser?._id?.toString());

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

    const messages = await conversationService.getMessages(currentUser, userId);

    socket.emit('messages', messages);
  });

  socket.on('new message', async (newMsg) => {
    const {
      conversation,
      message,
    } = await conversationService.createConversation(newMsg);

    const conversationMessages = await conversationService.updateConversation(
      newMsg,
      conversation,
      message,
    );

    io.to(newMsg?.sender).emit('messages', conversationMessages);

    const conversationSender = await conversationService.getConversationMessages(
      newMsg?.sender
    );
    const conversationReceiver = await conversationService.getConversationMessages(
      newMsg?.receiver
    );
    io.to(newMsg?.sender).emit('conversation', conversationSender);
    io.to(newMsg?.receiver).emit('conversation', conversationReceiver);
  });

  socket.on('sidebar', async (currentUserId) => {
    const conversation = await conversationService.getConversationMessages(
      currentUserId
    );
    socket.emit('conversation', conversation);
  });

  socket.on('read messages', async (sentByUser) => {
    await conversationService.updateMessageStatus(currentUser, sentByUser);

    const conversationSender = await conversationService.getConversationMessages(
      currentUser?._id?.toString()
    );
    const conversationReceiver = await conversationService.getConversationMessages(
      sentByUser
    );
    io.to(currentUser?._id?.toString()).emit(
      'conversation',
      conversationSender
    );
    io.to(sentByUser).emit('conversation', conversationReceiver);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(currentUser?._id?.toString());
  });
});

module.exports = {
  app,
  server,
};

