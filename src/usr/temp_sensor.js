const sensorLib = require("node-dht-sensor");
var pigpio = require('pigpio'); //include pigpio to interact with the GPIO
pigpio.configureSocketPort(8889);
var Gpio = pigpio.Gpio;

const temp_sensor = {};
temp_sensor.wait = function waitsec(sec){
	let start = Date.now(), now = start;
	while(now - start < sec * 1000){
		now = Date.now();
	}
}

temp_sensor.read = function read_temp(){
	const type = 22;
	const pin = 20;
	var tempval = sensorLib.read(type, pin).temperature.toFixed(1);
	//console.log('Read indoor temperature is... %d', tempval);
	this.wait(1);
	return tempval;
}

module.exports = temp_sensor;
//while(1){
//	var curtemp = temp_sensor.read();
//	console.log('Curtemp is ... %d', curtemp);

//}



