const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
// @ts-ignore
const envs = isBrowser() ? env : process.env
function get() {
  return {
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || undefined,
    URL_CORE: envs.URL_CORE || process.env.VITE_APP_URL_CORE,
    URL_FRONT_ADMIN: envs.URL_FRONT_ADMIN || process.env.VITE_APP_URL_FRONT_ADMIN,
  }
}
module.exports = get()