const express = require('express');
var socket  = require("socket.io");
var udp = require('dgram');
const fs = require('fs');
var app = express();

var server = app.listen('3000');
app.use(express.static('Public'));

var io = socket(server)
var UDPSocket = udp.createSocket('udp4');

var startTime = Date.now();
var accData = [];

//const UDP_IP = "192.168.2.2";
const UDP_IP = "localhost";
const UDP_PORT = 5000;

io.sockets.on('connection', function (socket) {
    console.log("client connected")
    //socket.emit('dataToClient', {hello: "world"});
    var data = "hello world";
    UDPSocket.send(data, UDP_PORT, UDP_IP);
    socket.on('dataFromClient', function (data) {

        UDPSocket.send(data.s1, UDP_PORT, UDP_IP)
    });
});

// Make Beagle device send messages to this device
sendUDPheartbeat();
setInterval(() => {
    sendUDPheartbeat();
}, 10 * 1000);

// creating a client socket
UDPSocket.on('message', msg => {
    var data = msg.toString()
    console.log("Data from Beagle:" + data);
    var parsedBlock = parseRaw(data);
    io.sockets.emit("info", parsedBlock);
    console.log("Emitted: " + JSON.stringify(parsedBlock) + "\n");
});

// For testing
app.get("/adddata", function(req, res) {
    var value = parseInt(req.query.value);
    io.sockets.emit("graph_data", {value: value, timestamp: Date.now() - startTime});
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
        parsedData[name] = value;
    }
    return parsedData;
}













