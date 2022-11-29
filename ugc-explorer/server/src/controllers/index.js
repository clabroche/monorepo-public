const { controllers: authControllers } = require('@clabroche-org/mybank-modules-auth')
const { express } = require('@clabroche-org/common-express')

const router = express.Router()

router.use('/', authControllers)
router.use('/screenings', require('./screenings'))

module.exports = router