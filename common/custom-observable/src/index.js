class CustomObservable {
  constructor() {
    this.funcs = []
  }
  subscribe(fun) {
    this.funcs.push(fun)
  }
  next(...value) {
    this.funcs.forEach(f => f(...value))
  }
}

module.exports = CustomObservable