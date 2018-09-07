const SerialPort = require("/usr/local/lib/node_modules/bonescript/node_modules/serialport");
const Delimiter = require("/usr/local/lib/node_modules/bonescript/node_modules/serialport/lib/parsers/delimiter")
const Struct = require("struct")
const bone  = require('bonescript')
const dgram = require('dgram');
const fs = require("fs")
var server = dgram.createSocket('udp4');
var PORT = 5000;
var HOST = '192.168.2.2';
var isLogging = false;
//var writeStream;
bone.pinMode('P9_41', bone.OUTPUT)
bone.digitalWrite('P9_41', bone.HIGH)

var initialAccumulatedFlows = {FLO_IPA: 0, FLO_N2O:0}

var pressureUART = new SerialPort('/dev/ttyO4', {baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("UART4 ready");

});
var pressureParser = pressureUART.pipe(new Delimiter({delimiter: '\r%'}));


var flowUART = new SerialPort('/dev/ttyO1', { baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("UART1 ready");

});

var valveUART = new SerialPort('/dev/ttyO2', { baudRate: 115200}, function(err) {
    if(err){
        return console.log('Error: ', err.message);
    }
    console.log("UART2 ready - valve UART");

});
var valveParser = valveUART.pipe(new Delimiter({delimiter: '\n'}));

var receiverDeviceAddress;
var receiverDevicePort;

server.on('listening', function () {
    var address = server.address();
    //console.log('UDP Server listening on ' + address.address + ":" + address.port);
});
server.bind(PORT, HOST);
//var data = "s1, 21; s2, 20; s3, 21"
//let jsonTemps ={type: "TC_DATA", data: {TC_IPA:'',TC_N2O:'', TC_1:'', TC_2:'',TC_3:'',TC_4:'',TC_5:'',TC_6:''}}
let jsonValves ={type: "VALVE_DATA", data: {SV_FLUSH:0, SV_N2O: 0, SV_N2O_FILL:0, SV_IPA:0, ACT_IPA: 0, ACT_N2O: 0, STATE: 0}}
let jsonFlow = {type:'FLOW_DATA', data: {FLO_IPA:{value:0, accumulated:0}, FLO_N2O:{value:0, accumulated:0}, TIME: 0}}
//let jsonPressure = {type: "PRESSURE_DATA", data:{PT_IPA:'', PT_N2O:'',PT_CHAM:'',PT_N2:'', PT_FUEL:'', PT_OX:''}}
//let jsonLoadCell = {type:'LOAD_CELL_DATA', data:{LOAD_CELL:''}}
let jsonSensorData = {
    type: "SENSOR_DATA",
    data: {
        load: {LOAD_CELL:''},
        pressure: {PT_IPA:'', PT_N2O:'',PT_CHAM:'',PT_N2:'', PT_FUEL:'', PT_OX:''},
        tc: {TC_IPA:'',TC_N2O:'', TC_1:'', TC_2:'',TC_3:'',TC_4:'',TC_5:'',TC_6:''}
    }
}

pressureParser.on('data',function(data){

        data = new Buffer(data)
        //console.log(data.length);
        //console.log(data)
        
        let fullStruct = Struct()
            .array('PT', 6, 'word16Sle')
            .word16Sle('LOAD')
            .array('TC', 8, 'word16Sle');
       
        fullStruct._setBuff(data)
        
        // Pressure and load cell calibration
        var VD = 10.0/3.0
        var voltsPerBit = 0.001
        var mvGram = ((3.0008*10)/500000)*70

        //let pressures = union.get('dataPT').get('PT');
        /*let pressures = fullStruct.get('PT');
        jsonPressure.data.PT_IPA = pressures.fields[0]*voltsPerBit*VD*7.014-0.0699
        jsonPressure.data.PT_N2O = pressures.fields[1]*voltsPerBit*VD*6.9941-0.1277
        jsonPressure.data.PT_FUEL= pressures.fields[2]*voltsPerBit*VD*7.0009-0.0037
        jsonPressure.data.PT_CHAM = pressures.fields[3]*voltsPerBit*VD*6.9982+0.0045
        jsonPressure.data.PT_OX= pressures.fields[4]*voltsPerBit*VD*6.999+0.0285
        jsonPressure.data.PT_N2 = pressures.fields[5]*0.002*VD*35.052-0.4656
        console.log(jsonPressure)
        sendBlock(jsonPressure)
        
        let load = fullStruct.get('LOAD');
        jsonLoadCell.data.LOAD_CELL = load*voltsPerBit*1000/mvGram
        console.log(jsonLoadCell)
        sendBlock(jsonLoadCell)
        
        let temperatures = fullStruct.get('TC');
        jsonTemps.data.TC_IPA = temperatures.fields[0]
        jsonTemps.data.TC_N2O = temperatures.fields[1]
        jsonTemps.data.TC_1 = temperatures.fields[2]
        jsonTemps.data.TC_2 = temperatures.fields[3]
        jsonTemps.data.TC_3 = temperatures.fields[4]
        jsonTemps.data.TC_4 = temperatures.fields[5]
        jsonTemps.data.TC_5 = temperatures.fields[6]
        jsonTemps.data.TC_6 = temperatures.fields[7]
        console.log(jsonTemps)
        sendBlock(jsonTemps);*/

        let pressures = fullStruct.get('PT');
        jsonSensorData.data.pressure.PT_IPA = pressures.fields[0]*voltsPerBit*VD*7.014-0.0699
        jsonSensorData.data.pressure.PT_N2O = pressures.fields[1]*voltsPerBit*VD*6.9941-0.1277
        jsonSensorData.data.pressure.PT_FUEL= pressures.fields[2]*voltsPerBit*VD*7.0009-0.0037
        jsonSensorData.data.pressure.PT_CHAM = pressures.fields[3]*voltsPerBit*VD*6.9982+0.0045
        jsonSensorData.data.pressure.PT_OX= pressures.fields[4]*voltsPerBit*VD*6.999+0.0285
        jsonSensorData.data.pressure.PT_N2 = pressures.fields[5]*0.002*VD*35.052-0.4656

        let temperatures = fullStruct.get('TC');
        jsonSensorData.data.tc.TC_IPA = temperatures.fields[0]
        jsonSensorData.data.tc.TC_N2O = temperatures.fields[1]
        jsonSensorData.data.tc.TC_1 = temperatures.fields[2]
        jsonSensorData.data.tc.TC_2 = temperatures.fields[3]
        jsonSensorData.data.tc.TC_3 = temperatures.fields[4]
        jsonSensorData.data.tc.TC_4 = temperatures.fields[5]
        jsonSensorData.data.tc.TC_5 = temperatures.fields[6]
        jsonSensorData.data.tc.TC_6 = temperatures.fields[7]

        let load = fullStruct.get('LOAD');
        jsonSensorData.data.load.LOAD_CELL = load*voltsPerBit*1000/mvGram

        console.log("Sensor data");
        console.log(jsonSensorData.data.tc);
        sendBlock(jsonSensorData);
})


flowUART.on('data', function(data){

    //  console.log(data)


    if(data.length == 14){

        data = new Buffer(data)

        let test = Struct().array('SENSOR',2,'chars', 1)
        test.array('TYPE',2,'chars', 1)
        test.word16Ule('flowRateMillis')
        test.word32Ule('totalMilliLitres')
        test.word32Ule('TIMER')

        test._setBuff(data)

        let  type = test.get('TYPE').fields[0]+test.get('TYPE').fields[1]

        if(type == 'OX'){
            jsonFlow.data.FLO_N2O.value = test.get('flowRateMillis')
            jsonFlow.data.FLO_N2O.accumulated = test.get('totalMilliLitres') - initialAccumulatedFlows.FLO_N2O;
            jsonFlow.data.TIME = test.get("TIMER");
            //console.log(jsonFlow)
            console.log("OXID flow");
            sendBlock(jsonFlow)
        }else if(type == 'FU'){
            jsonFlow.data.FLO_IPA.value = test.get('flowRateMillis')
            jsonFlow.data.FLO_IPA.accumulated= test.get('totalMilliLitres') - initialAccumulatedFlows.FLO_IPA;
            jsonFlow.data.TIME = test.get("TIMER");
            //console.log(jsonFlow)
            console.log("FUEL flow");
            sendBlock(jsonFlow)

        } else {
            console.log("Unknown flow type")
        }
        //  console.log(test.get('flowRateMillis')+' '+test.get('totalMilliLitres'))
//    console.log(test.get('TIMER')/1000000)

    }

});

valveParser.on('data', function(data){
    var str = data.toString();
    var positions = str.split(" ");
    
    jsonValves.data.SV_FLUSH = positions[0];
    jsonValves.data.SV_IPA = positions[1];
    jsonValves.data.SV_N2O = positions[2];
    jsonValves.data.SV_N2O_FILL = positions[3];
    jsonValves.data.ACT_N2O = Math.ceil((positions[4] / 945.0) * 100);
    jsonValves.data.ACT_IPA = Math.ceil((positions[5] / 1023.0) * 100);
    jsonValves.data.STATE = positions[6];
    
    console.log(str);
    sendBlock(jsonValves);
    
});


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
            //pressureUART.write(new Buffer.from("a"));
            //bone.digitalWrite('P9_41', bone.LOW)
            startLog(json)
            //bone.digitalWrite('P9_41', bone.HIGH)

            break;
        case 'LOG_STOP':
            console.log("stopped logging")
            //pressureUART.write(new Buffer.from("b"));
            //bone.digitalWrite('P9_41', bone.LOW)
            stopLog()
            //bone.digitalWrite('P9_41', bone.HIGH)

            break;
        case 'STATE':
            var stateStr = "state " + json.data.id;
            valveUART.write(new Buffer.from(stateStr));
            console.log(stateStr);
            break;
        case 'RESET_LOAD_CELL':
            // Sebastian wants a 't'...
            pressureUART.write(new Buffer.from("t"));
            break;
        case 'RESET_ACCUMULATED_FLOW':
            resetAccumulatedFlows();
            break;
        default:
            break;
    }



    //message = JSON.parse(message)


});
/*function writeDataPoint(dataString){
    if(isLogging){
        //writeStream.write(dataString+'\n')
    }
}*/

function startLog(message){
    isLogging  = true
    resetAccumulatedFlows();
    //writeStream = fs.createWriteStream("/danstar/logs/"+message.data.year+':'+message.data.month+':'+message.data.day+':'+message.data.hours+':'+message.data.minutes+':'+message.data.seconds+".txt")
    //writeStream.write('start'+'\n', 'ascii');

}

function stopLog() {
    isLogging = false;
    //writeStream.end()
}

function resetAccumulatedFlows() {
    initialAccumulatedFlows.FLO_IPA = jsonFlow.data.FLO_IPA.accumulated;
    initialAccumulatedFlows.FLO_N2O = jsonFlow.data.FLO_N2O.accumulated;
}

function valveState(valveName, valveValue){
    if(valveValue == 'CLOSED'){
        console.log(valveName+' '+0)
        valveUART.write(new Buffer.from(valveName+' 0'))
        // sendBlock(jsonDataValve)


    }else if(valveValue == "OPEN"){
        console.log(valveName+' '+1)

        valveUART.write(new Buffer.from(valveName+' 1'))
        //sendBlock(jsonDataValve)


    }
}



function actuator(data) {

    if (data.type == "SINGLE") {
        if (data.name == "ACT_IPA_VALUE") {
            var cmdStr = 'fuelvalve ' + Math.round(data.value);
            console.log(cmdStr);
            valveUART.write(new Buffer.from(cmdStr));

        } else if (data.name == "ACT_N2O_VALUE") {
            var cmdStr = 'oxvalve ' + Math.round(data.value);
            console.log(cmdStr);
            valveUART.write(new Buffer.from(cmdStr));
        }

    } else if (data.type == "BOTH") {
        // TODO
        var cmdStr = 'propellant ' + Math.round(data.fuelValue) + ' ' + Math.round(data.oxidizerValue);
        console.log(cmdStr);
        valveUART.write(new Buffer.from(cmdStr));
    }
}


function sendBlock(block) {
    if (receiverDeviceAddress == null || receiverDevicePort == null) {
        console.log("Receiver information not available");
        return;
    }

    var blockString = JSON.stringify(block);
    //console.log("Sending: " + blockString);
    //writeDataPoint(blockString)
    server.send(blockString, receiverDevicePort, receiverDeviceAddress, (err) => {
        if (err != null) {
            console.error(err);
        }
    });
}