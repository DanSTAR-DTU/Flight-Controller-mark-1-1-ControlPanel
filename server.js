const express = require('express');
var socket  = require("socket.io");
var udp = require('dgram');

var app = express();
var server = app.listen('3000');
app.use(express.static('Public'));

var io = socket(server)
var client = udp.createSocket('udp4');

io.sockets.on('connection', function (socket) {
    console.log("client connected")
    // socket.emit('dataToClient', {hello: "world"});
    //buffer msg
    var data = Buffer.from('Hello world');
    client.send(data,5000,"192.168.2.2");
    socket.on('dataFromClient', function (data) {
        console.log(data);
    });
});




// creating a client socket




client.on('message',function(msg,info){
    console.log('Data received from server : ' + msg.toString());
    console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
    io.sockets.emit("info", {data:"Win!"})
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













