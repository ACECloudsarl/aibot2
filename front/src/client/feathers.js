// Update your feathers.js file to point to your Feathers backend
import feathers from '@feathersjs/client';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

// API URL pointing to your Feathers backend
const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');

// Configure Feathers client
const client = feathers();

// Setup Socket.io
client.configure(socketio(socket));

// Configure authentication
client.configure(auth({
  storageKey: 'auth-jwt',
  storage: typeof window !== 'undefined' ? window.localStorage : null
}));

export default client;