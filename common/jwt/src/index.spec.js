const env = require('@clabroche-org/mybank-libs-env')
const jwt = require('./index')
const mockBearer = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImlhdCI6MTYyMTcyMDIzNH0.P-qqdX2Hy7Hf66VTTKEkPEqw_XnETZiW-PVxIKZHMuQ'
describe('JWT', () => {
  it('should sign', async () => {
    const jwtGenerated = jwt.sign({
      user_id: 123
    })
    expect(jwtGenerated).toHaveLength(mockBearer.length)
  })
  it('should throw error if no JWT_PRIVATE_KEY', async () => {
    const backup = env.JWT_PRIVATE_KEY
    env.JWT_PRIVATE_KEY = null
    expect(() => jwt.sign({ user_id: 123 })).toThrowError('JWT_PRIVATE_KEY env not present')
    env.JWT_PRIVATE_KEY = backup
  })

  it('should verify', async () => {
    const jwtGenerated = jwt.sign({ user_id: 123 })
    const verif = jwt.verify(jwtGenerated)
    expect(verif.user_id).toEqual(123)
  })
  it('should failed to verify', async () => {
    const verif = jwt.verify('lkjlkj')
    expect(verif).toBeUndefined()
  })
  it('should decode', async () => {
    const jwtGenerated = jwt.sign({ user_id: 123 })
    const verif = jwt.decode(jwtGenerated)
    expect(verif.user_id).toEqual(123)
  })
  it('should throw error if no JWT_PRIVATE_KEY', async () => {
    const backup = env.JWT_PRIVATE_KEY
    env.JWT_PRIVATE_KEY = null
    expect(() => jwt.verify(mockBearer)).toThrowError('JWT_PRIVATE_KEY env not present')
    env.JWT_PRIVATE_KEY = backup
  })
})
