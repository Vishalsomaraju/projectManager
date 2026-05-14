const { getProjectRoom, getTaskRoom, canAccessProject, canAccessTask } = require('./rooms');

const registerHandlers = (io, socket) => {
  socket.on('room:join', async ({ type, id }) => {
    const userId = socket.userId;
    
    if (type === 'project') {
      if (await canAccessProject(userId, id)) {
        socket.join(getProjectRoom(id));
        console.log(`User ${userId} joined project room ${id}`);
      }
    } else if (type === 'task') {
      if (await canAccessTask(userId, id)) {
        socket.join(getTaskRoom(id));
        console.log(`User ${userId} joined task room ${id}`);
      }
    }
  });

  socket.on('room:leave', ({ type, id }) => {
    if (type === 'project') {
      socket.leave(getProjectRoom(id));
    } else if (type === 'task') {
      socket.leave(getTaskRoom(id));
    }
  });

  socket.on('typing:start', ({ taskId, commentId }) => {
    socket.to(getTaskRoom(taskId)).emit('typing', {
      userId: socket.userId,
      taskId,
      commentId
    });
  });

  socket.on('typing:stop', ({ taskId }) => {
    socket.to(getTaskRoom(taskId)).emit('typing:stop', {
      userId: socket.userId,
      taskId
    });
  });

  socket.on('cursor:update', ({ projectId, taskId }) => {
    socket.to(getProjectRoom(projectId)).emit('presence:update', {
      userId: socket.userId,
      activeTaskId: taskId
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
};

module.exports = { registerHandlers };
