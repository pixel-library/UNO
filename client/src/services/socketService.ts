import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  public getSocket(): Socket {
    if (!this.socket) {
      const isDev = window.location.port === '3000' || window.location.port === '5173';
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL ||
        (isDev
          ? `${window.location.protocol}//${window.location.hostname}:5000`
          : window.location.origin);

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000
      });
    }
    return this.socket;
  }
}

export const socketService = new SocketService();
