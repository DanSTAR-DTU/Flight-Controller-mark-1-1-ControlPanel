
// File writing
var fs = require('fs');

// Networking
var socket = require("socket.io");
var udp = require('dgram');

// Web server
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
var historyData = {TC: [], VALVE: [], ACTUATOR: [], FLOW: [], PRESSURE: [], LOAD: []};
var timeStamp = {year:'', month:'', day:'', hours:'', minutes: '', seconds:''};
var MODEL = {
    SENSORS: {
        SV_FLUSH: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
        SV_N2O: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
        SV_N2O_FILL: {value: "CLOSED", type: "VALVE", lastUpdated: 0},
        SV_IPA: {value: "CLOSED", type: "VALVE", lastUpdated: 0},

        PT_N2: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_IPA: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_N2O: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_FUEL: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_OX: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_CHAM: {value: 0, type: "PRESSURE_SENSOR", lastUpdated: 0},

        TC_IPA: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_N2O: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

        TC_1: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_2: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_3: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_4: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_5: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_6: {value: 0, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

        FLO_IPA: {value: 0, initial: 20, accumulated: 0, type: "FLOW_SENSOR", lastUpdated: 0, density: 786},
        FLO_N2O: {value: 0, initial: 20, accumulated: 0, type: "FLOW_SENSOR", lastUpdated: 0, density: 1071},

        LOAD: {value: 0, type: "LOAD_CELL", lastUpdated: 0},

        ACT_IPA: {value: 0, type: "ACTUATOR", lastUpdated: 0},
        ACT_N2O: {value: 0, type: "ACTUATOR", lastUpdated: 0}
    },
    IS_LOGGING: false,
};

const UDP_IP = "192.168.2.2";
//const UDP_IP = "localhost";
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

    socket.on("valve", function (data) {
        if (data.value == "OPEN") {
            MODEL.SENSORS[data.name].value = "OPEN";
            sendToBeagle("VALVE", {name: data.name, value: "OPEN"});
        } else if (data.value == "CLOSED") {
            MODEL.SENSORS[data.name].value = "CLOSED";
            sendToBeagle("VALVE", {name: data.name, value: "CLOSED"});
        } else {
            console.log("Valve: " + data.name + " tried to set to value: " + data.value);
        }
        
    });

    socket.on('actuator_set', (data) => {
        console.log(data);
        // Update model
        if (data.type == "SINGLE") {
            if(data.name == "ACT_IPA_VALUE") {
                MODEL.SENSORS.ACT_IPA.value = data.value;
                sendToBeagle("ACTUATOR", {type: "SINGLE", name: "ACT_IPA_VALUE", value: data.value});
            } else if (data.name == "ACT_N2O_VALUE") {
                MODEL.SENSORS.ACT_N2O.value = data.value;
                sendToBeagle("ACTUATOR", {type: "SINGLE", name: "ACT_N2O_VALUE", value: data.value});
            }
        } else if (data.type == "BOTH") {
            MODEL.SENSORS.ACT_IPA.value = data.fuelValue;
            MODEL.SENSORS.ACT_N2O.value = data.oxidizerValue;
            sendToBeagle("ACTUATOR", {type: "BOTH", fuelValue: data.fuelValue, oxidizerValue: data.oxidizerValue});
        }
        
        emitModel();
    });

    socket.on('log_cmd', (data) => {
        switch(data) {
            case "START":
                MODEL.IS_LOGGING = true;
                startTime = Date.now();
                syncTime(timeStamp);
                emitModel();
                sendToBeagle("LOG_START", timeStamp);
                break;
            case "STOP":
                MODEL.IS_LOGGING = false;
                 sendToBeagle("LOG_STOP", '');
                 emitModel();
                break;
            case "RESET":
                // Clear history data
                historyData = {TC: [], VALVE: [], ACTUATOR: [], FLOW: [], PRESSURE: [], LOAD: []};
                io.sockets.emit("clear_graphs", 0);
                break;
            case "SAVE":
                var folder = "logs/";
                var sd = new Date(startTime);
                var now = new Date();
                var sTime = sd.getHours() + "_" + sd.getMinutes() + "_" + sd.getSeconds() + "__" + sd.getDate() + "_" + sd.getMonth() + "_" + sd.getFullYear();
                var nowTime = now.getHours() + "_" + now.getMinutes() + "_" + now.getSeconds() + "__" + now.getDate() + "_" + now.getMonth() + "_" + now.getFullYear();
                var filename = folder + sTime + "-" + nowTime + ".json";

                var jsonString = JSON.stringify(historyData);
                console.log(filename);
                fs.writeFile(filename, jsonString, 'utf-8', function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Wrote successfully!");
                    }
                });
                
                break;
            default:
                console.log("Unkown log command");
                break;
        }   
    });

    socket.on("initial_volume", (data) => {
        if(data.name == "INITIAL_FUEL") {
            MODEL.SENSORS.FLO_IPA.initial = data.value;
        } else if (data.name == "INITIAL_OXIDIZER") {
            MODEL.SENSORS.FLO_N2O.initial = data.value;
        }
        emitModel();
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
  //  console.log("Data from Beagle:" + data);

    // Add data to history and emit
    update(JSON.parse(data));
});

//sneding a signal every 10 sekunds
function sendUDPheartbeat() {
    sendToBeagle("HEARTBEAT", "");
}
//
function update(block) {

    switch (block.type) {
        case "TC_DATA":
            MODEL.SENSORS.TC_IPA.value = block.data.TC_IPA;
            MODEL.SENSORS.TC_N2O.value = block.data.TC_N2O;
            MODEL.SENSORS.TC_1.value = block.data.TC_1;
            MODEL.SENSORS.TC_2.value = block.data.TC_2;
            MODEL.SENSORS.TC_3.value = block.data.TC_3;
            MODEL.SENSORS.TC_4.value = block.data.TC_4;
            MODEL.SENSORS.TC_5.value = block.data.TC_5;
            MODEL.SENSORS.TC_6.value = block.data.TC_6;

            if(MODEL.IS_LOGGING) {
                var dataPoint = {data: block.data, timestamp: getSessionTime()};
                historyData.TC.push(dataPoint);
                io.sockets.emit("graph_data_tc", dataPoint);
            }
            
            break;
        case "FLOW_DATA":
            MODEL.SENSORS.FLO_IPA.value = block.data.FLO_IPA.value/1000.0;
            MODEL.SENSORS.FLO_IPA.accumulated = block.data.FLO_IPA.accumulated/1000.0;

            MODEL.SENSORS.FLO_N2O.value = block.data.FLO_N2O.value/1000.0;
            MODEL.SENSORS.FLO_N2O.accumulated = block.data.FLO_N2O.accumulated/1000.0;

            if (MODEL.IS_LOGGING) {
                var formattedBlock = {
                    FLO_IPA_VALUE: block.data.FLO_IPA.value/1000.0,
                    FLO_IPA_ACCUMULATED: block.data.FLO_IPA.accumulated/1000.0,
                    FLO_N2O_VALUE: block.data.FLO_N2O.value/1000.0,
                    FLO_N2O_ACCUMULATED: block.data.FLO_N2O.accumulated/1000.0,
                }
                var dataPoint = {data: formattedBlock, timestamp: getSessionTime()};
                historyData.FLOW.push(dataPoint);
                io.sockets.emit("graph_data_flow", dataPoint);
            }

            break;
        case "PRESSURE_DATA":
            MODEL.SENSORS.PT_IPA.value = block.data.PT_IPA;
            MODEL.SENSORS.PT_N2O.value = block.data.PT_N2O;
            MODEL.SENSORS.PT_N2.value = block.data.PT_N2;
            MODEL.SENSORS.PT_OX.value = block.data.PT_OX;
            MODEL.SENSORS.PT_FUEL.value = block.data.PT_FUEL;
            MODEL.SENSORS.PT_CHAM.value = block.data.PT_CHAM;

            if (MODEL.IS_LOGGING) {
                var dataPoint = {data: block.data, timestamp: getSessionTime()};
                historyData.PRESSURE.push(dataPoint);
                io.sockets.emit("graph_data_pressure", dataPoint);
            }
            
            break;
        case "LOAD_CELL_DATA":
            MODEL.SENSORS.LOAD.value = block.data.LOAD_CELL;

            if (MODEL.IS_LOGGING) {
                var dataPoint = {data: block.data, timestamp: getSessionTime()};
                historyData.LOAD.push(dataPoint);
                io.sockets.emit("graph_data_load", dataPoint);
            }

            break;
        default:
            console.log("Unknown block type: " + block.type);
    }

    emitModel();
    
}

function emitModel() {
    // Emit model to clients
    io.sockets.emit("model_update", MODEL);
    
}

function sendToBeagle(type, data) {
    UDPSocket.send(JSON.stringify({type: type, data: data}), UDP_PORT, UDP_IP);
}

function getSessionTime() {
    return Date.now() - startTime;
}

function syncTime(){
    timeStamp.year = new Date().getFullYear()
    timeStamp.month = new Date().getMonth()
    timeStamp.day = new Date().getDate()
    timeStamp.hours = new Date().getHours()
    timeStamp.minutes = new Date().getMinutes()
    timeStamp.seconds = new Date().getSeconds()
}


//gitfix




