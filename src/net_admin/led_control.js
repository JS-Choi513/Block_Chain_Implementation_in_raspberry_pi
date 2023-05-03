const Gpio = require('pigpio').Gpio; //include pigpio to interact with the GPIO
const ledRed = new Gpio(25, {mode: Gpio.OUTPUT}); //use GPIO pin 4 as output for RED
const ledGreen = new Gpio(24, {mode: Gpio.OUTPUT}); //use GPIO pin 17 as output for GREEN
const ledBlue = new Gpio(23, {mode: Gpio.OUTPUT}); //use GPIO pin 27 as output for BLUE
const redRGB = 255; //set starting value of RED variable to off (255 for common anode)
const greenRGB = 255; //set starting value of GREEN variable to off (255 for common anode)
const blueRGB = 255; //set starting value of BLUE variable to off (255 for common anode)
//RESET RGB LED
ledRed.digitalWrite(0); // Turn RED LED off
ledGreen.digitalWrite(0); // Turn GREEN LED off
ledBlue.digitalWrite(0); // Turn BLUE LED off
//for common anode RGB LED  255 is fully off, and 0 is fully on, so we have to change the value from the client

const statclr = {newblock : 'blue',
						 net_sync : 'yello',
						 mal_func : 'red',
						 normal   : 'green'};

const exptobj = {};
exptobj.stat = statclr
exptobj.set_stat = function set_ledstatus(color){
	//Create block
	if(color == 'blue'){
		ledRed.digitalWrite(0);
		ledGreen.digitalWrite(0);
		ledBlue.digitalWrite(1);
	}
	//Network syncronization
	else if (color == 'yello'){
		ledRed.digitalWrite(1);
		ledGreen.digitalWrite(1);
		ledBlue.digitalWrite(0);
	}
	//Blockchain malfunction(collapse consistency)
	else if(color == 'red'){
		ledRed.digitalWrite(1);
		ledGreen.digitalWrite(0);
		ledBlue.digitalWrite(0);
	}
	//Normal status
	else if(color == 'green'){
		ledRed.digitalWrite(0);
		ledGreen.digitalWrite(1);
		ledBlue.digitalWrite(0);
	}
};

function wait(sec){
	let start = Date.now(), now = start;
	while(now - start < sec * 1000){
		now = Date.now();
	}
}

/*
set_status(statclr.newblock);
wait(3);
set_status(statclr.net_sync);
wait(3);
set_status(statclr.mal_func);
wait(3);
set_status(statclr.normal);
wait(3);
*/

module.exports = exptobj;



