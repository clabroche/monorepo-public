const { controllers: authControllers } = require('@clabroche-org/mybank-modules-auth')
const { express } = require('@clabroche-org/common-express')

const router = express.Router()

router.use('/', authControllers)
router.use('/albums', require('./albums'))
router.use('/artists', require('./artists'))
router.use('/tracks', require('./tracks'))
router.use('/histories', require('./histories'))
router.use('/stats', require('./stats'))
router.use('/spotify-auth', require('./spotify-auth'))

module.exports = router