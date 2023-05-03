const temperature = require('./temp_sensor');
const url = 'http://192.9.202.31:';
const port = ['3001', '3002', '3003', '3004', '3005']; 
const bodyParser = require('body-parser');
const {uniqueNamesGenerator, names} = require('unique-names-generator');
const fetch = require('node-fetch');
const rp = require('request-promise-native');
var request = require('request');

let busyport_idx = 10; 
let block_count = 0;
let transaction_count = 0;



function transaction(){
	let rnd_node = Math.floor(Math.random() * port.length);
	while(busyport_idx == rnd_node){
		rnd_node = Math.floor(Math.random() * port.length);
	}
	const rndsender = uniqueNamesGenerator({dictionaries: [names], length: 1});
	const rndrecipient = uniqueNamesGenerator({dictionaries: [names], length: 1});
	let currtemp = temperature.read();
	console.log(currtemp);
	console.log(url+port[rnd_node]+'/transaction/broadcast');
	const newtransaction = {
			amount: currtemp,
			sender: rndsender,
			recipient: rndrecipient,
	};
	const requestOptions = {
		uri: url+port[rnd_node]+'/transaction/broadcast',
		method: 'POST',
		body: newtransaction,
		json: true
	};
	const requestOption = {
			 'method': 'POST',
			 'url': url+port[rnd_node]+'/transaction/broadcast',
			'headers': {'Content-Type': 'application/json'},
			body: JSON.stringify({
				"amount": currtemp,
				"sender": rndsender,
				"recipient": rndrecipient
			})
	};
	return requestOption;
}

function mine(){
	let rnd_node = Math.floor(Math.random() * port.length);
	let res = null; 
	fetch(url+port[rnd_node]+'/mine').then((response)=> res);
	return res;
}


console.log('asdasdasdadasdasdasdasdasdasdasd');
//while(!(block_count == 1000)){
const loop =  async () => {
	while(!(transaction_count == 600)){
	const apinfo = transaction();
	console.log(apinfo);
    const reqpromise = [];
	reqpromise.push(rp(apinfo));
	let response = null;
	await Promise.all(reqpromise).then(res => res.json).then(res=> {if(!res == null){
		console.log(res.note);
		response = res.note;
			}
		});
	}
};
loop();
//fetch(apinfo.url,{
//  method: apinfo.method,
//  body: apinfo}).then(res => res.json())
//					  .then(res => {if(res.note){
//						   console.log("dddsds");
//						   console.log(res.note);
//						  }
//					  });
//}
		//console.log('transaction value res is... (%s)', tranres);
		
	//	if(tranres == 'Transaction created and broadcast successfully.'){
	//		transaction_count += 1;	
//			console.log('Current # of pending transaction is ... %d', transaction_count);
	//	}
//	}
//	console.log('Current transactions... %d', transaction_count);
//	console.log('Generating new block...');
//	let mineres = mine();
//	console.log('mine res is ... (%s)', mineres); 
//	if(mineres != null){
//		block_count += 1;
//		consile.log('Current # of block is... %d', block_count);
//	}
//}	


