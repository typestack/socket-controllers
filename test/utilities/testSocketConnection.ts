import socketio from 'socket.io-client';

export async function testConnection(path: string) {
  return await new Promise<number>((resolve, reject) => {
    const socket = socketio(path, { reconnection: false, timeout: 5000 });
    socket.on('connect', () => socket.disconnect());
    socket.on('connect_error', reject);
    socket.on('disconnect', () => {
      resolve(0);
    });
  });
}
