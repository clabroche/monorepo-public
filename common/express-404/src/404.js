module.exports = function (req, res) {
  res.status(404).send(`${req.method} ${req.url} not found`)
}
