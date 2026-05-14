const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { redis } = require('../config/db');
const { registerHandlers } = require('./handlers');
const { getProjectRoom, getTaskRoom, getUserRoom } = require('./rooms');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_secret';

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected via socket`);
    socket.join(getUserRoom(socket.userId));
    registerHandlers(io, socket);
  });

  return io;
};

const socketService = {
  emitToProject: (projectId, event, data) => {
    if (io) io.to(getProjectRoom(projectId)).emit(event, data);
  },
  emitToTask: (taskId, event, data) => {
    if (io) io.to(getTaskRoom(taskId)).emit(event, data);
  },
  emitToUser: (userId, event, data) => {
    if (io) io.to(getUserRoom(userId)).emit(event, data);
  },
  emitToAllInProjectExcept: (projectId, userId, event, data) => {
    // Note: This requires mapping sockets to userIds which is more complex
    // For now we'll just emit to the room and handle filtering on frontend
    if (io) io.to(getProjectRoom(projectId)).emit(event, data);
  }
};

module.exports = { initSocket, socketService };
