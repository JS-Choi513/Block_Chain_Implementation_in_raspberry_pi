htMain.js

const humitemp = require('./humitemp.js');
const HTPIN = 21; // 온습도센서 <- 21번(BCM)
humitemp.init(HTPIN);
console.log("==============================================");
console.log("3초후부터 3초간격으로 온도와 습도록 측정합니다");
console.log("==============================================");
setInterval( ()=>{ humitemp.read(); }, 3000); // 측정주기: 3초 = 3000ms


lcdMain.js

const temp = require("node-dht-sensor");
const humitemp = {
    type : 22, //기본값 : DT22(정밀온습도센서)
    pin : 21, //기본값 : 21, BCM핀번호
    humi : 0.0, //초기값
    temp : 0.0,
    str : '',
    init: (number) => {
        humitemp.pin = number;
        console.log('초기화pin: ' + humitemp.pin);
    },
    read: () => {
        let humistr = '';
        temp.read(humitemp.type, humitemp.pin, (err, temp, humi) => {
            if(!err) {
                humitemp.temp = temp.toFixed(1); //정밀표기 : 소수점 1자리
                humitemp.humi = humi.toFixed(1); //소수점 1자리
                humitemp.str = (new Date()).toLocaleString('ko'); //측정일시
                humistr = humitemp.temp + 'C,' + humitemp.humi + '%       ';
                console.log('온도/습도 측정값: ' + humitemp.temp + 'C  ' + humitemp.humi + '% ' + humitemp.str);
            }
            else {console.log(err);}
        }); //temp.read()
    } //read
}
module.exports.init = function(number) { humitemp.init(number); };
module.exports.read = function() { humitemp.read(); };


