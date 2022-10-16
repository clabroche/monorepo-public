const { express } = require('@clabroche-org/common-express')
const router = express.Router()

router.use('/', (req, res, next) => {
  console.log('hey')
})
module.exports = router