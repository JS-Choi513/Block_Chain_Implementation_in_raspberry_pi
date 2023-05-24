const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');
const {MerkleTree} = require('./merkle_tree');
const {MerkleNode} = require('./merkle_node');
const {secureHash} = require('./util');

//const port = [3000, 3001, 3002, 3003, 3004, 3005];
const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// get entire blockchain
app.get('/blockchain', function (req, res) {
// try{
//      res.json(bitcoin);
//  }

//  catch{
//      for(output in bitcoin){
//          res.json(output);
//      }
//
//  }

  res.json(bitcoin);
});

// manipulate random block hash
app.get('/manipulate', function (req, res){
 //rnd_idx = Math.floor(Math.random()*(5+1));
 //target_port = port[rnd_idx];
 //console.log("Block manipulation occured in..."+"%d", target_port);
 let blk_length =  bitcoin.chain.length;
 // 1 ~ block lenght of current chain
 let target_blk_idx = Math.floor(Math.random()*(blk_length-2+1)) + 2;
 console.log(bitcoin.chain[target_blk_idx].hash);
 bitcoin.chain[target_blk_idx].hash = 'This hash value have been contamination';
 res.send(bitcoin.chain[target_blk_idx].hash);
});


// create a new transaction
app.post('/transaction', function(req, res) {
	const newTransaction = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});


// broadcast transaction
app.post('/transaction/broadcast', function(req, res) {
	const newTransaction = bitcoin.createNewTransaction(req.body.temperature, req.body.sender, req.body.recipient);
	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.' });
	});
});


// mine a block
app.get('/mine', function(req, res) {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock['index'] + 1
	};
    const mktree = new MerkleTree();
    console.log(bitcoin.pendingTransactions);

    mktree.nodes = mktree.leaves = bitcoin.pendingTransactions.map(s => new MerkleNode(s));
    mktree.buildTree();
    // root node hash? or root node?
	//const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const nonce = bitcoin.proofOfWork(previousBlockHash, mktree.getRoot());
	const blockHash = bitcoin.hashBlock(previousBlockHash, mktree.getRoot(), nonce);
	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash, mktree);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
                temperature: 0,
				sender: "00",
				recipient: nodeAddress
			},
            json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			//block: newBlock
		});
	});
});


// receive new block
app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = bitcoin.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex) {
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});


// register a node and broadcast it the network
app.post('/register-and-broadcast-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
    console.log(bitcoin.networkNodes.indexOf(newNodeUrl));
    console.log("dd");
    console.log(newNodeUrl);
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
 	if (nodeNotAlreadyPresent && notCurrentNode){
	  bitcoin.networkNodes.push(newNodeUrl);
	}else{
		res.json({note: 'Node was not added!'});
	}
	const regNodesPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(rp(requestOptions));
	});

	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
			json: true
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });
	});
});


// register a node with the network
app.post('/register-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = bitcoin.currentNodeUrl != newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });
});


// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl != networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
});


// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});
  //  console.log(requestPromises);
	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;
        console.log("asdadasdasdasdasd");
		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
                console.log("Sorting...");
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});

        console.log("new longestchain......");
        console.log(newLongestChain);
		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
            console.log("newLongestChain");
            console.log(newLongestChain);
            //console.log(bitcoin.chainIsValid(newLongestChain));

			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	});
});


// Function    :  manipulate_dection
/* Description : Current chain consistency check
 *               1. Load chains of other nodes('/blockchain')
 *               2. Check current chain validation
 *               3. If current chain invalid, select valid chain from othernode
 *               4. Replace current chain to valid chain
*/

app.get('/check-and-recovery-consistency', function(req, res) {
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/detection',
            method: 'GET',
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises);
    console.log('Node consistency check initiate...');
    res.json({
        note: 'Node consistency check initiate...'
    });
});

app.get('/detection', function(req, res) {
    const requestPromises = [];
    if(!bitcoin.chainIsValid(bitcoin.chain)){
        console.log('Inconsistency detected...');
        console.log('Node:'+'%s',bitcoin.currentNodeUrl);
        const requestOptions = {
                    uri: bitcoin.currentNodeUrl + '/recovery',
                    method: 'GET',
                    json: true
                };
        requestPromises.push(rp(requestOptions));
        Promise.all(requestPromises);
        res.json({
            note: 'Chain contemination detected in node('+bitcoin.currentNodeUrl+').'
        });
    }
    else{
        res.json({
            note: 'This chain is consistency.'
        });
    }
});

app.get('/recovery', function(req, res) {
	const requestPromises = [];// excute by Promise()
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = { // call get API
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});
	Promise.all(requestPromises)
	.then(blockchains => {
        let valid_chain = null;
        let valid_chain_url = null;
        blockchains.forEach(blockchain => {
            if(bitcoin.chainIsValid(blockchain.chain)){
                valid_chain = blockchain.chain;
                valid_chain_url = blockchain.currentNodeUrl;
                return false;
            }
        });
        bitcoin.chain = valid_chain;
        console.log('Current chain replaced ('+'%s'+'replaced using '+'%s'+')',bitcoin.currentNodeUrl, valid_chain_url);
        res.json({
            note: 'This chain have been replaced cause hash manipulate detected.'
        });
	});
});




// get block by blockHash
app.get('/block/:blockHash', function(req, res) {
	const blockHash = req.params.blockHash;
	const correctBlock = bitcoin.getBlock(blockHash);
	res.json({
		block: correctBlock
	});
});


// get transaction by transactionId
app.get('/transaction/:transactionId', function(req, res) {
	const transactionId = req.params.transactionId;
	const trasactionData = bitcoin.getTransaction(transactionId);
	res.json({
		transaction: trasactionData.transaction,
		block: trasactionData.block
	});
});


// get address by address
app.get('/address/:address', function(req, res) {
	const address = req.params.address;
	const addressData = bitcoin.getAddressData(address);
	res.json({
		addressData: addressData
	});
});


// block explorer
app.get('/block-explorer', function(req, res) {
	res.sendFile('./block-explorer/index.html', { root: __dirname });
});

// get block number
app.get('/blocknumber', function(req, res){
    const block_number = bitcoin.getBlocknumber();
    console.log(block_number);

    res.json({
        block_number: block_number
    });
});

//get overall transaction number
app.get('/transactionnumber', function(req, res){
    const transaction_number = bitcoin.getTransactionnumber();
    console.log(transaction_number);
    res.json({
        transaction_number: transaction_number
    });

});

app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});
