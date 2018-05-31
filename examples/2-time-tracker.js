/**
 * Example 2: Track viewers' watch times.
 *
 * This keeps track of what time users have joined and left the channel. When a
 * user leaves, it logs the amount of time that they have spent in the channel.
 * Additionally, users can type "!time" in chat and the bot will respond with
 * the amount of time it has recorded for them in seconds.
 *
 * Check your watch time:
 *    !time
 */

const ChatBot = require('../index')

const bot = new ChatBot('<CHAT TOKEN>')

bot.joinChannel('<MIXER CHANNEL>')
.then(socket => {
  // Start with an empty list of users and their join times
  const userTimes = new Map()

  // Create a timestamp for when this script started running - any users that
  // were already in the channel before this script started running will just
  // fall back to this (we can't see into the past)
  const startTime = new Date()

  // Whenever a user joins, log it and record the time
  socket.on('user:join', ev => {
    userTimes.set(ev.username, new Date())
    console.log(`User joined: ${ev.username}`)
  })

  // When a user leaves, log it along with how long they were watching
  socket.on('user:leave', ev => {
    // Get the user's join time from the `userTimes` list above, or fall back
    // to `startTime` if we missed their join time
    const joinTime = userTimes.get(ev.username) || startTime

    // Subtract the current time from their join time
    const watchTime = Math.round((Date.now() - joinTime.getTime()) / 1000)

    // Log it!
    console.log(`User left: ${ev.username} (${watchTime}s)`)
  })

  socket.on('chat:message', msg => {
    // When someone says "!time", whisper them and tell them how long they've
    // been watching (in seconds)
    if (msg.text === '!time') {
      const joinTime = userTimes.get(msg.author) || startTime
      const watchTime = Math.round((Date.now() - joinTime.getTime()) / 1000)
      const response = `You have been watching for ${watchTime} seconds`
      socket.whisper(msg.author, response)
    }
  })
})