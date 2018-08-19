var socket = io();

// Valve States
var OPEN = "OPEN";
var CLOSED = "CLOSED";

var DATA = {
    SENSORS: {
        V4: {svg_name: "V4", value: CLOSED, type: "VALVE", dom_element: null},
        V5: {svg_name: "V5", value: CLOSED, type: "VALVE", dom_element: null},
        V12: {svg_name: "V12", value: CLOSED, type: "VALVE", dom_element: null},
        V17: {svg_name: "V17", value: CLOSED, type: "VALVE", dom_element: null},

        PT_N2: {svg_name: "PT_N2", value: 0, type: "PRESSURE_SENSOR", dom_element: null},
        PT_IPA: {svg_name: "PT_IPA", value: 0, type: "PRESSURE_SENSOR", dom_element: null},
        PT_N2O: {svg_name: "PT_N2O", value: 0, type: "PRESSURE_SENSOR", dom_element: null},

        PT_INJ_IPA: {svg_name: "PT_INJ_IPA", value: 0, type: "PRESSURE_SENSOR", dom_element: null},
        PT_INJ_N2O: {svg_name: "PT_INJ_N2O", value: 0, type: "PRESSURE_SENSOR", dom_element: null},
        PT_CHAM: {svg_name: "PT_CHAM", value: 0, type: "PRESSURE_SENSOR", dom_element: null},

        TC_IPA: {svg_name: "TC_IPA", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
        TC_N2O: {svg_name: "TC_N2O", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},

        TC_1: {svg_name: "TC_1", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
        TC_2: {svg_name: "TC_2", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
        TC_3: {svg_name: "TC_3", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
        TC_4: {svg_name: "TC_4", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
        TC_5: {svg_name: "TC_5", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},
        TC_6: {svg_name: "TC_6", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null},

        FLO_IPA: {svg_name: "FLO_IPA", value: 0, type: "FLOW_SENSOR", dom_element_l: null, dom_element_m: null, dom_element_gradient: null, dom_element_percentage: null, dom_element_time: null, density: 0, accumulated: 18},
        FLO_N2O: {svg_name: "FLO_N2O", value: 0, type: "FLOW_SENSOR", dom_element_l: null,  dom_element_m: null, dom_element_gradient: null, dom_element_percentage: null, dom_element_time: null, density: 0, accumulated: 32},

        LOAD: {html_name: "load_cell_text", value: 0, type: "LOAD_CELL", dom_element: null},

        ACT_IPA: {svg_name: "ACT_IPA", value: 0, type: "ACTUATOR", dom_element: null},
        ACT_N2O: {svg_name: "ACT_N2O", value: 0, type: "ACTUATOR", dom_element: null}
    },
    IS_LOGGING: false
}

// Flowrate panel 
var fuelDensityButtonLocked = false;
var oxidizerDensityButtonLocked = false;

// INIT (wait on SVG)
window.onload = function () {
    initializeSVGElements();
    addFlowratePanelListeners();
    addLoggingPanelListeners();
    addInitialVolumesListener();
    addActuatorPanelListeners();
    socket.emit("refresh_model", {});
};


function initializeSVGElements() {
    var svgHTML = document.getElementById("DataSVG");
    var svgDoc = svgHTML.contentDocument;

    DATA.SENSORS.V4.dom_element = svgDoc.getElementById(DATA.SENSORS.V4.svg_name);
    DATA.SENSORS.V5.dom_element = svgDoc.getElementById(DATA.SENSORS.V5.svg_name);
    DATA.SENSORS.V12.dom_element = svgDoc.getElementById(DATA.SENSORS.V12.svg_name);
    DATA.SENSORS.V17.dom_element = svgDoc.getElementById(DATA.SENSORS.V17.svg_name);

    // Add listeners
    addValveButtonListener(svgDoc, DATA.SENSORS.V4);
    addValveButtonListener(svgDoc, DATA.SENSORS.V5);
    addValveButtonListener(svgDoc, DATA.SENSORS.V12);
    addValveButtonListener(svgDoc, DATA.SENSORS.V17);

    DATA.SENSORS.PT_N2.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_N2.svg_name);
    DATA.SENSORS.PT_IPA.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_IPA.svg_name);
    DATA.SENSORS.PT_N2O.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_N2O.svg_name);
    DATA.SENSORS.PT_INJ_IPA.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_INJ_IPA.svg_name);
    DATA.SENSORS.PT_INJ_N2O.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_INJ_N2O.svg_name);
    DATA.SENSORS.PT_CHAM.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_CHAM.svg_name);

    DATA.SENSORS.TC_IPA.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_IPA.svg_name);
    DATA.SENSORS.TC_N2O.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_N2O.svg_name);

    DATA.SENSORS.TC_1.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_1.svg_name);
    DATA.SENSORS.TC_2.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_2.svg_name);
    DATA.SENSORS.TC_3.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_3.svg_name);
    DATA.SENSORS.TC_4.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_4.svg_name);
    DATA.SENSORS.TC_5.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_5.svg_name);
    DATA.SENSORS.TC_6.dom_element = svgDoc.getElementById(DATA.SENSORS.TC_6.svg_name);

    DATA.SENSORS.FLO_IPA.dom_element_l = svgDoc.getElementById(DATA.SENSORS.FLO_IPA.svg_name + "_L");
    DATA.SENSORS.FLO_IPA.dom_element_m = svgDoc.getElementById(DATA.SENSORS.FLO_IPA.svg_name + "_M");
    DATA.SENSORS.FLO_IPA.dom_element_gradient = svgDoc.getElementById("gradient_blue");
    DATA.SENSORS.FLO_IPA.dom_element_percentage = svgDoc.getElementById("fuel_percentage");
    DATA.SENSORS.FLO_IPA.dom_element_time = svgDoc.getElementById("fuel_time");

    DATA.SENSORS.FLO_N2O.dom_element_l = svgDoc.getElementById(DATA.SENSORS.FLO_N2O.svg_name + "_L");
    DATA.SENSORS.FLO_N2O.dom_element_m = svgDoc.getElementById(DATA.SENSORS.FLO_N2O.svg_name + "_M");
    DATA.SENSORS.FLO_N2O.dom_element_gradient = svgDoc.getElementById("gradient_red");
    DATA.SENSORS.FLO_N2O.dom_element_percentage = svgDoc.getElementById("oxid_percentage");
    DATA.SENSORS.FLO_N2O.dom_element_time = svgDoc.getElementById("oxid_time");

    DATA.SENSORS.LOAD.dom_element = document.getElementById(DATA.SENSORS.LOAD.html_name);

    DATA.SENSORS.ACT_IPA.dom_element = svgDoc.getElementById(DATA.SENSORS.ACT_IPA.svg_name);
    DATA.SENSORS.ACT_N2O.dom_element = svgDoc.getElementById(DATA.SENSORS.ACT_N2O.svg_name);

}

function syncVisuals() {
    updateValveVisual(DATA.SENSORS.V4);
    updateValveVisual(DATA.SENSORS.V5);
    updateValveVisual(DATA.SENSORS.V12);
    updateValveVisual(DATA.SENSORS.V17);

    updatePressureSensor(DATA.SENSORS.PT_IPA);
    updatePressureSensor(DATA.SENSORS.PT_N2O);
    updatePressureSensor(DATA.SENSORS.PT_N2);
    updatePressureSensor(DATA.SENSORS.PT_INJ_IPA);
    updatePressureSensor(DATA.SENSORS.PT_INJ_N2O);
    updatePressureSensor(DATA.SENSORS.PT_CHAM);

    updateTemperatureSensor(DATA.SENSORS.TC_IPA);
    updateTemperatureSensor(DATA.SENSORS.TC_N2O);

    updateTemperatureSensor(DATA.SENSORS.TC_1);
    updateTemperatureSensor(DATA.SENSORS.TC_2);
    updateTemperatureSensor(DATA.SENSORS.TC_3);
    updateTemperatureSensor(DATA.SENSORS.TC_4);
    updateTemperatureSensor(DATA.SENSORS.TC_5);
    updateTemperatureSensor(DATA.SENSORS.TC_6);

    updateFlowSensor(DATA.SENSORS.FLO_IPA);
    updateFlowSensor(DATA.SENSORS.FLO_N2O);
    
    updateVolumeIndicators();

    updateLoadCell(DATA.SENSORS.LOAD);

    updateActuator(DATA.SENSORS.ACT_IPA);
    updateActuator(DATA.SENSORS.ACT_N2O);

    updateFlowratePanel();
    updateLogButtons();
    updateInitialFuelVolume();

    
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
    flowSensor.dom_element_l.textContent = flowSensor.value + " L/s";
    flowSensor.dom_element_m.textContent = (flowSensor.value * flowSensor.density).toFixed(2) + " kg/s";
}

function updateActuator(actuator) {
    actuator.dom_element.textContent = actuator.value + "%";
}

function updateFlowratePanel() {
    var fuelDensityInput = document.getElementById("flowrate_fuel_density_input");
    if (fuelDensityButtonLocked) {
        fuelDensityInput.value = DATA.SENSORS.FLO_IPA.density;
    }
    var oxidizerDensityInput = document.getElementById("flowrate_oxidizer_density_input");
    if (oxidizerDensityButtonLocked) {
        oxidizerDensityInput.value = DATA.SENSORS.FLO_N2O.density;
    }
    
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
            socket.emit("VALVE", {valve_name: dataElement.svg_name, value: dataElement.value});
        } else if (dataElement.value == OPEN) {
            dataElement.value = CLOSED;
            socket.emit("VALVE", {valve_name: dataElement.svg_name, value: dataElement.value});
        }
        updateValveVisual(dataElement);


    });
}

function addFlowratePanelListeners() {
    var fuelDensityInput = document.getElementById("flowrate_fuel_density_input");
    var fuelDensityButton = document.getElementById("flowrate_fuel_density_update");
    var oxidizerDensityButton = document.getElementById("flowrate_oxidizer_density_update");
    var oxidizerDensityInput = document.getElementById("flowrate_oxidizer_density_input");

    // Initial disabled input
    lockFuelDensity(true);
    lockOxidizerDensity(true);
    
    // Add click listeners
    fuelDensityButton.addEventListener("click", function() {
        if (fuelDensityButtonLocked) {
            lockFuelDensity(false);
        } else {
            var fuelDensity = parseFloat(fuelDensityInput.value);

            if (!isNaN(fuelDensity)) {
                lockFuelDensity(true);
                console.log("Fuel density: " + fuelDensity);
                socket.emit("flowrate_density_change", {name: "FLO_IPA", density: fuelDensity});
            } else {
                alert("Please input number!");
            }
            
        } 
    });

    oxidizerDensityButton.addEventListener("click", function() {
        if (oxidizerDensityButtonLocked) {
            lockOxidizerDensity(false);
        } else {
            var oxidizerDensity = parseFloat(oxidizerDensityInput.value);
            
            if (!isNaN(oxidizerDensity)) {
                lockOxidizerDensity(true);
                console.log("Oxidizer density: " + oxidizerDensity);
                socket.emit("flowrate_density_change", {name: "FLO_N2O", density: oxidizerDensity});
            } else {
                alert("Please input number!");
            }
        }
    });
}

function addActuatorPanelListeners() {
    var fuelButton = document.getElementById("actuator_fuel_set_button");
    var oxidizerButton = document.getElementById("actuator_oxidizer_set_button");
    var bothButton = document.getElementById("actuator_both_set_button");
    var fuelField = document.getElementById("actuator_fuel_input");
    var oxidizerField = document.getElementById("actuator_oxidizer_input");
    var actuatorLockCheckbox = document.getElementById("actuator_lock_checkbox");
    
    fuelButton.addEventListener("click", function () {
        var fuelValue = (getActuatorFieldValue(fuelField)) ? getActuatorFieldValue(fuelField) : DATA.SENSORS.ACT_IPA.value;
        socket.emit("actuator_set", [{name: DATA.SENSORS.ACT_IPA.svg_name, value: fuelValue}]);
        actuatorPanelLock(true);
    });

    oxidizerButton.addEventListener("click", function () {
        var oxidizerValue = (getActuatorFieldValue(oxidizerField)) ? getActuatorFieldValue(oxidizerField) : DATA.SENSORS.ACT_N2O.value;
        socket.emit("actuator_set", [{name: DATA.SENSORS.ACT_N2O.svg_name, value: oxidizerValue}]);
        actuatorPanelLock(true);
    });

    bothButton.addEventListener("click", function () {
        var fuelValue = (getActuatorFieldValue(fuelField)) ? getActuatorFieldValue(fuelField) : DATA.SENSORS.ACT_IPA.value;
        var oxidizerValue = (getActuatorFieldValue(oxidizerField)) ? getActuatorFieldValue(oxidizerField) : DATA.SENSORS.ACT_N2O.value;

        socket.emit("actuator_set", [
            {name: DATA.SENSORS.ACT_IPA.svg_name, value: fuelValue}, 
            {name: DATA.SENSORS.ACT_N2O.svg_name, value: oxidizerValue}
        ]);
        actuatorPanelLock(true);
    });

    actuatorLockCheckbox.addEventListener("click", function () {
        actuatorPanelLock(actuatorLockCheckbox.checked);
    }); 

    actuatorPanelLock(true);
}

function actuatorPanelLock(lock) {
    var actuatorPanel = document.getElementById("actuator_control_panel");
    var actuatorLockCheckbox = document.getElementById("actuator_lock_checkbox");

    if (lock) {
        actuatorPanel.classList.add("panel_disabled");
    } else {
        actuatorPanel.classList.remove("panel_disabled");
    }

    actuatorLockCheckbox.checked = lock;
}

function getActuatorFieldValue(field) {
    var value = parseFloat(field.value);
    if (!isNaN(value)) {
        if (value >= 0 && value <= 100) {
            return value;
        } else {
            field.value = "";
            return false;
        }
    } else {
        field.value = "";
        return false;
    }
}

function addLoggingPanelListeners() {
    var startButton = document.getElementById("log_button_start");
    var stopButton = document.getElementById("log_button_stop");
    var resetButton = document.getElementById("log_button_reset");
    var saveButton = document.getElementById("log_button_save");

    setButton(startButton, true);
    setButton(stopButton, false);
    setButton(resetButton, true);
    setButton(saveButton, true);

    startButton.addEventListener("click", function() {
        socket.emit("log_cmd", "START");
    });

    stopButton.addEventListener("click", function() {
        socket.emit("log_cmd", "STOP");
    });

    resetButton.addEventListener("click", function() {
        socket.emit("log_cmd", "RESET");
    });

    saveButton.addEventListener("click", function() {
        socket.emit("log_cmd", "SAVE");
    });
}

function addInitialVolumesListener() {
    var setInitialFuelButton = document.getElementById("initial_fuel_set_button");
    var initialFuelField = document.getElementById("initial_fuel_input");
    var setInitialOxidizerButton = document.getElementById("initial_oxidizer_set_button");
    var initialOxidizerField = document.getElementById("initial_oxidizer_input");
    var initialVolumeLockCheckbox = document.getElementById("initial_volume_lock_checkbox");

    setInitialFuelButton.addEventListener("click", function() {
        var fuelValue = getInitialVolumeFieldValue(initialFuelField);
        if (fuelValue) {
            socket.emit("initial_volume", {name: "INITIAL_FUEL", value: fuelValue});
            initialVolumePanelLock(true);
        } else {
            console.log("Initial fuel input has non-number characters: " + fuelValue);
        }
    });

    setInitialOxidizerButton.addEventListener("click", function() {
        var oxidizerValue = getInitialVolumeFieldValue(initialOxidizerField);
        if (oxidizerValue) {
            socket.emit("initial_volume", {name: "INITIAL_OXIDIZER", value: oxidizerValue});
            initialVolumePanelLock(true);
        } else {
            console.log("Initial fuel input has non-number characters: " + oxidizerValue);
        }
    });

    initialVolumeLockCheckbox.addEventListener("click", function () {
        initialVolumePanelLock(initialVolumeLockCheckbox.checked);
    }); 

    initialVolumePanelLock(true);
}

function initialVolumePanelLock(lock) {
    var initialVolumePanel = document.getElementById("initial_volume_panel");
    var initialVolumeLockCheckbox = document.getElementById("initial_volume_lock_checkbox");

    if (lock) {
        initialVolumePanel.classList.add("panel_disabled");
    } else {
        initialVolumePanel.classList.remove("panel_disabled");
    }

    initialVolumeLockCheckbox.checked = lock;
}

function getInitialVolumeFieldValue(field) {
    var value = parseFloat(field.value);
    if (!isNaN(value)) {
        if (value >= 0) {
            return value;
        } else {
            field.value = "";
            return false;
        }
    } else {
        field.value = "";
        return false;
    }
}

function updateLogButtons() {
    var startButton = document.getElementById("log_button_start");
    var stopButton = document.getElementById("log_button_stop");
    var resetButton = document.getElementById("log_button_reset");
    var saveButton = document.getElementById("log_button_save");

    if (DATA.IS_LOGGING) {
        setButton(startButton, false);
        setButton(stopButton, true);
        setButton(resetButton, true);
        setButton(saveButton, true);
    } else {
        setButton(startButton, true);
        setButton(stopButton, false);
        setButton(resetButton, true);
        setButton(saveButton, true);
    }
}

function setButton(button, enable) {
    if (enable) {
        button.classList.remove("panel_button_disabled");
    } else {
        button.classList.add("panel_button_disabled");
    }
}

function updateInitialFuelVolume() {
    var header = document.getElementById("initial_fuel_label");
    var oxHeader = document.getElementById("initial_oxidizer_label");
    header.innerHTML = "Fuel: " + DATA.SENSORS.FLO_IPA.initial + " L";
    oxHeader.innerHTML = "Oxidizer: " + DATA.SENSORS.FLO_N2O.initial + " L";
}

socket.on('info', function (data) {
    console.log(data)
})

socket.on('connect', function() {
    console.log("Connected");
});

socket.on('model_update', function (data){
    console.log(data);
    for (var key in data.SENSORS) {
        if (data.SENSORS.hasOwnProperty(key)) {
            DATA.SENSORS[key].value = data.SENSORS[key].value;
            DATA.SENSORS[key].accumulated = data.SENSORS[key].accumulated;
        }
    }
    DATA.SENSORS.FLO_IPA.density = data.SENSORS.FLO_IPA.density;
    DATA.SENSORS.FLO_N2O.density = data.SENSORS.FLO_N2O.density;
    DATA.IS_LOGGING = data.IS_LOGGING;
    DATA.SENSORS.FLO_IPA.initial = data.SENSORS.FLO_IPA.initial;
    DATA.SENSORS.FLO_N2O.initial = data.SENSORS.FLO_N2O.initial;
    syncVisuals();
    console.log(DATA);
});

function lockFuelDensity(enabled) {
    var fuelDensityInput = document.getElementById("flowrate_fuel_density_input");
    var fuelDensityButton = document.getElementById("flowrate_fuel_density_update");
    if (enabled) {
        fuelDensityInput.classList.add("panel_input_disabled");
        fuelDensityButtonLocked = true;
        fuelDensityButton.innerHTML = "Unlock";
    } else {
        fuelDensityInput.classList.remove("panel_input_disabled");
        fuelDensityButtonLocked = false;
        fuelDensityButton.innerHTML = "Lock";
    }
}

function lockOxidizerDensity(enabled) {
    var oxidizerDensityInput = document.getElementById("flowrate_oxidizer_density_input");
    var oxidizerDensityButton = document.getElementById("flowrate_oxidizer_density_update");

    if (enabled) {
        oxidizerDensityInput.classList.add("panel_input_disabled");
        oxidizerDensityButtonLocked = true;
        oxidizerDensityButton.innerHTML = "Unlock";
    } else {
        oxidizerDensityInput.classList.remove("panel_input_disabled");
        oxidizerDensityButtonLocked = false;
        oxidizerDensityButton.innerHTML = "Lock";
    }
}

function updateVolumeIndicators() {

    var fuelFraction = (DATA.SENSORS.FLO_IPA.initial - DATA.SENSORS.FLO_IPA.accumulated) / DATA.SENSORS.FLO_IPA.initial;
    var fuelTimeLeft = (DATA.SENSORS.FLO_IPA.initial - DATA.SENSORS.FLO_IPA.accumulated) / DATA.SENSORS.FLO_IPA.value;
    console.log(DATA.SENSORS.FLO_IPA.value);
    DATA.SENSORS.FLO_IPA.dom_element_gradient.children[1].setAttribute("offset", 1-fuelFraction);
    DATA.SENSORS.FLO_IPA.dom_element_gradient.children[2].setAttribute("offset", 1-fuelFraction);
    DATA.SENSORS.FLO_IPA.dom_element_percentage.textContent = (fuelFraction * 100).toFixed(1) + "%";
    DATA.SENSORS.FLO_IPA.dom_element_time.textContent = fuelTimeLeft + "s"

    var oxidizerFraction = (DATA.SENSORS.FLO_N2O.initial - DATA.SENSORS.FLO_N2O.accumulated) / DATA.SENSORS.FLO_N2O.initial;
    var oxidizerTimeLeft = (DATA.SENSORS.FLO_N2O.initial - DATA.SENSORS.FLO_N2O.accumulated) / DATA.SENSORS.FLO_N2O.value;
    console.log(oxidizerFraction);
    DATA.SENSORS.FLO_N2O.dom_element_gradient.children[1].setAttribute("offset", 1-oxidizerFraction);
    DATA.SENSORS.FLO_N2O.dom_element_gradient.children[2].setAttribute("offset", 1-oxidizerFraction);
    DATA.SENSORS.FLO_N2O.dom_element_percentage.textContent = (oxidizerFraction * 100).toFixed(1) + "%";
    DATA.SENSORS.FLO_N2O.dom_element_time.textContent = oxidizerTimeLeft + "s"

} 