const cryptoJS = require('crypto-js')

function secureHash (msg) {
  msg = Array.from(arguments).join('')
  return cryptoJS.SHA256(msg).toString()
}

module.exports = {secureHash}
