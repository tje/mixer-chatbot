# Summary

An attempt to simplify chat bot creation on [Mixer](https://mixer.com/).

## Usage

Create a new `ChatBot` instance using your own authentication token, then
connect to a channel by calling the `joinChannel` method.

```js
const chatToken = 'your-secret-chat-token'
const channelId = 'MixerChannelName'

const bot = new ChatBot(chatToken)
bot.joinChannel(channelId)
.then(socket => {
  socket.on('chat:join', ({ username }) => console.log(`Joined: ${username}`))
  socket.on('chat:leave', ({ username }) => console.log(`Left: ${username}`))
  socket.on('chat:message', message => {
    console.log(`${message.author}: ${message.text}`)

    if (message.text.startsWith('!ping')) {
      message.reply('Pong!')
    }
  })
})
.catch(err => {
  console.error(err)
})
```

See the examples directory for more, uh... examples.

## Events

Many of these events have been aggregated from Mixer's own [beam-client-node](https://dev.mixer.com/reference/chat/index.html#chat__events) and [Constellation](https://dev.mixer.com/reference/constellation/index.html#events_live).
Each event relays the original event packet from Mixer, with the exception of
`chat:message`, which is unique in that it provides a `ChatMessage` object
instead for convenience.

| Event | Description |
| :--- | :--- |
| `chat:message` | A new chat message or a whisper is received. |
| `chat:clear` | Chat has been cleared. |
| `chat:purge` | A user has been banned or purged in chat. |
| `chat:delete` | A message has been deleted. |
| `user:join` | User joined chat. |
| `user:leave` | User left chat. |
| `user:timeout` | The bot has been timed out. |
| `user:update` | A user has been updated. |
| `poll:start` | A new poll has been started. |
| `poll:end` | A poll has ended. |
| `channel:followed` | Channel gained a new follower. |
| `channel:hosted` | Channel is being hosted. |
| `channel:unhosted` | Channel is no longer being hosted. |
| `channel:updated` | Channel has been updated. |
| `channel:online` | Stream has gone online. |
| `channel:offline` | Stream has stopped. |

### ChatMessage

The `ChatMessage` object has the following properties:

* `author`: The username of the sender.
* `text`: The chat message.
* `type`: Either "public" or "private" in the case of a whisper.
* `_raw`: The original payload from Mixer.

You can call the `reply(response[, asWhisper])` method to react immediately to
a chat message. The `asWhisper` parameter is optional and mimics the original
message's visibility (respond to whispers with a whisper), passing `true` or
`false` will force it to be a public or private response respectively.