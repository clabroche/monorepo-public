const express = require('express')
const {default: helmet} = require('helmet')
const app = express()
const path = require('path')
const cors = require('cors')
const compression = require('compression')

/** sendinblue */
const sibApikey = process.env.SIB_APIKEY;
const axios = require('axios').default
const sib = axios.create({
  baseURL: 'https://api.sendinblue.com/v3',
  headers: {
    'api-key': sibApikey
  }
})

app.use(cors())
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'", "https://api.openweathermap.org"],
      "img-src": ["'self'", "https://openweathermap.org"],
      "object-src": ["'self'", "https://openweathermap.org"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin'}
}))
app.use(compression())

app.post('/send', async (req, res) => {
  if(!sibApikey) return res.status(500).send('Email provider not configured')
  const { name, msg, email } = req.body
  if (!name) return res.status(400).send('Name required')
  if (!msg) return res.status(400).send('Msg required')
  if (!email) return res.status(400).send('Email required')
  await sib.post("/smtp/email", {
    sender: {
      name: 'corentinlabroche.fr', email
    },
    to: [{
      email: 'corentinlabroche@gmail.com',
      name: 'Corentin Labroche'
    }],
    replyTo: {
      email
    },
    templateId: 1,
    params: {
      NAME: name,
      MSG: msg,
      EMAIL: email
    },
    subject: `Prise de contact corentinlabroche.fr (${name})`,
    tags: ['contact', 'corentinlabroche.fr']
  })
    .then(() => res.send('ok'))
    .catch((err) => {
      console.error(err?.response?.data || err);
      res.status(500).send("An error was occured");
    })
})

app.use(express.static(path.resolve(__dirname, 'dist')))
app.use(function (req, res) {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

// eslint-disable-next-line
app.use(function (err, req, res, next) {
  // eslint-disable-next-line
  console.error(err)
  res.status(500).send('An error was occured')
})

app.listen(process.env.PORT || 3000, function () {
  // eslint-disable-next-line
  console.log('Example app listening on port ' + process.env.PORT || 3000 + '!')
})