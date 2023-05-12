const temperature = require('./temp_sensor');
const url = 'http://192.9.202.31:';
const port = ['3001', '3002', '3003', '3004', '3005']; 
const bodyParser = require('body-parser');
const {uniqueNamesGenerator, names} = require('unique-names-generator');
const fetch = require('node-fetch');
const rp = require('request-promise-native');
var request = require('request');

busyport_idx = 10; 
block_count = 0;
transaction_count = 0;

function waitsec(sec){
	let start = Date.now(), now = start;
	while(now - start < sec * 1000){
		now = Date.now();
	}
}

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
			temperature: currtemp,
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
				"temperature": currtemp,
				"sender": rndsender,
				"recipient": rndrecipient
			})
	};
	return requestOption;
}

function mine(){
	let rnd_node = Math.floor(Math.random() * port.length);
	let res = null;
   	//const requestOption = await { 
	//	'method' : 'GET',
//		'url': url+port[rnd_node]+'/mine'
//	};
	let requestOption = null;
	fetch(url+port[rnd_node]+'/mine').then((response)=> res);
	if(res == null){
		console.log("Block generated...");
		requestOption = res;
		block_count +=1;
	}
	else console.log("error");
	return requestOption;

}


//while(!(block_count == 1000)){
const generate_transaction =  async () => {
	//let minee = await mine();
	while(!(transaction_count == 10)){
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
	waitsec(1);
	transaction_count += 1;
	console.log(transaction_count);

	}
//	await mine();
};

async function act(){
	console.log("act");
	console.log(block_count);
	if(block_count == 0){
		console.log("blockcount is 0, mine init");
		const initial  = await mine();
		console.log(initial);
	}
	const transaction = await generate_transaction();
	const genblock = await mine();
}

const main = async () => {
	while(!(block_count > 3)){
		await console.log("while blockcount is ...%d", block_count);
		await act();
		transaction_count = 0; 
	}

}

main();

//while(!(block_count == 3)){
//	generate_transaction();
	
//	transaction_count = 0
//}



