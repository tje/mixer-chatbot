const Mixer = require('beam-client-node')
const ChannelSocket = require('./ChannelSocket')

class ChatBot {
  constructor (token, opts = { logging: true }) {
    this.channels = new Map()

    this.logging = opts.logging
    this.decorateSockets = opts.decorateSockets
    this.user = null

    this.client = new Mixer.Client(new Mixer.DefaultRequestRunner())
    this.client.use(new Mixer.OAuthProvider(this.client, {
      tokens: {
        access: token,
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      }
    }))
    this.service = new Mixer.ChatService(this.client)
  }

  async authenticate () {
    this.log('Authenticating...')
    const res = await this.client.request('GET', 'users/current')
    this.log(`Authenticated as "${res.body.username}"`)
    return this.user = res.body
  }

  async joinChannel (channelId) {
    try {
      if (this.user === null) {
        await this.authenticate()
      }

      const channel = await this.resolveChannel(channelId)

      this.log('Connecting to chat service...')
      const socket = new ChannelSocket(this, channel)
      await socket.connect()
      this.log(`Connected to channel: ${channel.id}`)

      this.channels.set(channel.id, socket)
      return socket
    } catch (err) {
      this.log('error', err)
    }
  }

  async resolveChannel (channelId) {
    this.log(`Resolving channel: ${channelId}`)
    const uri = `channels/${channelId}`
    const { body: channel } = await this.client.request('GET', uri)
    this.log(`Discovered channel: ${channel.id} "${channel.name}"`)
    return channel
  }

  log (...msg) {
    if (this.logging !== true) {
      return
    }

    let fn = 'log'
    if (['log', 'error', 'warn'].includes(msg[0])) {
      fn = msg.shift()
    }

    console[fn](...msg)
  }
}

module.exports = ChatBot
