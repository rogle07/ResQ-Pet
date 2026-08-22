import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addNotification } from '@/features/notifications/notificationSlice';

let socket: Socket | null = null;

export const getSocket = () => socket;

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return;

    socket = io('/', { withCredentials: true });

    socket.on('connect', () => {
      socket?.emit('join:owner', user._id);
      if (user.role === 'rescue_team') socket?.emit('join:rescueTeam');
    });

    socket.on('notification:new', (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [user, dispatch]);
};
