const Mixer = require('beam-client-node')
const { Carina } = require('carina')
const EventEmitter = require('events')
const ws = require('ws')
const ChatMessage = require('./ChatMessage')

Carina.WebSocket = ws

class ChannelSocket extends EventEmitter {
  constructor (bot, channel) {
    super()

    this.bot = bot
    this.channel = channel
    this.carina = null
    this.socket = null
  }

  async connect () {
    const { body: connection } = await this.bot.service.join(this.channel.id)
    const socket = new Mixer.Socket(ws, connection.endpoints).boot()
    await socket.auth(this.channel.id, this.bot.user.id, connection.authkey)
    this.socket = socket
    this.decorateSocket()

    this.carina = new Carina({ isBot: true }).open()
    this.decorateCarina()
  }

  decorateSocket () {
    const { socket } = this

    socket.on('ChatMessage', msg => this._relayEvent('chat:message', msg))
    socket.on('ClearMessages', () => this._relayEvent('chat:clear', null))
    socket.on('PurgeMessage', msg => this._relayEvent('chat:purge', msg))
    socket.on('DeleteMessage', msg => this._relayEvent('chat:delete', msg))

    socket.on('UserJoin', msg => this._relayEvent('user:join', msg))
    socket.on('UserLeave', msg => this._relayEvent('user:leave', msg))
    socket.on('UserTimeout', msg => this._relayEvent('user:timeout', msg))
    socket.on('UserUpdate', msg => this._relayEvent('user:update', msg))

    socket.on('PollStart', ev => this._relayEvent('poll:start', ev))
    socket.on('PollEnd', ev => this._relayEvent('poll:end', ev))
  }

  decorateCarina () {
    const { carina, channel } = this

    carina.subscribe(`channel:${channel.id}:followed`, msg => this._relayEvent('channel:followed', msg))
    carina.subscribe(`channel:${channel.id}:hosted`, msg => this._relayEvent('channel:hosted', msg))
    carina.subscribe(`channel:${channel.id}:unhosted`, msg => this._relayEvent('channel:unhosted', msg))
    carina.subscribe(`channel:${channel.id}:update`, msg => {
      for (const [prop, value] of Object.entries(msg)) {
        if (channel[prop] !== undefined) {
          channel[prop] = value
        }
      }
      if (msg.online !== undefined) {
        this._relayEvent(`channel:${msg.online ? 'online' : 'offline'}`, msg)
      }
      this._relayEvent('channel:update', msg)
    })
  }

  say (msg) {
    this.socket.call('msg', [msg])
  }

  whisper (user, msg) {
    this.socket.call('whisper', [user, msg])
  }

  // @todo figure out how to handle pagination
  async getUsers () {
    const { body: users } = await this.bot.service.getUsers(this.channel.id, {
      page: 0,
      limit: 100
    })
    return users
  }

  _relayEvent (name, packet) {
    let data = Object.assign({
      timestamp: new Date(),
      channel: this.channel
    }, packet)
    if (name === 'chat:message') {
      data = new ChatMessage(data, this.socket)
    }
    this.emit(name, data)
  }
}

module.exports = ChannelSocket
