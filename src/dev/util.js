const cryptoJS = require('crypto-js');
const sha256 = require('sha256');
function secureHash (msg) {
  //msg = Array.from(arguments).join('')
  // object to hash value
  const dataAsString = JSON.stringify(msg)
  const hash = sha256(dataAsString);
  return hash.toString();//cryptoJS.SHA256(msg).toString()
}

module.exports = {secureHash}
