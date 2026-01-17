import { rooms } from '../models/data.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      const room = rooms.get(roomId);
      if (room) {
        io.to(roomId).emit('room-updated', { room });
      }
    });
  });
}
