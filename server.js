let express = require('express');

let app = express();
let server = app.listen(3000);

app.use(express.static('public'));
console.log("my socket server")

let socket = require('socket.io');
let io = socket(server);

io.sockets.on('connection', function(socket){
    console.log('newConnection ' + socket.id);

    socket.on('mouse', function (data) {
        console.log("Received: 'mouse' " + data.x + " " + data.y);
        socket.broadcast.emit('mouse', data);
    }
)});

