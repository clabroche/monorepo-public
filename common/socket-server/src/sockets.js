const {Server} = require('socket.io');
const CustomIds = require('./models/CustomIds');
module.exports = {
  /** @type {Server | null} */
  io: null,
  emit(customId, channel, ...data) {
    const socket = CustomIds.getSocketFromId(customId)
    if(socket) {
      socket.emit(channel, ...data)
    }

  },
  connect(server, origin) {
    this.io = new Server(server, {
      cors: {
        origin,
        methods: ['GET', 'POST']
      }
    });
    this.io.on('connect', (socket) => {
      socket.on('socket:register', (id) => {
        CustomIds.linkSocket(id, socket)
      })
      socket.on('disconnect', () => {
        CustomIds.unlinkSocket(socket)
      })
    })
  }
}
