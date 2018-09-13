const dgram = require('dgram');
var socket = dgram.createSocket('udp4');

var receiverDeviceAddress;
var receiverDevicePort;

const PORT = 5000;

socket.on('listening', function () {
    var address = socket.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

// This device will send messages to the last device that
// sent a message to this device.
socket.on("message", (message, remote) => {
    console.log("Message: \"" + message + "\" from device: " + remote.address + ":" + remote.port);
    receiverDeviceAddress = remote.address;
    receiverDevicePort = remote.port;
    switch(JSON.parse(message).type) {
        case "RESET_ACCUMULATED_FLOW":
            flows[0].accumulatedLast = 0;
            flows[1].accumulatedLast = 0;             
        break;    
    }
});

//socket.bind(PORT, HOST);
socket.bind(PORT);

var numericSensors = [
    {name: "LOAD", min: 0, max: 80, last: 40},

    {name: "TC_IPA", min: 40, max: 70, last: 55},
    {name: "TC_N2O", min: -100, max: 10, last: -55},

    {name: "TC_1", min: -100, max: 300, last: 100},
    {name: "TC_2", min: -100, max: 300, last: 100},
    {name: "TC_3", min: -100, max: 300, last: 100},
    {name: "TC_4", min: -100, max: 300, last: 100},
    {name: "TC_5", min: -100, max: 300, last: 100},
    {name: "TC_6", min: -100, max: 300, last: 100},

    {name: "PT_N2", min: 30, max: 60, last: 45},
    {name: "PT_IPA", min: 30, max: 60, last: 45},
    {name: "PT_N2O", min: 30, max: 60, last: 45},
    {name: "PT_INJ_IPA", min: 30, max: 60, last: 45},
    {name: "PT_INJ_N2O", min: 30, max: 60, last: 45},
    {name: "PT_CHAM", min: 30, max: 60, last: 45},

    {name: "FLO_IPA", min: 0.1, max: 2, last: 1},
    {name: "FLO_N2O", min: 0.1, max: 2, last: 1},

    {name: "ACT_IPA", min: 0, max: 100, last: 50},
    {name: "ACT_N2O", min: 0, max: 100, last: 50}
];

var valves = [
    {name: "SV_FLUSH", states : [0,1]},
    {name: "SV_N2O", states : [0,1]},
    {name: "SV_N2O_FILL", states : [0,1]},
    {name: "SV_IPA", states : [0,1]}
];

var actuators = [
    {name: "ACT_IPA", min: 30, max: 60, last: 45},
    {name: "ACT_N2O", min: 30, max: 60, last: 45}
];

var pressures = [
    {name: "PT_N2", min: 30, max: 60, last: 45},
    {name: "PT_IPA", min: 30, max: 60, last: 45},
    {name: "PT_N2O", min: 30, max: 60, last: 45},
    {name: "PT_FUEL", min: 30, max: 60, last: 45},
    {name: "PT_OX", min: 30, max: 60, last: 45},
    {name: "PT_CHAM", min: 0, max: 60, last: 0}
];

var temperatures = [
    {name: "TC_IPA", min: 40, max: 70, last: 55},
    {name: "TC_N2O", min: -100, max: 10, last: -55},
    {name: "TC_1", min: -100, max: 300, last: 100},
    {name: "TC_2", min: -100, max: 300, last: 100},
    {name: "TC_3", min: -100, max: 300, last: 100},
    {name: "TC_4", min: -100, max: 300, last: 100},
    {name: "TC_5", min: -100, max: 300, last: 100},
    {name: "TC_6", min: -100, max: 300, last: 100}
];

var load = [
    {name: "LOAD_CELL", min: 0, max: 80, last: 40},
];

var flows = [
    {name: "FLO_IPA", min: 0, max: 1000, last: 500, accumulatedLast: 0},
    {name: "FLO_N2O", min: 0, max: 1000, last: 500, accumulatedLast: 0}
];

setInterval(() => {
    sendBlock(generateSensorBoardDataBlock());

    setTimeout(function() {
        sendBlock(generateFlow());
    }, 100);

    setTimeout(function() {
        sendBlock(generateValveBlock("VALVE_DATA", valves, actuators));
        console.log("");
    }, 400);
    
}, 2000);

function sendBlock(block) {
    if (receiverDeviceAddress == null || receiverDevicePort == null) {
        console.log("Receiver information not available");
        return;
    }

    var blockString = JSON.stringify(block);
    console.log("Sending: " + blockString);
    socket.send(blockString, receiverDevicePort, receiverDeviceAddress, (err) => {
        if (err != null) {
            console.error(err);
        }
    });
}

function generateFlow() {
    flows[0].accumulatedLast += flows[0].last;
    flows[1].accumulatedLast += flows[1].last;    

    var block = {
        type: "FLOW_DATA", 
        data: {
            FLO_IPA: {
                value : rand(flows[0], 200), 
                accumulated: flows[0].accumulatedLast
            },
            FLO_N2O: {
                value : rand(flows[1], 200), 
                accumulated: flows[1].accumulatedLast
            }
        }
    }

    return block;
}

function generateSensorBoardDataBlock() {
    var blockObject = {type: "SENSOR_DATA", data: {
        tc: {},
        pressure: {},
        load: {}
    }};

    for (sensor of temperatures) {
        blockObject.data.tc[sensor.name] = rand(sensor, 2);
    }

    for (sensor of pressures) {
        blockObject.data.pressure[sensor.name] = rand(sensor, 2);
    }

    blockObject.data.load["LOAD_CELL"] = rand(load[0], 2);

    return blockObject;

} 

function generateDataBlock(typename, listOfSensors, step) {
    var blockObject = {type: typename, data: {}};

    for (sensor of listOfSensors) {
        blockObject.data[sensor.name] = rand(sensor, step);
    }

    return blockObject;
}

function generateValveBlock(typename, listOfValves, listOfActuator) {
    var blockObject = {type: typename, data: {}};

    for (sensor of listOfValves) {
        blockObject.data[sensor.name] = sensor.states[Math.floor(Math.random() * 2)];
    }
    
    for (sensor of listOfActuator) {
        blockObject.data[sensor.name] = Math.floor(rand(sensor, 2));
    }

    return blockObject;
}

function rand(sensor, step) {
    var rNum = Math.random() * step - (step / 2.0);
    sensor.last += rNum;
    sensor.last = parseFloat(sensor.last.toFixed(2));
    sensor.last = Math.max(Math.min(sensor.last, sensor.max), sensor.min);
    return sensor.last;
}


