const { controllers: authControllers } = require('@clabroche/mybank-modules-auth')
const { express } = require('@clabroche/common-express')

const router = express.Router()

router.use('/', authControllers)
router.use('/screenings', require('./screenings'))

module.exports = router