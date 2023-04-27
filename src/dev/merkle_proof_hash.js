const Direction = {
  'LEFT': 'left',
  'RIGHT': 'right',
  'OLDROOT': 'oldRoot'
}

class MerkleProofHash {
  constructor (hash, direction) {
    this.hash = hash
    this.direction = direction
  }
}

module.exports = {MerkleProofHash, Direction}
