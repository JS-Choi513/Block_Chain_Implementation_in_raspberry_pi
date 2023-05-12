const temperature = require('./temp_sensor');
const url = 'http://192.9.202.31:';
const port = ['3001', '3002', '3003', '3004', '3005']; 
const bodyParser = require('body-parser');
const {uniqueNamesGenerator, names} = require('unique-names-generator');
const fetch = require('node-fetch');
const rp = require('request-promise-native');
const ledcon = require('./led_control');
const stat = ledcon.stat;
var request = require('request');

function wait(sec){
	let start = Date.now(), now = start;
	while(now - start < sec * 1000){
		now = Date.now();
	}
}

/*
ledcon.set_stat(stat.newblock);
wait(3);
ledcon.set_stat(stat.net_sync);
wait(3);
ledcon.set_stat(stat.mal_func);
wait(3);
ledcon.set_stat(stat.normal);
busyport_idx = 10; 
block_count = 0;
transaction_count = 0;
*/
busyport_idx = 10;

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
		//ledcon.set_stat(stat.normal);
	}
	else{
		console.log('error');
	}
	return requestOption;
}

async function act(){
	console.log("act");
	const resoverwatch = await network_overwatch();
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



