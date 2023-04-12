const sensorLib = require("node-dht-sensor");
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

const sensor = {
	sensors:[{name: "Indoor", type:22, pin:20} ],
	read:function(){
		for (var index in this.sensors){
			var s = sensorLib.read(this.sensors[index].type, this.sensors[index].pin);
			console.log(this.sensors[index].name + ": " + s.temperature.toFixed(1)+"°C," + s.humidity.toFixed(1) + "%");
		ledRed.digitalWrite(1);
		}
		ledRed.digitalWrite(0);
		setTimeout(function(){sensor.read();}, 2500);

	}
};
sensor.read();


