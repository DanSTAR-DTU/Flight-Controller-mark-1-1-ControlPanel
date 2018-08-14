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

var sensors = [
    {name: "LOAD", min: 0, max: 3, last: 0},
    {name: "TC_IPA", min: 40, max: 70, last: 0},
    {name: "TC_N2O", min: -100, max: 10, last: 0},
    {name: "PT_N2", min: 30, max: 60, last: 0}
];

setInterval(() => {
    var block = generateDataBlock();
    sendBlock(block);
}, 750);

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

function generateDataBlock() {
    var blockObject = {};

    for (sensor of sensors) {
        blockObject[sensor.name] = rand(sensor.min, sensor.max);
    }

    return blockObject;
}

function rand(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}
