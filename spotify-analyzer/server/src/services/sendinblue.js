const sibApikey = process.env.SIB_APIKEY;
const axios = require('axios')
const sib = axios.create({
  baseURL: 'https://api.sendinblue.com/v3',
  headers: {
    'api-key': sibApikey
  }
})


if (!sibApikey) {
  console.error('Api key sendinblue required')
  process.exit(1)
}


module.exports = {
  async send(toEmail, toName, msg) {
    if (!toEmail) throw new Error('To email required')
    if (!toName) throw new Error('To name required')
    if (!msg) throw new Error('Msg required')
    const email = 'corentinlabroche@gmail.com'
    if(process.env.NODE_ENV !== 'production') return
    await sib.post("/smtp/email", {
      sender: {
        name: 'Spotify Analyzer', email
      },
      to: [{
        email: toEmail,
        name: toName
      }],
      replyTo: {
        email
      },
      htmlContent: msg,
      subject: `Connection expiré à Spotify Analyzer`,
      tags: ['notify', 'spotify-analyzer.corentinlabroche.fr']
    })
  }
}