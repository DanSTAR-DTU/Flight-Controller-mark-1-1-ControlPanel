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
    {name: "SV_FLUSH", states : ["OPEN", "CLOSED"]},
    {name: "SV_N2O", states : ["OPEN", "CLOSED"]},
    {name: "SV_N2O_FILL", states : ["OPEN", "CLOSED"]},
    {name: "SV_IPA", states : ["OPEN", "CLOSED"]}
];

var pressures = [
    {name: "PT_N2", min: 30, max: 60, last: 45},
    {name: "PT_IPA", min: 30, max: 60, last: 45},
    {name: "PT_N2O", min: 30, max: 60, last: 45},
    {name: "PT_FUEL", min: 30, max: 60, last: 45},
    {name: "PT_OX", min: 30, max: 60, last: 45},
    {name: "PT_CHAM", min: 30, max: 60, last: 45}
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
    {name: "FLO_IPA", min: 0.1, max: 2, last: 1},
    {name: "FLO_N2O", min: 0.1, max: 2, last: 1}
];

setInterval(() => {
    sendBlock(generateDataBlock("TC_DATA", temperatures));

    setTimeout(function() {
        sendBlock(generateFlow());
    }, 100);

    setTimeout(function() {
        sendBlock(generateDataBlock("LOAD_CELL_DATA", load));
    }, 200);

    setTimeout(function() {
        sendBlock(generateDataBlock("PRESSURE_DATA", pressures));
        console.log("");
    }, 300);
    
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
    var block = {
        type: "FLOW_DATA", 
        data: {
            FLO_IPA: {
                value : rand(flows[0]), 
                accumulated: 7
            },
            FLO_N2O: {
                value : rand(flows[0]), 
                accumulated: 4
            }
        }
    }

    return block;
}

function generateDataBlock(typename, listOfSensors) {
    var blockObject = {type: typename, data: {}};

    for (sensor of listOfSensors) {
        var rNum = Math.random() * 2 - 1;
        sensor.last += rNum;
        sensor.last = parseFloat(sensor.last.toFixed(2));
        sensor.last = Math.max(Math.min(sensor.last, sensor.max), sensor.min);
        blockObject.data[sensor.name] = sensor.last;
    }

    return blockObject;
}

function rand(sensor) {
    var rNum = Math.random() * 2 - 1;
    sensor.last += rNum;
    sensor.last = parseFloat(sensor.last.toFixed(2));
    sensor.last = Math.max(Math.min(sensor.last, sensor.max), sensor.min);
    return sensor.last;
}


