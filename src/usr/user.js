/*
 * 블록체인 사용자 모듈 
 * 역할: 트랜잭션 생성, 요청, 블록생성, 조작 
 */
const temperature = require('./temp_sensor');
const ledcon = require('./led_control');
const url = 'http://192.9.202.31:';
const port = ['3001', '3002', '3003', '3004', '3005']; 
const bodyParser = require('body-parser');
const {uniqueNamesGenerator, names} = require('unique-names-generator');
const fetch = require('node-fetch');
const rp = require('request-promise-native');
var request = require('request');
const stat = ledcon.stat;

busyport_idx = 10; 
block_count = 0;
transaction_count = 0;

function waitsec(sec){
	let start = Date.now(), now = start;
	while(now - start < sec * 1000){
		now = Date.now();
	}
}

/*
 * @function 트랜잭션 생성
 * @return GET response 메시지
 * description 무작위로 노드 선택 후 해당 노드에 트랜잭션 요청,
 * 온도센서모듈로 부터 현재온도 획득
 * 트랜잭션 JSON 생성 후 API 요청, 브로드캐스트
 */
function transaction(){
	let rnd_node = Math.floor(Math.random() * port.length);
	while(busyport_idx == rnd_node){
		rnd_node = Math.floor(Math.random() * port.length);
	}
	const rndsender = uniqueNamesGenerator({dictionaries: [names], length: 1});
	const rndrecipient = uniqueNamesGenerator({dictionaries: [names], length: 1});
	let currtemp = temperature.read();
	console.log(url+port[rnd_node]+'/transaction/broadcast');
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

/*
 * @function 새 블록 생성 
 * @return GET response 메시지
 * description 무작위로 노드 선택 후 해당 노드에 블록생성 요청
 */
function gen_new_block(){
	ledcon.set_stat(stat.newblock);
	waitsec(2);
	let rnd_node = Math.floor(Math.random() * port.length);
	let res = null;
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

/*
 * @function 블록 내 해시값 조작 
 * @return GET response 메시지
 * description 무작위로 노드 선택 후 해당 노드에서 무작위로 특정블록 해시 값 변경 
 */
function manipulation(){
	ledcon.set_stat(stat.mal_func);
	waitsec(1);
	let rnd_node = Math.floor(Math.random() * port.length);
	let res = null;
	let requestOption = null;
	fetch(url+port[rnd_node]+'/manipulate').then((response)=> res);
	if(res == null){
		console.log("Block manipulate...");
		requestOption = res;
	}
	else console.log("error");
	return requestOption;
}

/*
 * @function 트랜잭션 API 비동기 실행을 위한 래핑함수 
 * @return GET response 메시지
 */
const generate_transaction =  async () => {
	while(!(transaction_count == 10)){
	console.time("Transaction execution time is ...");
	const apinfo = transaction();
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
	console.timeEnd("Transaction execution time is ...");
	}
};

/*
 * @function 트랜잭션, 블록생성, 조작, 비동기 실행을 위한 래핑함수 
 * @return GET response 메시지
 */
async function act(){
	console.log("act");
	if(block_count == 0){
		console.log("blockcount is 0, gen_new_block init");
		const initial  = await gen_new_block();
	}
	const transaction = await generate_transaction();
	console.time("Block generation execution time is");
	const genblock = await gen_new_block();
	console.timeEnd("Block generation execution time is");
//	var manipulate = null;
//	if(block_count > 2) manipulate = await manipulation();
}


const main = async () => {
	while(!(block_count > 2000)){
		await console.log("Current block number is...%d", block_count);
		await act();
		transaction_count = 0; 
	}

}

main();


