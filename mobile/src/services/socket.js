import { io } from 'socket.io-client';

const url =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  'https://codeclash-tictactoe-server.onrender.com';

export const socket = io(url, {
  autoConnect: false,
  transports: ['websocket'],
});
