#!/usr/bin/env node
const express = require('express')
const path = require('path')
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const axios = require('axios')

const sibApikey = process.env.SIB_APIKEY || '';
const sib = axios.create({
  baseURL: 'https://api.sendinblue.com/v3',
  headers: {
    'api-key': sibApikey
  }
})

express()
  .use(cors())
  .use(helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'", "https://api.openweathermap.org"],
        "img-src": ["'self'", "https://openweathermap.org"],
        "object-src": ["'self'", "https://openweathermap.org"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }))
  .use(compression())
  .post('/send', async (req, res) => {
    if (!sibApikey) return res.status(500).send('Email provider not configured')
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
  .use(express.static(path.resolve(__dirname, 'dist')))
  .use((req, res) => {
    res.type('.html').sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  }).listen(process.env.PORT || 3203, () => {
    console.info('Magic happens on port ', process.env.PORT || 3203)
  })