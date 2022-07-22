const express = require('express')
const nodeCls = require('./nodeCls')
const request = require("supertest");
const PromiseB = require('bluebird');

describe('Auth', () => {
  it('shouldwork', async () => {
    nodeCls.createContext()
    nodeCls.setItem('test', '123')
    const res = nodeCls.getItem('test')
    expect(res).toBe('123')
  })
  it('should get correct jwt with node cls core implementation', async() => {
    const server = request(getServerWithCoreNodeCls());
    const test1 = await PromiseB.map([server.get('/jwt'), server.get('/jwt2')], (res) => res.body)
    const test2 = await PromiseB.map([server.get('/jwt2'), server.get('/jwt')], (res) => res.body)
    expect(test1).toEqual([{ id: 'jwt', value: 'jwt' }, { id: 'jwt2', value: 'jwt2' }])
    expect(test2).toEqual([{ id: 'jwt2', value: 'jwt2' }, { id: 'jwt', value: 'jwt' }])
  })
  it('should get correct jwt with wrapper for express', async () => {
    const server = request(getServerWithWrapper());
    const test1 = await PromiseB.map([
      server.get('/jwt').set('authorization', 'jwt1'),
      server.get('/jwt2').set('authorization', 'jwt2')
    ], (res) => res.body)
    const test2 = await PromiseB.map([
      server.get('/jwt2').set('authorization', 'jwt2'),
      server.get('/jwt').set('authorization', 'jwt1')
    ], (res) => res.body)
    expect(test1).toEqual([{ id: 'jwt1', value: 'jwt1' }, { id: 'jwt2', value: 'jwt2' }])
    expect(test2).toEqual([{ id: 'jwt2', value: 'jwt2' }, { id: 'jwt1', value: 'jwt1' }])
  })
  it('should crud', (done) => {
    nodeCls.middleware({headers: {authorization: null}}, {}, () => {
      nodeCls.setItem('ppp', 'aaa')
      expect(nodeCls.getItem('ppp')).toBe('aaa')
      nodeCls.removeItem('ppp')
      expect(nodeCls.getItem('ppp')).toBe(undefined)
      done()
    })
  })
})

function getServerWithCoreNodeCls() {
  const app = express()
  const fct = async () => {
    const jwt = nodeCls.getItem('jwt')
    return jwt
  }
  app.use(function (req, res, next) {
    nodeCls.createContext()
    nodeCls.setItem('req', req)
    nodeCls.setItem('res', req)
    nodeCls.setItem('jwt', req.headers.authorization)
    next()
  });
  app.get('/jwt', async (req, res) => {
    nodeCls.setItem('jwt', 'jwt')
    await new Promise(resolve => setTimeout(resolve, 100))
    res.send({ id: 'jwt', value: await fct()})
  })
  app.get('/jwt2', async (req, res) => {
    nodeCls.setItem('jwt', 'jwt2')
    await new Promise(resolve => setTimeout(resolve, 10))
    res.send({ id: 'jwt2', value: await fct() })
  })
  return app
}


function getServerWithWrapper() {
  const app = express()
  const fct = async () => {
    return nodeCls.getItem('jwt')
  }
  app.use(nodeCls.middleware)
  app.get('/jwt', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 100))
    res.send({ id: 'jwt1', value: await fct() })
  })
  app.get('/jwt2', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 10))
    res.send({ id: 'jwt2', value: await fct() })
  })
  return app
}
