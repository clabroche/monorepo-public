const CustomId = require('./CustomId')

/** @type {Map<string, import('./CustomId')>} */
const customIds = new Map()
/** @type {Map<string, import('./CustomId')>} */
const socketIds = new Map()
module.exports = {
  /**
   * @param {string} id
   * @param {import('socket.io').Socket} socket
   */
  linkSocket(id, socket) {
    customIds.set(id, new CustomId(id, socket))
    socketIds.set(socket.id, new CustomId(id, socket))
  },

    /**
   * @param {import('socket.io').Socket} socket
   */
  unlinkSocket(socket) {
    customIds.delete(socket.id)
    socketIds.delete(socket.id)
  },
  /**
   * @param {import('socket.io').Socket} socket
   * @returns {string | undefined}
   */
  getIdFromSocket(socket) {
    return socketIds.get(socket.id)?.id
  },

  /**
   * @param {string} id
   * @returns {import('socket.io').Socket | undefined}
   */
  getSocketFromId(id) {
    return customIds.get(id)?.socket
  }
}