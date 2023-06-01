
/**
 * 네트워크 관리자 모듈
 * 역할: 노드 IP등록, 상태 LED 제어, 네트워크 감시 및 복구
 */

const temperature = require('./temp_sensor');// 온도센서모듈
const url = 'http://192.9.202.31:';
const port = ['3001', '3002', '3003', '3004', '3005']; 
const bodyParser = require('body-parser');
const {uniqueNamesGenerator, names} = require('unique-names-generator');
const fetch = require('node-fetch');// method 내 API 호출 모듈 
const rp = require('request-promise-native');
const ledcon = require('./led_control');// LED 제어모듈
const stat = ledcon.stat;
var request = require('request');
busyport_idx = 10;

function wait(sec){
	let start = Date.now(), now = start;
	while(now - start < sec * 1000){
		now = Date.now();
	}
}

/*
 * @function 노드등록 
 * @return POST response 메시지
 * description 3001 번노드로 현재 동작중인 모든 노드 네트워크 등록 
 */
function node_register(num){
	let node = '3001';
	const rndsender = uniqueNamesGenerator({dictionaries: [names], length: 1});
	const rndrecipient = uniqueNamesGenerator({dictionaries: [names], length: 1});
	const requestOption = {
			 'method': 'POST',
			 'url': url+node+'/register-and-broadcast-node',
			 'headers': {'Content-Type': 'application/json'},
			body: JSON.stringify({
				"newNodeUrl": url+port[num]
			})
	};
	return requestOption;
}

/*
 * @function 노드등록 API 비동기 실행을 위한 래핑함수 
 * @return POST response 메시지
 */
const register_and_broadcast_node =  async () => {
	for(var i = 1; i <5; i++ ){
	const apinfo = node_register(i);
    const reqpromise = [];
	reqpromise.push(rp(apinfo));
	let response = null;
	await Promise.all(reqpromise).then(res => res.json).then(res=> {if(!res == null){
		console.log(res.note);
		response = res.note;
			}
		});
	wait(2);
	}
};

/*
 * @function 네트워크 감시 
 * @returns GET response 
 * desctription: 함수 호출 시 '네트워크 동기화' LED상태 업데이트(황색)
 * 무작위로 노드 선택 후 '/check-and-recovery-consistency API 호출 
 * 응답 메시지 반환 후 종료
 */
function network_overwatch(){
	ledcon.set_stat(stat.net_sync);
	wait(2);
	let rnd_node = Math.floor(Math.random() * port.length);
	let res = null;
	let requestOption = null;
	while(busyport_idx == rnd_node){
		rnd_node = Math.floor(Math.random() * port.length);
	
	}
	fetch(url+port[rnd_node]+'/check-and-recovery-consistency').then((response)=> res);
	if(res == null){
		console.log(res);
		requestOption = res;
	}
	else{
		console.log('error');
		requestOption = respinse
	}
	return requestOption;
}

/*
 * @function act
 * @return x
 * description: network_overwatch() 메서드 동기화를 위한 래핑함수
 * API 호출 후 응답까지 대기, promise 함수로 사용함 
 */
var first_register = 0;
async function act(){
	console.log("act");
	if(first_register == 0){
		const register = await register_and_broadcast_node();
		first_register = 1;
	}
	console.time("Network recovery execution time");
	const resoverwatch = await network_overwatch();
	console.timeEnd("Network recovery execution time");
	console.log(resoverwatch);
	ledcon.set_stat(stat.normal);
	wait(5);
}

const main = async () => {
	while(1){
		await console.log("network overwatching...");
		await act();
	}

}

main();




