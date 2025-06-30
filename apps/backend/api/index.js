const app = require('../dist/app.js')

module.exports = (req, res) => {
  return app.default(req, res)
}
