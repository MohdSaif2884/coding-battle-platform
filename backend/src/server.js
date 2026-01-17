 const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// In-memory storage
const rooms = new Map()

// Sample problem
const sampleProblem = {
  title: 'Two Sum',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Write a function twoSum(nums, target) that returns an array of two indices.',
  testCases: [
    { input: '[2,7,11,15], 9', output: '[0,1]' },
    { input: '[3,2,4], 6', output: '[1,2]' },
    { input: '[3,3], 6', output: '[0,1]' }
  ]
}

// Initialize room
function initRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      users: [],
      timeLeft: 1800,
      status: 'waiting',
      winner: null,
      problem: sampleProblem,
      timer: null
    })
  }
  return rooms.get(roomId)
}

// Start timer
function startTimer(roomId) {
  const room = rooms.get(roomId)
  if (!room || room.timer) return

  room.timer = setInterval(() => {
    room.timeLeft -= 1
    io.to(roomId).emit('timer-update', room.timeLeft)

    if (room.timeLeft <= 0) {
      clearInterval(room.timer)
      room.status = 'finished'
      io.to(roomId).emit('battle-ended', { winner: null })
    }
  }, 1000)
}

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', ({ roomId, user }) => {
    const room = initRoom(roomId)
    
    if (!room.users.find(u => u.id === user.id)) {
      room.users.push({
        id: user.id || socket.id,
        username: user.username || 'Anonymous',
        avatar: user.avatar || '',
        rating: user.rating || 1200
      })
    }

    socket.join(roomId)
    
    if (room.users.length === 2 && room.status === 'waiting') {
      room.status = 'active'
      startTimer(roomId)
    }

    io.to(roomId).emit('room-state', room)
  })

  socket.on('code-change', ({ roomId, userId, code }) => {
    socket.to(roomId).emit('code-update', { userId, code })
  })

  socket.on('submit-solution', ({ roomId, userId, username }) => {
    const room = rooms.get(roomId)
    if (!room || room.winner) return

    room.winner = userId
    room.status = 'finished'
    clearInterval(room.timer)

    io.to(roomId).emit('battle-ended', { winner: userId })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Code Execution API
app.post('/api/execute', async (req, res) => {
  const { code, language, testCases } = req.body

  try {
    let allPassed = true
    let output = ''

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i]
      try {
        const [numsStr, targetStr] = tc.input.split(',').map(s => s.trim())
        const nums = JSON.parse(numsStr)
        const target = parseInt(targetStr)

        const userCode = code + `\ntwoSum(${JSON.stringify(nums)}, ${target})`
        const result = eval(userCode)
        
        const expected = JSON.parse(tc.output)
        const passed = JSON.stringify(result) === JSON.stringify(expected)
        
        output += `Test Case ${i + 1}: ${passed ? '✓ PASSED' : '✗ FAILED'}\n`
        output += `Input: ${tc.input}\n`
        output += `Expected: ${tc.output}\n`
        output += `Got: ${JSON.stringify(result)}\n\n`

        if (!passed) allPassed = false
      } catch (error) {
        output += `Test Case ${i + 1}: ✗ ERROR\n${error.message}\n\n`
        allPassed = false
      }
    }

    res.json({ output, allPassed })
  } catch (error) {
    res.json({ output: `Error: ${error.message}`, allPassed: false })
  }
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})