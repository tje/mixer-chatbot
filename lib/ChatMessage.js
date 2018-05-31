class ChatMessage {
  constructor (msg, socket) {
    this.author = msg.user_name
    this.text = msg.message.message.map(part => part.text).join('')
    this.type = msg.message.meta.whisper ? 'private' : 'public'
    this._raw = msg
    this._socket = socket
  }

  reply (msg, asWhisper) {
    const whisper = asWhisper !== undefined
      ? asWhisper
      : this._raw.message.meta.whisper === true

    let response = [msg]
    if (whisper) {
      response.unshift(this.author)
    }
    this._socket.call(whisper ? 'whisper' : 'msg', response)
  }
}

module.exports = ChatMessage
