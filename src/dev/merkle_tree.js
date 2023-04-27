const {MerkleNode} = require('./merkle_node')
const {Direction, MerkleProofHash} = require('./merkle_proof_hash')
const {secureHash} = require('./util')

class MerkleTree {
  constructor () {
    this.rootNode = null
    this.nodes = []
    this.leaves = []
  }
  getRoot(){
      const root = this.rootNode;
      return root;
  }
  appendLeaf (arg) {
    const node = (typeof arg === 'string')
      ? new MerkleNode(arg) : arg
    this.nodes.push(node)
    this.leaves.push(node)
    return node
  }

  addTree (tree) {
    tree.leaves.forEach(l => this.appendLeaf(l))
    return this.buildTree()
  }

  buildTree (nodes) {
    if (nodes === undefined || Object.entries(nodes).length == 0){
        console.log('undefined!');
        nodes = this.leaves
    }
    if (nodes.length === 1|| Object.entries(nodes).length == 0 ){
        if (Object.entries(nodes).length == 0) this.rootNode = '0';
        else this.rootNode = nodes[0]

        //console.log('length is 1');
    }
    else {
      const parents = []
      for (let i = 0; i < nodes.length; i += 2) {// 0, 2, 4, 6
        //console.log(i);
          // 1, 3, 5
        const right = (i + 1 < nodes.length) ? nodes[i + 1] : null
          // generate parents node i, i+1
          //         p1 <- 0  1
          //         p2 <- 2  3
          //         p3 <- 4  5
          //        (x) p4 <- 6  null
          //  ------------ 1Phase------------
          //         pp1 <- p1(0)  p2(1)
          //         pp2 <- p3(2)  p4(3)
          //
          //  ------------ 2Phase------------
          //        ppp1 <- pp1  pp2
          //  ------------ 3Phase------------

        parents.push(new MerkleNode(nodes[i], right))
      }
      //console.log('parants lengths is... %d', parents.length);
        this.buildTree(parents);
    }
  }

  findLeaf (hash) {
    return this.leaves.filter(l => l.hash === hash)[0]
  }

  // audit proof
  auditProof (leafHash) {
    const auditTrail = []
    const leaf = this.findLeaf(leafHash)
    if (leaf !== undefined) this.buildAuditTrail(auditTrail, leaf.parent, leaf)
    return auditTrail
  }

  buildAuditTrail (auditTrail, parent, child) {
    if (parent !== null) {
      const [nextChild, direction] = parent.leftNode === child
        ? [parent.rightNode, Direction.LEFT] : [parent.leftNode, Direction.RIGHT]
      if (nextChild !== null) {
        auditTrail.push(new MerkleProofHash(nextChild.hash, direction))
      }
      this.buildAuditTrail(auditTrail, parent.parent, child.parent)
    }
  }

  verifyAuditProof (rootHash, leafHash, auditTrail) {
    const testHash = auditTrail.reduce((a, e) => e.direction === Direction.LEFT
      ? secureHash(a + e.hash) : secureHash(e.hash + a), leafHash)
    return rootHash === testHash
  }

  consistencyProof (totalLeaves) {
    const hashNodes = []
    const n = Math.floor(Math.log2(totalLeaves))
    let node = this.leaves[0]
    for (let i = 0; i < n; ++i) node = node.parent
    let leavesFound = node.getLeaves(node).length
    hashNodes.push(new MerkleProofHash(node.hash, Direction.OLDROOT))
    if (totalLeaves > leavesFound) {
      let siblingNode = node.parent.rightNode
      while (true) {
        const snLeavesCount = siblingNode.getLeaves().length
        if (snLeavesCount + leavesFound === totalLeaves) {
          hashNodes.push(new MerkleProofHash(siblingNode.hash, Direction.OLDROOT))
          break
        }
        if (totalLeaves - leavesFound > snLeavesCount) {
          hashNodes.push(new MerkleProofHash(siblingNode.hash, Direction.OLDROOT))
          siblingNode = siblingNode.parent.rightNode
          leavesFound += snLeavesCount
        } else siblingNode = siblingNode.leftNode
      }
    }
    return hashNodes
  }

  consistencyAuditProof (nodeHash) {
    const auditTrail = []
    const node = this.rootNode.single(n => n.hash === nodeHash)
    this.buildAuditTrail(auditTrail, node.parent, node)
    return auditTrail
  }

  verifyConsistencyProof (oldHash, proof) {
    if (proof.length === 1) return proof[0].hash === oldHash
    let lhash = proof[proof.length - 2].hash
    let hidx = proof.length - 1
    let rhash = secureHash(lhash, proof[hidx].hash)
    let hash = rhash
    hidx -= 2

    while (hidx >= 0) {
      lhash = proof[hidx].hash
      hash = rhash = secureHash(lhash, rhash)
      --hidx
    }
    return hash === oldHash
  }
}

module.exports = {MerkleTree}


