const {secureHash} = require('./util')

class MerkleNode {
  constructor (args) {
    this.hash = 0
    this.leftNode = null
    this.rightNode = null
    this.parent = null
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      // this is a leaf node
      //console.log(arguments[0]);
      this.hash = secureHash(arguments[0])
      //console.log(this.hash);
    } else {
      // this is a parent node
      this.leftNode = arguments[0]
      this.rightNode = arguments[1] === undefined ? null : arguments[1]
      this.leftNode.parent = this
      if (this.rightNode !== null) this.rightNode.parent = this
      this.computeHash()
    }
  }

  isLeaf (node) {
    if (node === undefined) node = this
    return node.leftNode === null && node.rightNode === null
  }

  computeHash (msg) {
    if (this.leftNode !== null) {
      if (this.rightNode === null) this.hash = this.leftNode.hash
      else {
        this.hash = secureHash(this.leftNode.hash +
        (this.rightNode !== null ? this.rightNode.hash : ''))
      }
    } else this.hash = secureHash(msg)
    // recursively update hash of parents (if any)
    if (this.parent !== null) this.parent.computeHash()
  }

  setLeftNode (node) {
    this.leftNode = node
    this.leftNode.parent = this
    this.computeHash()
  }

  setRightNode (node) {
    this.rightNode = node
    this.rightNode.parent = this
    this.computeHash()
  }

  verifyHash () {
    // verify the hash of the node w.r.t to its children
    if (this.isLeaf() === true) return true
    if (this.rightNode === null) return this.hash === this.leftNode.hash
    return this.hash === secureHash(this.leftNode.hash + this.rightNode.hash)
  }

  single (f, node) {
    // find the first child satisfying the condition
    if (node === undefined) node = this
    if (node !== null) {
      if (f(node) === true) return node
      return this.single(f, node.leftNode) || this.single(f, node.rightNode)
    }
  }

  where (f, node, arr = []) {
    // find all the children satisfying the condition
    if (node === undefined) node = this
    if (node === null) return arr
    if (this.isLeaf(node) === true) {
      if (f(node) === true) {
        return [...arr, node]
      }
      return arr
    }
    return [...this.where(f, node.leftNode, arr),
      ...this.where(f, node.rightNode, arr)]
  }

  getLeaves (node, leaves = []) {
    // get leaves under this node
    return this.where(n => this.isLeaf(n), node)
  }
}

module.exports = {MerkleNode}
