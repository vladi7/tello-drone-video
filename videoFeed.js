const path = require('path')
const { spawn } = require('child_process')


const web_socket = require('ws')
const express = require('express')
const app = express()

const video_port = 11111
const video_ip = '192.168.10.1'

const server_ip = 'localhost'
const server_port = 3000


app.use(express.static(path.join(__dirname, 'public')))


app.post(`/tellostream`, (req, res) => {
  res.connection.setTimeout(0)
  console.log(
    `Video Stream Connected: ${req.socket.remoteAddress}:${req.socket.remotePort}`
  )
  req.on('data', function(data) {
    videoStreamServer.broadcast(data)
  })

  req.on('end', function() {
    console.log(
      `Video Stream Disconnected: ${req.socket.remoteAddress}:${req.socket.remotePort}`
    )
  })
})

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

const server = app.listen(server_port, server_ip, () => {
  const host = server.address().address
  const port = server.address().port
  console.log(`Started at http://${host}:${port}/`)
})

const videoStreamServer = new web_socket.Server({ server: server })

videoStreamServer.on('connection', function(socket, upgradeReq) {
  const remoteAddress = (upgradeReq || socket.upgradeReq).socket.remoteAddress

  console.log(
    `Connected: ${remoteAddress} (${videoStreamServer.clients.size} total)`
  )

  socket.on('close', function(code, message) {
    console.log(
      `Disconnected: ${remoteAddress} (${videoStreamServer.clients.size} total)`
    )
  })
})

videoStreamServer.broadcast = function(data) {
  videoStreamServer.clients.forEach(function each(client) {
    if (client.readyState === web_socket.OPEN) {
      client.send(data)
      console.log(data);
    }
  })
}

// command for terminal: ffmpeg -i udp://192.168.10.1:11111 -f mpegts -codec:v mpeg1video -s 640x480 -b:v 800k -r 20 -bf 0 http://127.0.0.1:4200/tellostream
const ffmpeg = spawn('ffmpeg', [
  '-hide_banner',
  '-i',
  `udp://${video_ip}:${video_port}`,
  '-f',
  'mpegts',
  '-codec:v',
  'mpeg1video',
  '-s',
  '640x480',
  '-b:v',
  '800k',
  '-bf',
  '0',
  '-r',
  '20',
  `http://${server_ip}:${server_port}/tellostream`
])

console.log(ffmpeg.stdout);
ffmpeg.stderr.on('data', data => {
  console.log(`stderr: ${data}`)
})
ffmpeg.stdout.on('data', data => {
  console.log(`data: ${data}`)
})

const handlerForExiting = options => {
  if (options.cleanup) {
    ffmpeg.stderr.pause()
    ffmpeg.stdout.pause()
    ffmpeg.kill()
  }
  if (options.exit) {
    process.exit()
  }
}

process.on('exit', handlerForExiting.bind(null, { cleanup: true }))
process.on('SIGINT', handlerForExiting.bind(null, { exit: true }))
process.on('SIGUSR1', handlerForExiting.bind(null, { exit: true }))
process.on('SIGUSR2', handlerForExiting.bind(null, { exit: true }))
process.on('uncaughtException', handlerForExiting.bind(null, { exit: true }))
