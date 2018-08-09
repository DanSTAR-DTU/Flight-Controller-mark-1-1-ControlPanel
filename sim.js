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
    {name: "s1", min: 30, max: 60},
    {name: "s2", min: 40, max: 70},
    {name: "s3", min: -100, max: 10},
    {name: "s4", min: 30, max: 60}
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

    console.log("Sending: " + block);
    socket.send(block, receiverDevicePort, receiverDeviceAddress, (err) => {
        if (err != null) {
            console.error(err);
        }
    });
}

function generateDataBlock() {
    var blockString = "";

    for (sensor of sensors) {
        blockString += generateSensorOutput(sensor);
    }

    return blockString
}

function generateSensorOutput(sensor) {
    return sensor.name 
            + "," 
            + rand(sensor.min, sensor.max)
            + ";";
}

function rand(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}
