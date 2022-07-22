const CustomObservable = require('./index')
describe('CustomObservable > index.js', () => {
  it('should call subscribe callback on next', (done) => {
    const customObservable = new CustomObservable()
    customObservable.subscribe(() => done())
    customObservable.next()
  })
  it('should call subscribe with args callback on next args', (done) => {
    const customObservable = new CustomObservable()
    const objectReference = { a: 'test' }
    customObservable.subscribe((arg1, arg2, arg3, arg4) => {
      expect(arg1).toBe('test')
      expect(arg2).toBe(1)
      expect(arg3).toBe(true)
      expect(arg4).toBe(objectReference)
      done()
    })
    customObservable.next('test', 1, true, objectReference)
  })
  it('should call multiple subscribe callback on next', (done) => {
    const customObservable = new CustomObservable()
    let nbCalls = 0
    const checknbCalls = () => {
      if(++nbCalls === 2) done()
    }
    customObservable.subscribe(() => checknbCalls())
    customObservable.subscribe(() => checknbCalls())
    customObservable.next()
  })
})