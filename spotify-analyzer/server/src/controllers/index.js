const { controllers: authControllers, controllers } = require('@clabroche-org/mybank-modules-auth')
const { express } = require('@clabroche-org/common-express')
const { controllers: controllersRoom } = require('@iryu54/room-lib-server')
const { Room } = require('@iryu54/room-lib-server').models
class Game {
  constructor() {
    
  }
}
Room.Game = Game 

const router = express.Router()

router.use('/', authControllers)
router.use('/spotify', require('./spotify'))
router.use('/rooms', controllersRoom.routes)

module.exports = router