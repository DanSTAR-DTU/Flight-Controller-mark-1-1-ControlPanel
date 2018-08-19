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

var stateSensors = [
    {name: "SV_FLUSH", states : ["OPEN", "CLOSED"]},
    {name: "SV_N2O", states : ["OPEN", "CLOSED"]},
    {name: "SV_N2O_FILL", states : ["OPEN", "CLOSED"]},
    {name: "SV_IPA", states : ["OPEN", "CLOSED"]}
];

setInterval(() => {
    var block = generateDataBlock();
    sendBlock(block);
}, 1000);

function sendBlock(block) {
    if (receiverDeviceAddress == null || receiverDevicePort == null) {
        console.log("Receiver information not available");
        return;
    }

    var blockString = JSON.stringify(block);
    console.log("Sending: " + blockString + "\n");
    socket.send(blockString, receiverDevicePort, receiverDeviceAddress, (err) => {
        if (err != null) {
            console.error(err);
        }
    });
}

function generateDataBlock() {
    var blockObject = {};

    for (sensor of numericSensors) {
        var rNum = Math.random() * 2 - 1;
        sensor.last += rNum;
        sensor.last = parseFloat(sensor.last.toFixed(2));
        sensor.last = Math.max(Math.min(sensor.last, sensor.max), sensor.min);
        blockObject[sensor.name] = sensor.last;
    }

    for (sensor of stateSensors) {
        var state = sensor.states[Math.floor(Math.random() * sensor.states.length)];
        blockObject[sensor.name] = state;
    }

    return blockObject;
}

function rand(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
