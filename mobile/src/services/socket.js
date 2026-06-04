import { io } from 'socket.io-client';
const url=process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:4000';
export const socket=io(url,{autoConnect:false,transports:['websocket']});
