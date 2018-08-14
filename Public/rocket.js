var socket = io.connect('0.0.0.0:3000');

// Valve States
var OPEN = "OPEN";
var CLOSED = "CLOSED";

var DATA = {
    V4: {svg_name: "V4", value: CLOSED, type: "VALVE", dom_element: null},
    V5: {svg_name: "V5", value: CLOSED, type: "VALVE", dom_element: null},
    V12: {svg_name: "V12", value: CLOSED, type: "VALVE", dom_element: null},
    V17: {svg_name: "V17", value: CLOSED, type: "VALVE", dom_element: null},

    PT_N2: {svg_name: "PT_N2", value: 0, type: "PRESSURE_SENSOR", dom_element: null},
    PT_IPA: {svg_name: "PT_IPA", value: 0, type: "PRESSURE_SENSOR", dom_element: null},
    PT_N2O: {svg_name: "PT_N2O", value: 0, type: "PRESSURE_SENSOR", dom_element: null},

    TC_IPA: {svg_name: "TC_IPA", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
    TC_N2O: {svg_name: "TC_N2O", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},

    TC_1: {svg_name: "TC_1", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
    TC_2: {svg_name: "TC_2", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
    TC_3: {svg_name: "TC_3", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
    TC_4: {svg_name: "TC_4", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
    TC_5: {svg_name: "TC_5", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
    TC_6: {svg_name: "TC_6", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},

    FLO_IPA: {svg_name: "FLO_IPA", value: 0, type: "FLOW_SENSOR", dom_element: null, density: 0},
    FLO_N2O: {svg_name: "FLO_N2O", value: 0, type: "FLOW_SENSOR", dom_element: null, density: 0},

    LOAD: {html_name: "load_cell_text", value: 0, type: "LOAD_CELL", dom_element: null}
}

// Flowrate panel 
var fuelDensityButtonLocked = false;
var oxidizerDensityButtonLocked = false;

// INIT (wait on SVG)
window.onload = function () {
    initializeSVGElements();
    addFlowratePanelListeners();
    socket.emit("refresh_model", {});
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

    DATA.PT_N2.dom_element = svgDoc.getElementById(DATA.PT_N2.svg_name);
    DATA.PT_IPA.dom_element = svgDoc.getElementById(DATA.PT_IPA.svg_name);
    DATA.PT_N2O.dom_element = svgDoc.getElementById(DATA.PT_N2O.svg_name);

    DATA.TC_IPA.dom_element = svgDoc.getElementById(DATA.TC_IPA.svg_name);
    DATA.TC_N2O.dom_element = svgDoc.getElementById(DATA.TC_N2O.svg_name);

    DATA.TC_1.dom_element = svgDoc.getElementById(DATA.TC_1.svg_name);
    DATA.TC_2.dom_element = svgDoc.getElementById(DATA.TC_2.svg_name);
    DATA.TC_3.dom_element = svgDoc.getElementById(DATA.TC_3.svg_name);
    DATA.TC_4.dom_element = svgDoc.getElementById(DATA.TC_4.svg_name);
    DATA.TC_5.dom_element = svgDoc.getElementById(DATA.TC_5.svg_name);
    DATA.TC_6.dom_element = svgDoc.getElementById(DATA.TC_6.svg_name);

    DATA.FLO_IPA.dom_element = svgDoc.getElementById(DATA.FLO_IPA.svg_name);
    DATA.FLO_N2O.dom_element = svgDoc.getElementById(DATA.FLO_N2O.svg_name);

    DATA.LOAD.dom_element = document.getElementById(DATA.LOAD.html_name);
}

function syncVisuals() {
    updateValveVisual(DATA.V4);
    updateValveVisual(DATA.V5);
    updateValveVisual(DATA.V12);
    updateValveVisual(DATA.V17);

    updatePressureSensor(DATA.PT_IPA);
    updatePressureSensor(DATA.PT_N2O);
    updatePressureSensor(DATA.PT_N2);

    updateTemperatureSensor(DATA.TC_IPA);
    updateTemperatureSensor(DATA.TC_N2O);

    updateTemperatureSensor(DATA.TC_1);
    updateTemperatureSensor(DATA.TC_2);
    updateTemperatureSensor(DATA.TC_3);
    updateTemperatureSensor(DATA.TC_4);
    updateTemperatureSensor(DATA.TC_5);
    updateTemperatureSensor(DATA.TC_6);

    updateFlowSensor(DATA.FLO_IPA);
    updateFlowSensor(DATA.FLO_N2O);
    
    updateLoadCell(DATA.LOAD);

    updateFlowratePanel();
}

function updateValveVisual(valveElement) {
    // Valves
    switch(valveElement.value) {
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

function updateLoadCell(loadSensor) {
    loadSensor.dom_element.innerHTML = loadSensor.value;
}

function updatePressureSensor(pressureSensor) {
    pressureSensor.dom_element.innerHTML = pressureSensor.value + " bar";
}

function updateTemperatureSensor(temperatureSensor) {
    temperatureSensor.dom_element.innerHTML = temperatureSensor.value + " °C";
}

function updateFlowSensor(flowSensor) {
    flowSensor.dom_element.innerHTML = flowSensor.value + " kg/s";
}

function updateFlowratePanel() {
    var fuelDensityInput = document.getElementById("flowrate_fuel_density_input");
    fuelDensityInput.value = DATA.FLO_IPA.density;
    var oxidizerDensityInput = document.getElementById("flowrate_oxidizer_density_input");
    oxidizerDensityInput.value = DATA.FLO_N2O.density;
}

function addValveButtonListener(svgDoc, dataElement) {
    // CSS properties to external object SVG
    svgDoc.getElementById(dataElement.svg_name).setAttribute("pointer-events", "none");
    svgDoc.getElementById(dataElement.svg_name + "_BUTTON").setAttribute("cursor", "pointer");

    // Add click listener
    svgDoc.getElementById(dataElement.svg_name + "_BUTTON").addEventListener("click", function() {
        console.log("Valve " + dataElement.svg_name + " pressed!");
        if (dataElement.value == CLOSED) {
            dataElement.value = OPEN;
        } else if (dataElement.value == OPEN) {
            dataElement.value = CLOSED;
        }
        updateValveVisual(dataElement);
        socket.emit("VALVE", {valve_name: dataElement.svg_name});

    });
}

function addFlowratePanelListeners() {
    var fuelDensityInput = document.getElementById("flowrate_fuel_density_input");
    var oxidizerDensityInput = document.getElementById("flowrate_oxidizer_density_input");
    var fuelDensityButton = document.getElementById("flowrate_fuel_density_update");
    var oxidizerDensityButton = document.getElementById("flowrate_oxidizer_density_update");

    // Initial disable
    fuelDensityButtonLocked = true;
    fuelDensityButton.innerHTML = "Unlock";
    fuelDensityInput.classList.add("input_field_disabled");

    oxidizerDensityButtonLocked = true;
    oxidizerDensityButton.innerHTML = "Unlock";
    oxidizerDensityInput.classList.add("input_field_disabled");
    
    // Add click listeners
    fuelDensityButton.addEventListener("click", function() {
        if (fuelDensityButtonLocked) {
            fuelDensityInput.classList.remove("input_field_disabled");
            fuelDensityButtonLocked = false;
            fuelDensityButton.innerHTML = "Lock";
        } else {
            
            var fuelDensity = parseFloat(fuelDensityInput.value);
            if (!isNaN(fuelDensity)) {
                fuelDensityInput.classList.add("input_field_disabled");
                fuelDensityButtonLocked = true;
                fuelDensityButton.innerHTML = "Unlock";
                console.log("Fuel density: " + fuelDensity);
                socket.emit("flowrate_density_change", {name: "FLO_IPA", density: fuelDensity});
            } else {
                alert("Please input number!");
            }
            
        } 
    });

    oxidizerDensityButton.addEventListener("click", function() {
        if (oxidizerDensityButtonLocked) {
            oxidizerDensityInput.classList.remove("input_field_disabled");
            oxidizerDensityButtonLocked = false;
            oxidizerDensityButton.innerHTML = "Lock";

        } else {
            
            var oxidizerDensity = parseFloat(oxidizerDensityInput.value);
            if (!isNaN(oxidizerDensity)) {
                oxidizerDensityInput.classList.add("input_field_disabled");
                oxidizerDensityButtonLocket = true;
                oxidizerDensityButton.innerHTML = "Unlock";
                console.log("Oxidizer density: " + oxidizerDensity);
                socket.emit("flowrate_density_change", {name: "FLO_N2O", density: oxidizerDensity});
            } else {
                alert("Please input number!");
            }
        }
    });
}

socket.on('info', function (data) {
    console.log(data)
})

socket.on('connect', function() {
    console.log("Connected");
});

socket.on('model_update', function (data){
    console.log(data);
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            DATA[key].value = data[key].value;
        }
    }
    DATA.FLO_IPA.density = data.FLO_IPA.density;
    DATA.FLO_N2O.density = data.FLO_N2O.density;
    syncVisuals();
});