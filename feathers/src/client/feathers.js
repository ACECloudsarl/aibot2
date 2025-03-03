// src/client/feathers.js

import feathers from '@feathersjs/client';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

// API URL (adjust based on your configuration)
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3030');

// Configure Feathers client
const client = feathers();

// Setup Socket.io
client.configure(socketio(socket));

// Configure authentication
client.configure(auth({
  storageKey: 'auth-jwt',
  storage: window.localStorage
}));

export default client;
