
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
var historyData = {TC: [], VALVE: [], FLOW: [], PRESSURE: [], LOAD: []};
var timeStamp = {year:'', month:'', day:'', hours:'', minutes: '', seconds:''};
var MODEL = {
    SENSORS: {
        SV_FLUSH: {value: "CLOSED", lastUpdated: 0},
        SV_N2O: {value: "CLOSED", lastUpdated: 0},
        SV_N2O_FILL: {value: "CLOSED", lastUpdated: 0},
        SV_IPA: {value: "CLOSED", lastUpdated: 0},

        PT_N2: {value: 0, lastUpdated: 0},
        PT_IPA: {value: 0, lastUpdated: 0},
        PT_N2O: {value: 0, lastUpdated: 0},
        PT_FUEL: {value: 0, lastUpdated: 0},
        PT_OX: {value: 0, lastUpdated: 0},
        PT_CHAM: {value: 0, lastUpdated: 0},

        TC_IPA: {value: 0, lastUpdated: 0},
        TC_N2O: {value: 0, lastUpdated: 0},

        TC_1: {value: 0, lastUpdated: 0},
        TC_2: {value: 0, lastUpdated: 0},
        TC_3: {value: 0, lastUpdated: 0},
        TC_4: {value: 0, lastUpdated: 0},
        TC_5: {value: 0, lastUpdated: 0},
        TC_6: {value: 0, lastUpdated: 0},

        FLO_IPA: {value: 0, initial: 20, accumulated: 0, lastUpdated: 0, density: 786},
        FLO_N2O: {value: 0, initial: 20, accumulated: 0, lastUpdated: 0, density: 1071},

        LOAD: {value: 0, lastUpdated: 0},

        ACT_IPA: {value: 0, lastUpdated: 0},
        ACT_N2O: {value: 0, lastUpdated: 0}
    },
    STATES: {
        NEUTRAL: {id: 1},
        OX_LOADING: {id: 2},
        PRESSURIZED_STANDBY: {id: 3},
        PRE_CHILL_N2O_LINE: {id: 4},
        IGNITION: {id: 5},
        BURN: {id: 6},
        SHUTDOWN: {id: 7},
        EMERGENCY: {id: 8}
    },
    ACTIVE_STATE_ID: 1,
    IS_LOGGING: false,
    TODAY_PRESSURE_BAR: 1.01800
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
            sendToBeagle("VALVE", {name: data.name, value: "OPEN"});
        } else if (data.value == "CLOSED") {
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
                sendToBeagle("ACTUATOR", {type: "SINGLE", name: "ACT_IPA_VALUE", value: data.value});
            } else if (data.name == "ACT_N2O_VALUE") {
                sendToBeagle("ACTUATOR", {type: "SINGLE", name: "ACT_N2O_VALUE", value: data.value});
            }
        } else if (data.type == "BOTH") {
            sendToBeagle("ACTUATOR", {type: "BOTH", fuelValue: data.fuelValue, oxidizerValue: data.oxidizerValue});
        }
        
        emitModel();
    });

    socket.on('log_cmd', (data) => {
        switch(data) {
            case "START":
                // Reset - clear history
                historyData = {TC: [], VALVE: [], ACTUATOR: [], FLOW: [], PRESSURE: [], LOAD: []};
                io.sockets.emit("clear_graphs", 0);

                // Init logging
                MODEL.IS_LOGGING = true;
                startTime = Date.now();
                syncTime(timeStamp);

                // Inform clients on both sides
                emitModel();
                sendToBeagle("LOG_START", timeStamp);
                break;
            case "STOP":
                // Terminate logging
                MODEL.IS_LOGGING = false;

                // Inform clients on both sides
                sendToBeagle("LOG_STOP", '');
                emitModel();

                // Save history
                saveLogToCSV();
                break;
            default:
                console.log("Unkown log command");
                break;
        }   
    });

    socket.on("reset_load_cell", (data) => {
        sendToBeagle("RESET_LOAD_CELL", "");
    });

    socket.on("reset_accumulated_flow", (data) => {
        sendToBeagle("RESET_ACCUMULATED_FLOW", "");
    });

    socket.on("initial_volume", (data) => {
        if(data.name == "INITIAL_FUEL") {
            MODEL.SENSORS.FLO_IPA.initial = data.value;
        } else if (data.name == "INITIAL_OXIDIZER") {
            MODEL.SENSORS.FLO_N2O.initial = data.value;
        }
        emitModel();
    });

    socket.on("today_pressure", data => {
        if (data.name == "TODAY_PRESSURE") {
            MODEL.TODAY_PRESSURE_BAR = data.value;
        }
        emitModel();
    });

    socket.on("state_set", data => {
        if (data.name == "STATE_ID") {
            sendToBeagle("STATE", {id: data.id});
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

    var updateTime = Date.now();

    switch (block.type) {
        case "TC_DATA":
            MODEL.SENSORS.TC_IPA.value = block.data.TC_IPA; MODEL.SENSORS.TC_IPA.lastUpdated = updateTime;
            MODEL.SENSORS.TC_N2O.value = block.data.TC_N2O; MODEL.SENSORS.TC_N2O.lastUpdated = updateTime;
            MODEL.SENSORS.TC_1.value = block.data.TC_1; MODEL.SENSORS.TC_1.lastUpdated = updateTime;
            MODEL.SENSORS.TC_2.value = block.data.TC_2; MODEL.SENSORS.TC_2.lastUpdated = updateTime;
            MODEL.SENSORS.TC_3.value = block.data.TC_3; MODEL.SENSORS.TC_3.lastUpdated = updateTime;
            MODEL.SENSORS.TC_4.value = block.data.TC_4; MODEL.SENSORS.TC_4.lastUpdated = updateTime;
            MODEL.SENSORS.TC_5.value = block.data.TC_5; MODEL.SENSORS.TC_5.lastUpdated = updateTime;
            MODEL.SENSORS.TC_6.value = block.data.TC_6; MODEL.SENSORS.TC_6.lastUpdated = updateTime;

            if(MODEL.IS_LOGGING) {
                var dataPoint = {data: block.data, timestamp: getSessionTime()};
                historyData.TC.push(dataPoint);
                io.sockets.emit("graph_data_tc", dataPoint);
            }
            
            break;
        case "FLOW_DATA":
            MODEL.SENSORS.FLO_IPA.value = block.data.FLO_IPA.value/1000.0;
            MODEL.SENSORS.FLO_IPA.accumulated = block.data.FLO_IPA.accumulated/1000.0;
            MODEL.SENSORS.FLO_IPA.lastUpdated = updateTime;

            MODEL.SENSORS.FLO_N2O.value = block.data.FLO_N2O.value/1000.0;
            MODEL.SENSORS.FLO_N2O.accumulated = block.data.FLO_N2O.accumulated/1000.0;
            MODEL.SENSORS.FLO_N2O.lastUpdated = updateTime;

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

            // Convert to absolute
            block.data.PT_IPA += MODEL.TODAY_PRESSURE_BAR;
            block.data.PT_N2O += MODEL.TODAY_PRESSURE_BAR;
            block.data.PT_N2 += MODEL.TODAY_PRESSURE_BAR;
            block.data.PT_OX += MODEL.TODAY_PRESSURE_BAR;
            block.data.PT_FUEL += MODEL.TODAY_PRESSURE_BAR;
            block.data.PT_CHAM += MODEL.TODAY_PRESSURE_BAR;    

            MODEL.SENSORS.PT_IPA.value = block.data.PT_IPA; MODEL.SENSORS.PT_IPA.lastUpdated = updateTime;
            MODEL.SENSORS.PT_N2O.value = block.data.PT_N2O; MODEL.SENSORS.PT_N2O.lastUpdated = updateTime;
            MODEL.SENSORS.PT_N2.value = block.data.PT_N2; MODEL.SENSORS.PT_N2.lastUpdated = updateTime;
            MODEL.SENSORS.PT_OX.value = block.data.PT_OX; MODEL.SENSORS.PT_OX.lastUpdated = updateTime;
            MODEL.SENSORS.PT_FUEL.value = block.data.PT_FUEL; MODEL.SENSORS.PT_FUEL.lastUpdated = updateTime;
            MODEL.SENSORS.PT_CHAM.value = block.data.PT_CHAM; MODEL.SENSORS.PT_CHAM.lastUpdated = updateTime;

            if (MODEL.IS_LOGGING) {
                var dataPoint = {data: block.data, timestamp: getSessionTime()};
                historyData.PRESSURE.push(dataPoint);
                io.sockets.emit("graph_data_pressure", dataPoint);
            }
            
            break;
        case "LOAD_CELL_DATA":
            block.data.LOAD_CELL *= (0.001 * 9.82);
            MODEL.SENSORS.LOAD.value = block.data.LOAD_CELL;
            MODEL.SENSORS.LOAD.lastUpdated = updateTime;

            if (MODEL.IS_LOGGING) {
                var dataPoint = {data: block.data, timestamp: getSessionTime()};
                historyData.LOAD.push(dataPoint);
                io.sockets.emit("graph_data_load", dataPoint);
            }

            break;
        case "VALVE_DATA":
            MODEL.SENSORS.SV_FLUSH.value = binaryToPosition(block.data.SV_FLUSH);
            MODEL.SENSORS.SV_N2O.value = binaryToPosition(block.data.SV_N2O);
            MODEL.SENSORS.SV_N2O_FILL.value = binaryToPosition(block.data.SV_N2O_FILL);
            MODEL.SENSORS.SV_IPA.value = binaryToPosition(block.data.SV_IPA);
            MODEL.SENSORS.ACT_IPA.value = block.data.ACT_IPA;
            MODEL.SENSORS.ACT_N2O.value = block.data.ACT_N2O;   
            
            // Last updated
            MODEL.SENSORS.SV_FLUSH.lastUpdated = updateTime;
            MODEL.SENSORS.SV_N2O.lastUpdated = updateTime;
            MODEL.SENSORS.SV_N2O_FILL.lastUpdated = updateTime;
            MODEL.SENSORS.SV_IPA.lastUpdated = updateTime;
            MODEL.SENSORS.ACT_IPA.lastUpdated = updateTime;
            MODEL.SENSORS.ACT_N2O.lastUpdated = updateTime;
            
            if(block.data.STATE > 0) {
                MODEL.ACTIVE_STATE_ID = block.data.STATE;
            }

            if (MODEL.IS_LOGGING) {
                var dataPoint = {data: block.data, timestamp: getSessionTime()};
                historyData.VALVE.push(dataPoint);
            }

            break;
        case "SENSOR_DATA":

            block.data.LOAD_CELL *= (0.001 * 9.82);
            MODEL.SENSORS.LOAD.value = block.data.load.LOAD_CELL;
            MODEL.SENSORS.LOAD.lastUpdated = updateTime;

            // Convert to absolute
            block.data.pressure.PT_IPA += MODEL.TODAY_PRESSURE_BAR;
            block.data.pressure.PT_N2O += MODEL.TODAY_PRESSURE_BAR;
            block.data.pressure.PT_N2 += MODEL.TODAY_PRESSURE_BAR;
            block.data.pressure.PT_OX += MODEL.TODAY_PRESSURE_BAR;
            block.data.pressure.PT_FUEL += MODEL.TODAY_PRESSURE_BAR;
            block.data.pressure.PT_CHAM += MODEL.TODAY_PRESSURE_BAR;    

            MODEL.SENSORS.PT_IPA.value = block.data.pressure.PT_IPA; MODEL.SENSORS.PT_IPA.lastUpdated = updateTime;
            MODEL.SENSORS.PT_N2O.value = block.data.pressure.PT_N2O; MODEL.SENSORS.PT_N2O.lastUpdated = updateTime;
            MODEL.SENSORS.PT_N2.value = block.data.pressure.PT_N2; MODEL.SENSORS.PT_N2.lastUpdated = updateTime;
            MODEL.SENSORS.PT_OX.value = block.data.pressure.PT_OX; MODEL.SENSORS.PT_OX.lastUpdated = updateTime;
            MODEL.SENSORS.PT_FUEL.value = block.data.pressure.PT_FUEL; MODEL.SENSORS.PT_FUEL.lastUpdated = updateTime;
            MODEL.SENSORS.PT_CHAM.value = block.data.pressure.PT_CHAM; MODEL.SENSORS.PT_CHAM.lastUpdated = updateTime;

            MODEL.SENSORS.TC_IPA.value = block.data.tc.TC_IPA; MODEL.SENSORS.TC_IPA.lastUpdated = updateTime;
            MODEL.SENSORS.TC_N2O.value = block.data.tc.TC_N2O; MODEL.SENSORS.TC_N2O.lastUpdated = updateTime;
            MODEL.SENSORS.TC_1.value = block.data.tc.TC_1; MODEL.SENSORS.TC_1.lastUpdated = updateTime;
            MODEL.SENSORS.TC_2.value = block.data.tc.TC_2; MODEL.SENSORS.TC_2.lastUpdated = updateTime;
            MODEL.SENSORS.TC_3.value = block.data.tc.TC_3; MODEL.SENSORS.TC_3.lastUpdated = updateTime;
            MODEL.SENSORS.TC_4.value = block.data.tc.TC_4; MODEL.SENSORS.TC_4.lastUpdated = updateTime;
            MODEL.SENSORS.TC_5.value = block.data.tc.TC_5; MODEL.SENSORS.TC_5.lastUpdated = updateTime;
            MODEL.SENSORS.TC_6.value = block.data.tc.TC_6; MODEL.SENSORS.TC_6.lastUpdated = updateTime;

            if (MODEL.IS_LOGGING) {
                var logtime = getSessionTime();
                
                var loadPoint = {data: block.data.load, timestamp: logtime};
                historyData.LOAD.push(loadPoint);

                var pressurePoint = {data: block.data.pressure, timestamp: logtime};
                historyData.PRESSURE.push(pressurePoint);

                var tcPoint = {data: block.data.tc, timestamp: logtime};
                historyData.TC.push(tcPoint);
            }

            break;
        default:
            console.log("Unknown block type: " + block.type);
    }

    emitModel();
    
}

function binaryToPosition(int) {
    if (int == 0) {
        return "CLOSED";
    } else if (int == 1) {
        return "OPEN";
    } else {
        return "ERROR";
    }
}

function emitModel() {
    // Emit model to clients
    io.sockets.emit("model_update", MODEL);
    
}

function sendToBeagle(type, data) {
    var packetStr = JSON.stringify({type: type, data: data})
    console.log("Sent to Beagle:" + packetStr);
    UDPSocket.send(packetStr, UDP_PORT, UDP_IP);
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

function saveLogToCSV() {
  
    // Create filename based on datetime
    var sd = new Date(startTime);
    var now = new Date();
    var sTime = sd.getHours() + "_" + sd.getMinutes() + "_" + sd.getSeconds() + "__" + sd.getDate() + "_" + sd.getMonth() + "_" + sd.getFullYear();
    var nowTime = now.getHours() + "_" + now.getMinutes() + "_" + now.getSeconds() + "__" + now.getDate() + "_" + now.getMonth() + "_" + now.getFullYear();

    var folder = "logs/" + sTime + "-" + nowTime + "/";
    var filename;

    // Make folder for this session's logs
    !fs.existsSync(folder) && fs.mkdirSync(folder);

    // Write flows to CSV
    filename = folder + sTime + "-" + nowTime + "_flows.csv";
    writeSensorBranch(filename, ["FLO_IPA_VALUE", "FLO_IPA_ACCUMULATED", "FLO_N2O_VALUE", "FLO_N2O_ACCUMULATED"], historyData.FLOW);

    // Write pressures to CSV
    filename = folder + sTime + "-" + nowTime + "_pressure.csv";
    writeSensorBranch(filename, ["PT_IPA", "PT_N2O", "PT_N2", "PT_FUEL", "PT_OX", "PT_CHAM"], historyData.PRESSURE);

    // Write temperatures to CSV
    filename = folder + sTime + "-" + nowTime + "_temperatures.csv";
    writeSensorBranch(filename, ["TC_IPA", "TC_N2O", "TC_1", "TC_2", "TC_3", "TC_4", "TC_5", "TC_6"], historyData.TC);

    // Write valves to CSV
    filename = folder + sTime + "-" + nowTime + "_valves.csv";
    writeSensorBranch(filename, ["SV_FLUSH", "SV_N2O", "SV_N2O_FILL", "SV_IPA", "ACT_IPA", "ACT_N2O"], historyData.VALVE);

    // Write valves to CSV
    filename = folder + sTime + "-" + nowTime + "_load.csv";
    writeSensorBranch(filename, ["LOAD_CELL"], historyData.LOAD);
    
}

// Write a part of historyData to CSV
function writeSensorBranch(filename, columns, branch) {

    var stream = fs.createWriteStream(filename, {flags : 'a'});
    
    // Give feedback when finished
    stream.on("finish", function() {
        console.log("File: " + filename + " written.");
    });

    // Write header with TIMESTAMP, column1, column2, ...
    var header = "TIMESTAMP,"
    columns.forEach((item, index) => {
        header += item + ","
    });

    // Remove last "," from concatenation and write to file
    header = header.slice(0, -1);
    header += "\n";
    stream.write(header);

    // Append rows. One block per row.
    branch.forEach((block) => {

        // Start row with TIMESTAMP
        var row = block.timestamp + ",";

        // Concatenate measures as columns
        columns.forEach((sensorName) => {
            row += block.data[sensorName] + ",";
        });

        // Remove last "," from concatenation and write to file
        row = row.slice(0, -1);
        row += "\n";
        stream.write(row);
    });

    // Close resource
    stream.end();

}

