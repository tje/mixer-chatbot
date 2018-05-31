/**
 * Example 3: Basic "!quote" system.
 *
 * Every time this script starts running, it starts with an empty quotes list.
 * Users can add new quotes or retrieve random ones with a chat command.
 *
 * Add a new quote:
 *    !quote add "This is a new quote!" - Somebody Famous
 *
 * Paste a random saved quote:
 *    !quote
 */

const ChatBot = require('../index')

const bot = new ChatBot('<CHAT TOKEN>')

bot.joinChannel('<MIXER CHANNEL>')
.then(socket => {
  // Start with an empty list of quotes
  const quotes = []

  socket.on('chat:message', msg => {
    // If the message is just "!quote", then paste a random quote
    if (msg.text === '!quote') {
      if (quotes.length === 0) {
        msg.reply('There are no quotes :(')
      } else {
        const quote = quotes[Math.floor(Math.random() * quotes.length)]
        msg.reply(`"${quote.text}" - ${quote.author}`)
      }
      return // Return early, we are done with this message
    }

    // Save a new quote if the chat message starts with "!quote add "
    if (msg.text.startsWith('!quote add ')) {
      // Search the message for text inside of "quotes", and an optional
      // author name
      const matches = msg.text.match(/^!quote add "(.+)"[\s\-]*([\w\s]+)?$/i)

      // If the above search failed, then the message isn't formatted right,
      // let the user know and then skip the rest of this code
      if (matches === null) {
        msg.reply(
          'Error saving quote, is it formatted correctly? \
          (example: !quote add "Some text here" - Author)'
        )
        return // Return early
      }

      // Extract the quote and optional author from the message
      const [, newQuote, author] = matches

      // Add the new quote to the quotes list
      quotes.push({
        text: newQuote,
        author: author || msg.author,
        timestamp: new Date()
      })
      msg.reply('Quote added!')
    }
  })
})