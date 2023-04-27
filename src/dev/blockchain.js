const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');
const {MerkleTree} = require('./merkle_tree');
const {MerkleNode} = require('./merkle_node');
const {secureHash} = require('./util');


function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];
	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];
    //how to set genesisblock merkle root?
	this.createNewBlock(100, '0', '0', '0');
};


Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash, mktree) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
        // merkle_root value
        merkle_root: (mktree == '0') ? '0' : mktree.getRoot(),
		previousBlockHash: previousBlockHash
	};
    //if '/mine' initiate, pending transaction value mapped to merkle tree
    this.merkle_tree = mktree;
	this.pendingTransactions = [];
	this.chain.push(newBlock);

	return newBlock;
};


Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};


Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
	const newTransaction = {
		amount: amount,
		sender: sender,
		recipient: recipient,
		transactionId: uuid().split('-').join('')
	};

	return newTransaction;
};


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
    //
   // this.merkle.appendLeaf(transactionObj);
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()['index'] + 1;
};

/*
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    //이 부분에서 트랜잭션 조작이 발생하면 해시값이 바뀜
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};
*/

Blockchain.prototype.hashBlock = function(previousBlockHash, merkle_root, nonce){
    const dataAsString = previousBlockHash + nonce.toString() + merkle_root.hash;
    const hash = sha256(dataAsString);
    return hash;
};

/*
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockDataa) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}
	return nonce;
};
*/
Blockchain.prototype.proofOfWork = function(previousBlockHash, merkle_root) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, merkle_root, nonce);
	while (hash.substring(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, merkle_root, nonce);
	}
	return nonce;
};


Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;

	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
      	//const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['merkle_root'], index: currentBlock['index'] }, currentBlock['nonce']);

		if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']){
            validChain = false;
            console.log("This chain is invalid..");
            console.log("Current node previous hash: "+"%s",currentBlock['previousBlockHash']);
            console.log("manipulated previous block hash: "+"%s", prevBlock['hash']);
        }
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;
	//const correctTransactions = genesisBlock['merkle_root'].nodes.length === 0;


	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};


Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if (block.hash === blockHash) correctBlock = block;
	});
	return correctBlock;
};


Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.transactionId === transactionId) {
				correctTransaction = transaction;
				correctBlock = block;
			};
		});
	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};


Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.sender === address || transaction.recipient === address) {
				addressTransactions.push(transaction);
			};
		});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
		if (transaction.recipient === address) balance += transaction.amount;
		else if (transaction.sender === address) balance -= transaction.amount;
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};






module.exports = Blockchain;














