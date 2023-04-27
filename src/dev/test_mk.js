const assert = require('assert')
const {MerkleTree} = require('./merkle_tree')
const {MerkleNode} = require('./merkle_node')
const {secureHash} = require('./util')


const nodes = ['hi', 'there', 'what','Um', 'Jun', 'Sik'];

const transaction = {
    amount: 30,
    sender: 'asdasdqrqacnfdbc',
    recipient: 'aqntnvox'
};
const transaction2 = {
    amount: 30,
    sender: 'asddasdqrqacnfdbc',
    recipient: 'adqntnvox'
};
const transaction3 = {
    amount: 30,
    sender: 'asdasaddqrqacnfdbc',
    recipient: 'aqntdnvox'
};
const transaction4 = {
    amount: 30,
    sender: 'asdasgdqrqacnfdbc',
    recipient: 'aqngtnvox'
};

const transaction5 = {
    amount: 30,
    sender: 'asdasdqarqacnfdbc',
    recipient: 'aqntnavox'
};
const transaction6 = {
    amount: 30,
    sender: 'asdasadqfrqacnfdbc',
    recipient: 'aqnvbtnvox'
};
const transaction7 = {
    amount: 30,
    sender: 'asdasgdqrqacnfdbc',
    recipient: 'aqngtnvox'
};
const transaction8 = {
    amount: 30,
    sender: 'asdasgdqrqacnfdbc',
    recipient: 'aqngtnvox'
};
const transaction9 = {
    amount: 30,
    sender: 'asdasgdqrqacnfdbc',
    recipient: 'aqngtnvox'
};
const transaction10 = {
    amount: 30,
    sender: 'asdasgdqrqacnfdbc',
    recipient: 'aqngtnvox'
};

const pendingtr = [transaction, transaction2, transaction3, transaction4, transaction5, transaction6, transaction7, transaction8, transaction9, transaction10];

const mt = new MerkleTree();
mt.nodes = mt.leaves = pendingtr.map(s => new MerkleNode(s))
console.log(mt.nodes);
mt.buildTree();
//console.log(mt.rootNode.hash);
//mt.appendLeaf('mf');
//mt.appendLeaf('ralo');
//mt.appendLeaf('chan ho');
//mt.appendLeaf('un jun sik');
console.log(mt);
//mt.addTree(mt);
//console.log(mt);
