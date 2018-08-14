const express = require('express');
var socket  = require("socket.io");
var udp = require('dgram');
const fs = require('fs');
var app = express();

var server = app.listen('3000');
app.use(express.static('Public'));

// Front end
var io = socket(server)

// Beaglebone
var UDPSocket = udp.createSocket('udp4');

var startTime = Date.now();
var historyData = [];

var MODEL = {
    V4: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
    V5: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
    V12: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
    V17: {value: "CLOSED", type: "VALVE", lastUpdated: 0},

    PT_N2: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
    PT_IPA: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
    PT_N2O: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},

    TC_IPA: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
    TC_N2O: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

    TC_1: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
    TC_2: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
    TC_3: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
    TC_4: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
    TC_5: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
    TC_6: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

    FLO_IPA: {value: 0, type: "FLOW_SENSOR", lastUpdated: 0},
    FLO_N2O: {value: 0, type: "FLOW_SENSOR", lastUpdated: 0},

    LOAD: {value: 0, type: "LOAD_CELL", lastUpdated: 0},
}

//const UDP_IP = "192.168.2.2";
const UDP_IP = "localhost";
const UDP_PORT = 5000;

io.sockets.on('connection', function (socket) {
    console.log("client connected")
    socket.emit("graph_history", historyData);
});

// Make Beagle device send messages to this device
sendUDPheartbeat();
setInterval(() => {
    sendUDPheartbeat();
}, 10 * 1000);

// creating a client socket
UDPSocket.on('message', msg => {
    
    // Parse data
    var data = msg.toString();
    console.log("Data from Beagle:" + data);

    // Add data to history and emit
    update(JSON.parse(data));
});


function sendUDPheartbeat() {
    UDPSocket.send("Hi! I'm server :)", UDP_PORT, UDP_IP);
}

function update(block) {

    // Save to history
    var dataPoint = {block: block, timestamp: getSessionTime()};
    historyData.push(dataPoint);

    // Update model
    for (var key in block) {
        if (block.hasOwnProperty(key)) {
            MODEL[key].value = block[key];
        }
    }

    // Emit graph point
    io.sockets.emit("graph_data", dataPoint);

    // Emit model to clients
    io.sockets.emit("model_update", MODEL);
}

function getSessionTime() {
    return Date.now() - startTime;
}










