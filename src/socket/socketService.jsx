import { io } from 'socket.io-client';
import { updatedData } from '../redux/vehicleSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
let socket = null;

const connectSocket = (dispatch) => {
  return new Promise((resolve, reject) => {
    try {
      if (!SOCKET_URL) {
        return reject(new Error('❌ SOCKET_URL is not defined'));
      }

      // If socket already exists and is connected
      if (socket && socket.connected) {
        console.log('🟢 Socket already connected.');
        return resolve(socket);
      }

      // Initialize socket
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 2, // quicker fail
        reconnectionDelay: 1500,
        timeout: 2000, // fail faster
        forceNew: true,
      });

      // Failsafe timer (stop waiting after 5s max)
      const timer = setTimeout(() => {
        console.error('⏱️ Socket connection timed out');
        disconnectSocket();
        reject(new Error('Socket connection timed out'));
      }, 5000);

      // On successful connect
      socket.once('connect', () => {
        clearTimeout(timer);
        console.log('✅ Connected to WebSocket server');
        resolve(socket);
      });

      // On connection error
      socket.once('connect_error', (err) => {
        clearTimeout(timer);
        console.error('⚠️ Connection Error:', err.message || err);
        reject(err);
      });

      // On disconnect
      socket.on('disconnect', (reason) => {
        console.warn('❌ Disconnected from WebSocket:', reason);
      });

      // On reconnection failure
      socket.on('reconnect_failed', () => {
        console.error('🚫 All reconnection attempts failed.');
        disconnectSocket();
      });

      // GPS Data listener
      socket.off('gpsData');
      socket.on('gpsData', (data) => {
        try {
          dispatch(updatedData(data));
        } catch (error) {
          console.error('⚠️ Error dispatching GPS data:', error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const disconnectSocket = () => {
  try {
    if (socket) {
      socket.off('gpsData');
      socket.disconnect();
      socket = null;
      console.log('🔌 Socket manually disconnected');
    }
  } catch (error) {
    console.error('⚠️ Error disconnecting socket:', error);
  }
};

export { connectSocket, disconnectSocket, socket };
