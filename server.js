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

    FLO_IPA: {value: 0, type: "FLOW_SENSOR", lastUpdated: 0},
    FLO_N2O: {value: 0, type: "FLOW_SENSOR", lastUpdated: 0},

    LOAD: {value: 0, type: "LOAD_CELL", lastUpdated: 0},
}

var DICTIONARY = {
    v1 : "V4",
    v2 : "V5",
    v3 : "V12",
    v4 : "V17",
    p1 : "PT_N2",
    p2 : "PT_IPA",
    p3 : "PT_N2O",
    t1 : "TC_IPA",
    t2 : "TC_N2O",
    f1 : "FLO_IPA",
    f1 : "FLO_N2O",
    l1 : "LOAD",
};

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
    var data = msg.toString()
    var parsedBlock = parseRaw(data);
    console.log("Data from Beagle:" + data);

    // Add data to history and emit
    update(parsedBlock);
    console.log("Emitted: " + JSON.stringify(parsedBlock) + "\n");
});

// For testing
app.get("/adddata", function(req, res) {
    var value = parseInt(req.query.value);
    io.sockets.emit("graph_data", {value: value, timestamp: getSessionTime()});
    res.send("Received: " + value + "\n");
});

//sending msg
/*client.send(data,5000,"192.168.2.2",function(error){
    if(error){
        client.close();
    }else{
        console.log('Data sent !!!');
    }
});
*/

function sendUDPheartbeat() {
    UDPSocket.send("Hi! I'm server :)", UDP_PORT, UDP_IP);
}

function parseRaw(block) {
    var parsedData = {};

    // Remove white space
    var trimmedBlock = block.replace(/\s/g, "");
    
    // Split string into array by sensor seperator ";"
    var sensors = trimmedBlock.split(/;/g);
    // Regex splits also on last ";", so remove last element
    sensors.pop();

    for (var i = 0; i < sensors.length; i++) {
        // Split each sensor name and value by seperator ","
        var nameValueSplit = sensors[i].split(/,/g);
        
        var name = nameValueSplit[0];
        var value = parseFloat(nameValueSplit[1]);
        
        // Add to parsed data object
        parsedData[DICTIONARY[name]] = value;
    }
    return parsedData;
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










