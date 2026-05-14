import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const useSocket = (projectId = null) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('accessToken');
    const socket = io('/', {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      if (projectId) {
        socket.emit('project:join', projectId);
      }
    });

    socket.on('notification:new', (notification) => {
      toast.success(notification.type.replace('_', ' ').toLowerCase() + '!');
      queryClient.invalidateQueries(['notifications']);
    });

    socket.on('task:updated', (task) => {
      queryClient.invalidateQueries(['board', projectId]);
      queryClient.invalidateQueries(['task', task.id]);
    });

    socket.on('task:moved', () => {
      queryClient.invalidateQueries(['board', projectId]);
    });

    socket.on('comment:added', ({ taskId }) => {
      queryClient.invalidateQueries(['comments', taskId]);
    });

    return () => {
      if (projectId) {
        socket.emit('project:leave', projectId);
      }
      socket.disconnect();
    };
  }, [isAuthenticated, user, projectId, queryClient]);

  return socketRef.current;
};
