const app = require('../dist/index.js')

module.exports = (req, res) => {
  return app.default(req, res)
}