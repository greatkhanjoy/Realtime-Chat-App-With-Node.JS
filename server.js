const express = require('express')
const app = express()
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const formatMessage = require('./utill/message')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utill/users')
const botName = 'Chat Bot'

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    // Broadcast when user connects
    socket.emit('message', formatMessage(botName, 'Welcome to the chat'))

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, ` ${user.username} has joined the chat`)
      )
    // Send Room user lists
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // Listen for chat message
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // Broadcast when user disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      )
      // Send Room user lists
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

app.use(express.static(path.join(__dirname, 'public')))
const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
