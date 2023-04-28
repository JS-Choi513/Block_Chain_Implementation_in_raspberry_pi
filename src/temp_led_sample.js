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
    // read sensor data and log it
    for (var index in this.sensors){
      var s = sensorLib.read(this.sensors[index].type, this.sensors[index].pin);
      console.log(this.sensors[index].name + ": " + s.temperature.toFixed(1)+"°C," + s.humidity.toFixed(1) + "%");

      // turn on blue LED when block is being created
     if (block creation) {
      ledBlue.digitalWrite(1);
     }

      // check for network sync and turn on yellow LED
      if (network_synced) {
        ledYellow.digitalWrite(1);
      }

      // check for errors and turn on red LED 
      if (error_occured) {
        ledRed.digitalWrite(1);
      }

      // if everything is working fine, turn on green LED
      if (!error_occured && network_synced) {
        ledGreen.digitalWrite(1);
      }
    }

    // turn off all LEDs after 2.5 seconds
    setTimeout(function(){
      ledRed.digitalWrite(0);
      ledGreen.digitalWrite(0);
      ledBlue.digitalWrite(0);
      sensor.read();
    }, 2500);
  }
};  /jyan change


sensor.read();


/** project requirement
 * if(block creation) {
 * led color = blue
 * }
 * else if(network synchronization point) {
 * led color = yellow}
 * else if(Fault (Integrity Violation Occurred) {
 * led color = red})
 * else if(Normal operation) {
 * led color = green}
 */
