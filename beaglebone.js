const SerialPort = require('serialport');
const dgram = require('dgram');
var server = dgram.createSocket('udp4');
//var port = new SerialPort('/ttyACM0', {baudRate: 56000}, function(err) {
  //  if(err){
 //       return console.log('Error: ', err.message);
 //   }
//});
var data = "s1, 21; s2, 20; s3, 21"

/*port.on('data', function (data) {
    data = new Buffer(data);
    console.log(data);
});*/

// port.on('readable', function () {
//   console.log('Data:', port.read());
// });

//UDP server.js
var PORT = 5000;
var HOST = '192.168.2.2';

//As soon as the server is ready to receive messages, handle it with this handler
server.on('listening', function () {
var address = server.address();
console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

//When getting a message, handle it like so:
server.on('message', function (message, remote) {
    //print out the message
    console.log(message)
    server.send(data, remote.port, remote.address);
  /* port.on('data', function (data) {
        data = new Buffer(data);
        //console.log(data.toString());
        server.send(data, remote.port, remote.address, function(err){
        if (err){
        throw err;
        }
        });
    }); */
});

server.bind(PORT, HOST);
