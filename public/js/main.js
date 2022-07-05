const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

if (!username || !room) {
  location.href = '/'
}

const socket = io()
const chatBody = document.getElementById('chat-message')
const msg = document.getElementById('message')
const btn = document.getElementById('send-message')

socket.emit('joinRoom', { username, room })

socket.on('roomData', (data) => {
  setRoomName(data.room)
  setRoomUsers(data.users)
})

socket.on('message', (message) => {
  outputMessage(message)
})

function setRoomName(name) {
  document.getElementById('room-name').innerText = name
}

function setRoomUsers(users) {
  document.getElementById('room-users').innerHTML = ''
  for (let i = 0; i < users.length; i++) {
    document.getElementById(
      'room-users'
    ).innerHTML += `<p class="bg-[#394360] px-5 py-2" >${users[i].username}</p>`
  }
}

// onClick event for send button
btn.addEventListener('click', () => {
  if (msg.value.trim() !== '') {
    socket.emit('chatMessage', msg.value)
    msg.value = ''
  }
})

// on press enter
msg.addEventListener('keypress', () => {
  if (event.keyCode === 13 && msg.value.trim() !== '') {
    socket.emit('chatMessage', msg.value)
    msg.value = ''
  }
})

function outputMessage(message) {
  chatBody.innerHTML += `
              <div class="flex-col text-black p-2 message">
                <div class="meta text-gray-400">${message.username} <span class="text-sm"> ${message.time} </span>
                </div>
                <div class="bg-[#e6e6fa] rounded-md p-4">
                  ${message.text}
                </div>
              </div>`
  chatBody.scrollTop = chatBody.scrollHeight
}
