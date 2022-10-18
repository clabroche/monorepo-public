/**
 * @param {string} id 
 * @param {import('socket.io').Socket} socket
 */
function CustomId(id, socket) {
  /** @type {string | undefined} */
  this.id = id
  /** @type {import('socket.io').Socket | undefined} */
  this.socket = socket
}


module.exports = CustomId