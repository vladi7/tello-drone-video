const dgram = require('dgram');
const app = require('express')();
const http = require('http').Server(app);
const socket_io = require('socket.io')(http);
const throttle = require('lodash/throttle');
const TELLO_VIDEO_PORT = 11111
const TELLO_HOST = '192.168.10.1'

const PORT = 8889;
const HOST = '192.168.10.1';
const droneSocket = dgram.createSocket('udp4');
droneSocket.bind(PORT);

function parseState(state) {
  return state
    .split(';')
    .map(x => x.split(':'))
    .reduce((data, [key, value]) => {
      data[key] = value;
      return data;
    }, {});
}

const stateOfTheDrone = dgram.createSocket('udp4');

stateOfTheDrone.bind(8890);

droneSocket.on('message', response => {
  console.log(`Drone's Response : ${response}`);
  socket_io.sockets.emit('status', response.toString());
});

function handleError(error) {
  if (error) {
    console.log('ERROR ' + error);
  }
}

socket_io.on('connection', socket => {
  socket.on('command', command => {
    console.log('command received: ' + command);
    droneSocket.send(command, 0, command.length, PORT, HOST, handleError);
  });
  socket.emit('status', 'ConnectionSuccessful');
});

stateOfTheDrone.on(
  'message',
  throttle(state => {
    socket_io.sockets.emit('stateOfTheDrone', parseState(state.toString()));
  }, 100)
);

http.listen(7777, () => {
  console.log('Server is up!');
});
