const SerialPort = require("/usr/local/lib/node_modules/bonescript/node_modules/serialport");
const struct = require("struct")
const bone  = require('bonescript')
const dgram = require('dgram');
const fs = require("fs")
var server = dgram.createSocket('udp4');
var PORT = 5000;
var HOST = '192.168.2.2';
var isLogging = false;
var writeStream;
bone.pinMode('P8_8', bone.OUTPUT)
bone.digitalWrite('P8_8', bone.HIGH)


var initialAccumulatedFlows = {FLO_IPA: 0, FLO_N2O:0}

/*var USBport1 = new SerialPort('/dev/ttyACM1', { baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("USB1 ready")

});


var USBport0 = new SerialPort('/dev/ttyACM0', { baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("USB0 ready")

});*/

var pressureUART = new SerialPort('/dev/ttyO1', { baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("UART1 ready");

});


var flowUART = new SerialPort('/dev/ttyO4', { baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("UART4 ready");

});

var valveUART = new SerialPort('/dev/ttyO2', { baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("UART5 ready - valve UART");

});

var receiverDeviceAddress;
var receiverDevicePort;

server.on('listening', function () {
    var address = server.address();
    //console.log('UDP Server listening on ' + address.address + ":" + address.port);
});
server.bind(PORT, HOST);
//var data = "s1, 21; s2, 20; s3, 21"
let jsonData ={type: "TC_DATA", data: {TC_IPA:'',TC_N2O:'', TC_1:'', TC_2:'',TC_3:'',TC_4:'',TC_5:'',TC_6:''}}
let jsonDataValve ={type: "VALVE_DATA", data: {SV_FLUSH:'CLOSED', SV_N2O: 'CLOSED', SV_N2O_FILL:'CLOSED', SV_IPA:'CLOSED'}}
let jsonFlow = {type:'FLOW_DATA', data: {FLO_IPA:{value:0, accumulated:0}, FLO_N2O:{value:0, accumulated:0}}}
let jsonPressure = {type: "PRESSURE_DATA", data:{PT_IPA:'', PT_N2O:'',PT_CHAM:'',PT_N2:'', PT_FUEL:'', PT_OX:''}}
let jsonLoadCell = {type:'LOAD_CELL_DATA', data:{LOAD_CELL:''}}
/*portPins.on('data',function (data) {
 data = new Buffer(data)
    let test = struct().array('tc',8, 'word16Ule')
    test._setBuff(data)
    let arduInput= test.get('tc')
        console.log(arduInput.fields[0])
        jsonData.TC_IPA = arduInput.fields[0]
        jsonData.TC_N2O = arduInput.fields[1]
        jsonData.TC_1 = arduInput.fields[2]
        jsonData.TC_2 = arduInput.fields[3]
        jsonData.TC_3 = arduInput.fields[4]
        jsonData.TC_4 = arduInput.fields[5]
        jsonData.TC_5 = arduInput.fields[6]
        jsonData.TC_6 = arduInput.fields[7]
        //console.log(jsonData)
         sendBlock(jsonData);
});*/

pressureUART.on('data',function(data){


    data = new Buffer(data)
    console.log(data)

    let PT = struct().array('sensor',2,'chars',1).array('PT', 7, 'word16Ule').word32Ule('timer')
//  let TC = struct().array('sensorTC',2,'chars',2).array('TC', 8, 'word32Ule').word32Ule('timerTC')

    PT._setBuff(data)

    var VD = 10.0/3.0
    var voltsPerBit = 0.001
    var mvGram = ((3.0008*10)/500000)*200
//  console.log(PT.get('sensor').fields[0]+PT.get('sensor').fields[1]);
    let arduInput= PT.get('PT')

    /*jsonPressure.data.PT_IPA = arduInput.fields[0]*0.002*35.052*VDC-0.4656
    jsonPressure.data.PT_N2O = arduInput.fields[1]*voltsPerBit*6.9982*VDC+0.0045
    jsonPressure.data.PT_FUEL= arduInput.fields[2]*voltsPerBit*7.0009*VDC-0.0037
    jsonPressure.data.PT_CHAM = arduInput.fields[3]*voltsPerBit*6.9941*VDC-0.1277
    jsonPressure.data.PT_OX= arduInput.fields[4]*voltsPerBit*6.9999*VDC+0.0285
    jsonPressure.data.PT_N2 = arduInput.fields[5]*voltsPerBit*7.014*VDC-0.0699
    jsonLoadCell.data.LOAD_CELL = arduInput.fields[6]*voltsPerBit*1000/mvGram*/

    jsonPressure.data.PT_IPA = arduInput.fields[0]*voltsPerBit*VD//*7.014-0.0699
    jsonPressure.data.PT_N2O = arduInput.fields[1]*voltsPerBit*VD//*6.9941-0.1277
    jsonPressure.data.PT_FUEL= arduInput.fields[2]*voltsPerBit*VD*7.0009-0.0037
    jsonPressure.data.PT_CHAM = arduInput.fields[3]*voltsPerBit*VD*6.9982+0.0045
    jsonPressure.data.PT_OX= arduInput.fields[4]*voltsPerBit*VD*6.999+0.0285
    jsonPressure.data.PT_N2 = arduInput.fields[5]*0.002*VD*35.052-0.4656
    jsonLoadCell.data.LOAD_CELL = arduInput.fields[6]*voltsPerBit*1000/mvGram
//  jsonData.TC_6 = arduInput.fields[7]/100
    // gitfix
    console.log(jsonPressure)
    //console.log(jsonLoadCell)
    //console.log(PT.get('timer')+' timer!')
    sendBlock(jsonPressure)
    sendBlock(jsonLoadCell)

    //let dataTC = new Buffer(data)

    //  let testTC = struct().array('sensorTC',2,'chars',2).array('TC', 8, 'word32Ule').word32Ule('timerTC')
    //TC._setBuff(data)
    //   console.log(test.get('sensor').fields[0]+test.get('sensor').fields[1])
    /*let arduInputTC=TC.get('TC')
   jsonData.data.TC_IPA = arduInputTC.fields[0]/100
   jsonData.data.TC_N2O = arduInputTC.fields[1]/100
   jsonData.data.TC_1 = arduInputTC.fields[2]/100
   jsonData.data.TC_2 = arduInputTC.fields[3]/100
   jsonData.data.TC_3 = arduInputTC.fields[4]/100
   jsonData.data.TC_4 = arduInputTC.fields[5]/100
   jsonData.data.TC_5 = arduInputTC.fields[6]/100
   jsonData.data.TC_6 = arduInputTC.fields[7]/100
   console.log(TC.get('sensorTC').fields[0]+TC.get('sensorTC').fields[1])
   console.log(jsonData)
   console.log(TC.get('timerTC')/1000000)
   */

})
/*
USBport0.on('data', function(data) {

    data = new Buffer.from(data)
    console.log(data.toString())

})
*/

/*
portPins.on('data',function(data) {
    console.log(data.length)
     data = new Buffer(data)
     if(data.length == 40){
     console.log(data)
    let test = struct().array('sensor',2,'chars',2).array('TC', 8, 'word32Ule').word32Ule('timer')
    test._setBuff(data)
     //   console.log(test.get('sensor').fields[0]+test.get('sensor').fields[1])
         let arduInput= test.get('TC')
        jsonData.TC_IPA = arduInput.fields[0]/100
        jsonData.TC_N2O = arduInput.fields[1]/100
        jsonData.TC_1 = arduInput.fields[2]/100
        jsonData.TC_2 = arduInput.fields[3]/100
        jsonData.TC_3 = arduInput.fields[4]/100
        jsonData.TC_4 = arduInput.fields[5]/100
        jsonData.TC_5 = arduInput.fields[6]/100
        jsonData.TC_6 = arduInput.fields[7]/100
        console.log(test.get('sensor').fields[0]+test.get('sensor').fields[1])
        console.log(jsonData)
        console.log(test.get('timer')/1000000)
     }
})*/


flowUART.on('data', function(data){

    //  console.log(data)


    if(data.length == 14){

        data = new Buffer(data)

        //console.log(data)

        //let test = struct().array('FLOX',)
        //test._setBuff(data)
        // data = new Buffer(data)
        //console.log(data)
        let test = struct().array('SENSOR',2,'chars', 1)
        test.array('TYPE',2,'chars', 1)
        test.word16Ule('flowRateMillis')
        test.word32Ule('totalMilliLitres')
        test.word32Ule('TIMER')

        test._setBuff(data)


        let  type = test.get('TYPE').fields[0]+test.get('TYPE').fields[1]

        //console.log(type)

        if(type == 'OX'){
            jsonFlow.data.FLO_N2O.value = test.get('flowRateMillis')
            jsonFlow.data.FLO_N2O.accumulated = test.get('totalMilliLitres') - initialAccumulatedFlows.FLO_N2O;
            console.log(jsonFlow)
            sendBlock(jsonFlow)
        }else if(type == 'FU'){
            jsonFlow.data.FLO_IPA.value = test.get('flowRateMillis')
            jsonFlow.data.FLO_IPA.accumulated= test.get('totalMilliLitres') - initialAccumulatedFlows.FLO_IPA;
            console.log(jsonFlow)
            sendBlock(jsonFlow)

        } else {
            console.log("Unknown flow type")
        }
        //  console.log(test.get('flowRateMillis')+' '+test.get('totalMilliLitres'))
//    console.log(test.get('TIMER')/1000000)

    }

});



//UDP server.js
//As soon as the server is ready to receive messages, handle it with this handler
/*var isHigh = false;
setInterval(function() {
    if (isHigh) {
        bone.digitalWrite('P8_8', bone.LOW);
    } else {
        bone.digitalWrite('P8_8', bone.HIGH)
    }
    isHigh = !isHigh;
}, 1000)
*/
server.on("message", (message, remote) => {

    var json = JSON.parse(message)
    switch (json.type) {
        case 'ACTUATOR':
            actuator(json.data)
            break;
        case 'VALVE':
            valveState(json.data.name, json.data.value)
            break;
        case 'HEARTBEAT':
            receiverDeviceAddress = remote.address;
            receiverDevicePort = remote.port;
            console.log(message)
            break;
        case 'LOG_START':
            console.log("started logging")
            bone.digitalWrite('P8_8', bone.LOW)
            startLog(json)
            bone.digitalWrite('P8_8', bone.HIGH)

            break;
        case 'LOG_STOP':
            console.log("stopped logging")
            bone.digitalWrite('P8_8', bone.LOW)
            stopLog()
            bone.digitalWrite('P8_8', bone.HIGH)

            break;
        default:
            break;
    }



    //message = JSON.parse(message)


});
function writeDataPoint(dataString){
    if(isLogging){
        writeStream.write(dataString+'\n')
    }
}

function startLog(message){
    isLogging  = true
    initialAccumulatedFlows.FLO_IPA = jsonFlow.data.FLO_IPA.accumulated;
    initialAccumulatedFlows.FLO_N2O = jsonFlow.data.FLO_N2O.accumulated;
    writeStream = fs.createWriteStream("/danstar/logs/"+message.data.year+':'+message.data.month+':'+message.data.day+':'+message.data.hours+':'+message.data.minutes+':'+message.data.seconds+".txt")
    writeStream.write('start'+'\n', 'ascii');

}

function stopLog() {
    isLogging = false;
    writeStream.end()
}

function valveState(valveName, valveValue){
    if(valveValue == 'CLOSED'){
        jsonDataValve[valveName] = valveValue
        console.log(valveName+' '+0)
        valveUART.write(new Buffer.from(valveName+' 0'))
        // sendBlock(jsonDataValve)


    }else if(valveValue == "OPEN"){
        console.log(valveName+' '+1)
        jsonDataValve[valveName] = valveValue

        valveUART.write(new Buffer.from(valveName+' 1'))
        //sendBlock(jsonDataValve)


    }
}



function actuator(data) {
    var fuelValve = 'fuelvalve'
    var oxValve = 'oxvalve'

    if (data.type == "SINGLE") {
        if (data.name == "ACT_IPA_VALUE") {
            console.log(fuelValve+' '+data.value)
            valveUART.write(new Buffer.from(fuelValve+' '+data.value))

        } else if (data.name == "ACT_N2O_VALUE") {
            console.log(oxValve+' '+data.value)
            valveUART.write(new Buffer.from(oxValve+' '+data.value))
        }

    } else if (data.type == "BOTH") {
        // TODO
    }

    //USBport0.write(new Buffer.from(valveName+' '+1))
}


function sendBlock(block) {
    if (receiverDeviceAddress == null || receiverDevicePort == null) {
        console.log("Receiver information not available");
        return;
    }

    var blockString = JSON.stringify(block);
    //console.log("Sending: " + blockString);
    writeDataPoint(blockString)
    server.send(blockString, receiverDevicePort, receiverDeviceAddress, (err) => {
        if (err != null) {
            console.error(err);
        }
    });
}

//When getting a message, handle it like so:
/*
server.on('message', function (message, remote) {
    //print out the message
    console.log(message.toString())
    console.log(remote)
   // server.send(JSON.stringify(jsonData), remote.port, remote.address);
    /* port.on('data', function (data) {
        data = new Buffer(data);
        server.send(data, remote.port, remote.address, function(err){
        if (err){
        throw err;
        }
        });
    });
});
*/
