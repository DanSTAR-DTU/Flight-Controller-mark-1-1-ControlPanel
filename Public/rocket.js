/*var socket = io.connect('0.0.0.0:3000');
var array
var split = {}


socket.on('info', function (data) {
    var a = document.getElementById("svg_data");
    a.addEventListener("load", function () {
        var svgDoc = a.contentDocument;
        var delta = svgDoc.getElementById("oxy")
        delta.addEventListener("mousedown", function () {
            array = data.replace(/,|;/gi,'');
            array = array.split(' ');
            for(var i = 0; i<=(array.length/2)+1; i=i+2){
                split[array[i]] = array[i+1]
            }
            console.log(split)
            svgDoc.getElementById('oxy').setAttribute('fill', 'green');

            socket.emit("dataFromClient", split)
        }, false);

    });

});
//'/([^,]+)([^;]+)/g'
*/
var socket = io.connect('0.0.0.0:3000');

// Valve States
var OPEN = "OPEN";
var CLOSED = "CLOSED";

var DATA = {
    V4: {svg_name: "V4", state: CLOSED, type: "VALVE", dom_element: null},
    V5: {svg_name: "V5", state: CLOSED, type: "VALVE", dom_element: null},
    V12: {svg_name: "V12", state: CLOSED, type: "VALVE", dom_element: null},
    V17: {svg_name: "V17", state: CLOSED, type: "VALVE", dom_element: null},

    PT_N2: {svg_name: "PT_N2", type: "PRESSURE_SENSOR", dom_element: null},
    PT_IPA: {svg_name: "PT_IPA", type: "PRESSURE_SENSOR", dom_element: null},
    PT_N2O: {svg_name: "PT_N2O", type: "PRESSURE_SENSOR", dom_element: null},

    TC_IPA: {svg_name: "TC_IPA", type: "TEMPERATURE_SENSOR", dom_element: null},
    TC_N2O: {svg_name: "TC_N2O", type: "TEMPERATURE_SENSOR", dom_element: null},

    FLO_IPA: {svg_name: "FLO_IPA", type: "FLOW_SENSOR", dom_element: null},
    FLO_N2O: {svg_name: "FLO_N2O", type: "FLOW_SENSOR", dom_element: null}
}

// INIT
window.onload = function () {
    initializeSVGElements();
    syncStateVisuals();
}


function initializeSVGElements() {
    var svgHTML = document.getElementById("DataSVG");
    var svgDoc = svgHTML.contentDocument;

    DATA.V4.dom_element = svgDoc.getElementById(DATA.V4.svg_name);
    DATA.V5.dom_element = svgDoc.getElementById(DATA.V5.svg_name);
    DATA.V12.dom_element = svgDoc.getElementById(DATA.V12.svg_name);
    DATA.V17.dom_element = svgDoc.getElementById(DATA.V17.svg_name);

    // Add listeners
    addValveButtonListener(svgDoc, DATA.V4);
    addValveButtonListener(svgDoc, DATA.V5);
    addValveButtonListener(svgDoc, DATA.V12);
    addValveButtonListener(svgDoc, DATA.V17);

    DATA.PT_N2 = svgDoc.getElementById(DATA.PT_N2.svg_name);
    DATA.PT_IPA = svgDoc.getElementById(DATA.PT_IPA.svg_name);
    DATA.PT_N2O = svgDoc.getElementById(DATA.PT_N2O.svg_name);

    DATA.TC_IPA = svgDoc.getElementById(DATA.TC_IPA.svg_name);
    DATA.TC_N2O = svgDoc.getElementById(DATA.TC_N2O.svg_name);

    DATA.FLO_IPA = svgDoc.getElementById(DATA.FLO_IPA.svg_name);
    DATA.FLO_N2O = svgDoc.getElementById(DATA.FLO_N2O.svg_name);
}

function syncStateVisuals() {
    updateValveVisual(DATA.V4);
    updateValveVisual(DATA.V5);
    updateValveVisual(DATA.V12);
    updateValveVisual(DATA.V17);
}

function updateValveVisual(valveElement) {
    // Valves
    switch(valveElement.state) {
        case OPEN:
            valveElement.dom_element.textContent = "OPEN";
            valveElement.dom_element.style.fill = "green";
            break;
        case CLOSED:
            valveElement.dom_element.textContent = "CLOSED";
            valveElement.dom_element.style.fill = "red";
            break;
        default:
            console.log("State unknown");
            break;
    }
}

function addValveButtonListener(svgDoc, dataElement) {
    // CSS properties to external object SVG
    svgDoc.getElementById(dataElement.svg_name).setAttribute("pointer-events", "none");
    svgDoc.getElementById(dataElement.svg_name + "_BUTTON").setAttribute("cursor", "pointer");

    // Add click listener
    svgDoc.getElementById(dataElement.svg_name + "_BUTTON").addEventListener("click", function() {
        console.log("Valve " + dataElement.svg_name + " pressed!");
        if (dataElement.state == CLOSED) {
            dataElement.state = OPEN;
        } else if (dataElement.state == OPEN) {
            dataElement.state = CLOSED;
        }
        updateValveVisual(dataElement);
        socket.emit("VALVE_PRESSED", {valve_name: dataElement.svg_name});
    });
}

socket.on('info', function (data) {
    console.log(data)
})
/*
var a = document.getElementById("DataSVG");
var stateArray = []
var valvesArr = []
//sets all valves to closed state
function preLoad() {
    var svgDoc = a.contentDocument;
    for (var i = 1; i <= 6; i++) {
        svgDoc.getElementById('vent'+i+'_text').textContent = "CLOSED";
        svgDoc.getElementById('vent'+i+'_text').style.fill = 'red';

        stateArray[i] = false

    }

}
// listensten to all click events on vents
a.addEventListener('load', function () {
    preLoad();
    valves(1);
    valves(2);
    valves(3);
    valves(4);
    actuator();
});

function valves(i) {
    var svgDoc = a.contentDocument
    var delta = svgDoc.getElementById("vent2-"+i);
    delta.addEventListener("click", function () {
        if (stateArray[i] == false) {
            svgDoc.getElementById('vent'+i+'_text').textContent = 'OPEN';
            svgDoc.getElementById('vent'+i+'_text').style.fill = 'green';
            stateArray[i] = true
        } else {
            svgDoc.getElementById('vent'+i+'_text').textContent = "CLOSED";
            svgDoc.getElementById('vent'+i+'_text').style.fill = 'red';
            stateArray[i] = false
        }
    })
}


function actuator() {
    var svgDoc = a.contentDocument;
    var delta = document.getElementById("openValveButton1")
    delta.addEventListener("click", function () {
        var input = document.getElementById('openValve1')
        console.log(input.value)
        if(input.value == 'close'){
            svgDoc.getElementById('vent5_text').textContent = "CLOSED";
            svgDoc.getElementById('vent5_text').style.fill = 'red';
        }else if (input.value == 'open') {
            svgDoc.getElementById('vent5_text').textContent = 'OPEN';
            svgDoc.getElementById('vent5_text').style.fill = 'green';
        }else{
            svgDoc.getElementById('vent5_text').textContent = input.value;
            svgDoc.getElementById('vent5_text').style.fill = 'green';
        }
    })
    var gamma = document.getElementById("openValveButton2")
    gamma.addEventListener("click", function () {
        var input = document.getElementById('openValve2')
        console.log(input.value)
        if(input.value == 'close'){
            svgDoc.getElementById('vent6_text').textContent = "CLOSED";
            svgDoc.getElementById('vent6_text').style.fill = 'red';
        }else if (input.value == 'open') {
            svgDoc.getElementById('vent6_text').textContent = 'OPEN';
            svgDoc.getElementById('vent6_text').style.fill = 'green';
        }else{
            svgDoc.getElementById('vent6_text').textContent = input.value;
            svgDoc.getElementById('vent6_text').style.fill = 'green';

        }
    })
}
*/