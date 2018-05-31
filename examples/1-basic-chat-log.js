/**
 * Example 1: Basic chat log
 *
 * This script connects to a Mixer channel and logs all chat messages to the
 * console, including whispers.
 */
const ChatBot = require('../index')

const bot = new ChatBot('<CHAT TOKEN>')

bot.joinChannel('<MIXER CHANNEL>')
.then(socket => {
  console.log('Connected to channel')
  socket.on('chat:message', msg => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] ${msg.author}: ${msg.text}`)
  })
})