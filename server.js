
var socket = require("socket.io");
var udp = require('dgram');

var express = require('express');
var favicon = require('serve-favicon')
var path = require('path')

var app = express();
var server = app.listen('3000');
app.use(express.static('Public'));
app.use(favicon(path.join(__dirname, 'Public/res', 'favicon.png')))

// Front end
var io = socket(server)

// Beaglebone
var UDPSocket = udp.createSocket('udp4');

var startTime = Date.now();
var historyData = [];

var MODEL = {
    SENSORS: {
        V4: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
        V5: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
        V12: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
        V17: {value: "CLOSED", type: "VALVE", lastUpdated: 0},

        PT_N2: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_IPA: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_N2O: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_INJ_IPA: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_INJ_N2O: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_CHAM: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},

        TC_IPA: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_N2O: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

        TC_1: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_2: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_3: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_4: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_5: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_6: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

        FLO_IPA: {value: 0, type: "FLOW_SENSOR", lastUpdated: 0, density: 100},
        FLO_N2O: {value: 0, type: "FLOW_SENSOR", lastUpdated: 0, density: 101},

        LOAD: {value: 0, type: "LOAD_CELL", lastUpdated: 0},

        ACT_IPA: {value: 0, type: "ACTUATOR", lastUpdated: 0},
        ACT_N2O: {value: 0, type: "ACTUATOR", lastUpdated: 0}
    },
    IS_LOGGING: false,
    INITIAL_FUEL: 0
}

//const UDP_IP = "192.168.2.2";
const UDP_IP = "localhost";
const UDP_PORT = 5000;

io.sockets.on('connection', function (socket) {
    console.log("client connected")
    socket.emit("graph_history", historyData);

    socket.on("flowrate_density_change", (data) => {
        if (!isNaN(data.density)) {
            MODEL.SENSORS[data.name].density = data.density;
            console.log("Flowrate density changed to " + MODEL.SENSORS[data.name].density);
            emitModel();
        } else {
            console.log("Flowrate tried to set to NaN!");
        }
    });

    socket.on("refresh_model", (data) => {
        emitModel();
    });

    socket.on("VALVE", function (data) {
        UDPSocket.send(data.valve_name,  UDP_PORT,UDP_IP)
        console.log(data.valve_name)
    });

    socket.on('log_cmd', (data) => {
        switch(data) {
            case "START":
                MODEL.IS_LOGGING = true;
                startTime = Date.now();
                break;
            case "STOP":
                MODEL.IS_LOGGING = false;
                break;
            case "RESET":
                // Clear history data
                historyData = [];
                io.sockets.emit("clear_graphs", 0);
                break;
            case "SAVE":
                // TODO?
                break;
            default:
                console.log("Unkown log command");
                break;
        }   
    });

    socket.on("initial_fuel", (data) => {
        MODEL.INITIAL_FUEL = data.initialFuel;
        console.log("Initial fuel: " + MODEL.INITIAL_FUEL);
    });
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


    var dataPoint = {block: block, timestamp: getSessionTime()};

    if (MODEL.IS_LOGGING) {
        historyData.push(dataPoint);
        // Emit graph point
        io.sockets.emit("graph_data", dataPoint);
    }

    // Update model
    for (var key in block) {
        if (block.hasOwnProperty(key)) {
            MODEL.SENSORS[key].value = block[key];
        }
    }

    emitModel();
    
}

function emitModel() {
    // Emit model to clients
    io.sockets.emit("model_update", MODEL);
}

function getSessionTime() {
    return Date.now() - startTime;
}








