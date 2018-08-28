var socket = io();

// Valve States
var OPEN = "OPEN";
var CLOSED = "CLOSED";

var DATA = {
    SENSORS: {
        SV_FLUSH: {svg_name: "SV_FLUSH", value: CLOSED, dom_element: null},
        SV_N2O: {svg_name: "SV_N2O", value: CLOSED, dom_element: null},
        SV_N2O_FILL: {svg_name: "SV_N2O_FILL", value: CLOSED, dom_element: null},
        SV_IPA: {svg_name: "SV_IPA", value: CLOSED, dom_element: null},

        PT_N2: {svg_name: "PT_N2", value: 0, dom_element: null, lastUpdated: 0},
        PT_IPA: {svg_name: "PT_IPA", value: 0, dom_element: null, lastUpdated: 0},
        PT_N2O: {svg_name: "PT_N2O", value: 0, dom_element: null, lastUpdated: 0},

        PT_FUEL: {svg_name: "PT_FUEL", value: 0, dom_element: null, lastUpdated: 0},
        PT_OX: {svg_name: "PT_OX", value: 0, dom_element: null, lastUpdated: 0},
        PT_CHAM: {svg_name: "PT_CHAM", value: 0, dom_element: null, lastUpdated: 0},

        TC_IPA: {svg_name: "TC_IPA", value: 0, dom_element: null, lastUpdated: 0},
        TC_N2O: {svg_name: "TC_N2O", value: 0, dom_element: null, lastUpdated: 0},

        TC_1: {svg_name: "TC_1", value: 0, dom_element: null, lastUpdated: 0},
        TC_2: {svg_name: "TC_2", value: 0, dom_element: null, lastUpdated: 0},
        TC_3: {svg_name: "TC_3", value: 0, dom_element: null, lastUpdated: 0},
        TC_4: {svg_name: "TC_4", value: 0, dom_element: null, lastUpdated: 0},
        TC_5: {svg_name: "TC_5", value: 0, dom_element: null, lastUpdated: 0},
        TC_6: {svg_name: "TC_6", value: 0, dom_element: null, lastUpdated: 0},

        FLO_IPA: {svg_name: "FLO_IPA", value: 0, dom_element_l: null, dom_element_m: null, dom_element_gradient: null, dom_element_percentage: null, dom_element_time: null, density: 0, accumulated: 18, lastUpdated: 0},
        FLO_N2O: {svg_name: "FLO_N2O", value: 0, dom_element_l: null,  dom_element_m: null, dom_element_gradient: null, dom_element_percentage: null, dom_element_time: null, density: 0, accumulated: 32, lastUpdated: 0},

        LOAD: {html_name: "load_cell_text", value: 0, dom_element: null, lastUpdated: 0},

        ACT_IPA: {svg_name: "ACT_IPA", value: 0, dom_element: null},
        ACT_N2O: {svg_name: "ACT_N2O", value: 0, dom_element: null}
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

    DATA.SENSORS.SV_FLUSH.dom_element = svgDoc.getElementById(DATA.SENSORS.SV_FLUSH.svg_name);
    DATA.SENSORS.SV_N2O.dom_element = svgDoc.getElementById(DATA.SENSORS.SV_N2O.svg_name);
    DATA.SENSORS.SV_N2O_FILL.dom_element = svgDoc.getElementById(DATA.SENSORS.SV_N2O_FILL.svg_name);
    DATA.SENSORS.SV_IPA.dom_element = svgDoc.getElementById(DATA.SENSORS.SV_IPA.svg_name);

    // Add listeners
    addValveButtonListener(svgDoc, DATA.SENSORS.SV_FLUSH);
    addValveButtonListener(svgDoc, DATA.SENSORS.SV_N2O);
    addValveButtonListener(svgDoc, DATA.SENSORS.SV_N2O_FILL);
    addValveButtonListener(svgDoc, DATA.SENSORS.SV_IPA);

    // Initialize DOM elements
    DATA.SENSORS.PT_N2.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_N2.svg_name);
    DATA.SENSORS.PT_IPA.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_IPA.svg_name);
    DATA.SENSORS.PT_N2O.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_N2O.svg_name);
    DATA.SENSORS.PT_FUEL.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_FUEL.svg_name);
    DATA.SENSORS.PT_OX.dom_element = svgDoc.getElementById(DATA.SENSORS.PT_OX.svg_name);
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
    updateValveVisual(DATA.SENSORS.SV_FLUSH);
    updateValveVisual(DATA.SENSORS.SV_N2O);
    updateValveVisual(DATA.SENSORS.SV_N2O_FILL);
    updateValveVisual(DATA.SENSORS.SV_IPA);

    updatePressureSensor(DATA.SENSORS.PT_IPA, 1);
    updatePressureSensor(DATA.SENSORS.PT_N2O, 1);
    updatePressureSensor(DATA.SENSORS.PT_N2, 0);
    updatePressureSensor(DATA.SENSORS.PT_FUEL, 1);
    updatePressureSensor(DATA.SENSORS.PT_OX, 1);
    updatePressureSensor(DATA.SENSORS.PT_CHAM, 1);

    updateTemperatureSensor(DATA.SENSORS.TC_IPA, 0);
    updateTemperatureSensor(DATA.SENSORS.TC_N2O, 0);

    updateTemperatureSensor(DATA.SENSORS.TC_1, 0);
    updateTemperatureSensor(DATA.SENSORS.TC_2, 0);
    updateTemperatureSensor(DATA.SENSORS.TC_3, 0);
    updateTemperatureSensor(DATA.SENSORS.TC_4, 0);
    updateTemperatureSensor(DATA.SENSORS.TC_5, 0);
    updateTemperatureSensor(DATA.SENSORS.TC_6, 0);

    updateFlowSensor(DATA.SENSORS.FLO_IPA, 2);
    updateFlowSensor(DATA.SENSORS.FLO_N2O, 1);
    
    updateVolumeIndicators();

    updateLoadCell(DATA.SENSORS.LOAD, 1);

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

function updateLoadCell(loadSensor, decimals) {
    loadSensor.dom_element.innerHTML = loadSensor.value.toFixed(decimals);
}

function updatePressureSensor(pressureSensor, decimals) {
    pressureSensor.dom_element.innerHTML = pressureSensor.value.toFixed(decimals) + " bar";
}

function updateTemperatureSensor(temperatureSensor, decimals) {
    temperatureSensor.dom_element.innerHTML = temperatureSensor.value.toFixed(decimals) + " °C";
}

function updateFlowSensor(flowSensor, decimals) {
    flowSensor.dom_element_l.textContent = flowSensor.value.toFixed(decimals) + " L/s";
    flowSensor.dom_element_m.textContent = (flowSensor.value * (flowSensor.density/1000)).toFixed(decimals) + " kg/s";
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
            socket.emit("valve", {name: dataElement.svg_name, value: dataElement.value});
        } else if (dataElement.value == OPEN) {
            dataElement.value = CLOSED;
            socket.emit("valve", {name: dataElement.svg_name, value: dataElement.value});
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
        var fuelValue = getActuatorFieldValue(fuelField);
        if (fuelValue != null) {
            socket.emit("actuator_set", {type: "SINGLE", name: "ACT_IPA_VALUE", value: fuelValue});
            //actuatorPanelLock(true);
        }
    });

    oxidizerButton.addEventListener("click", function () {
        var oxidizerValue = getActuatorFieldValue(oxidizerField);
        if(oxidizerValue != null) {
            socket.emit("actuator_set", {type: "SINGLE", name: "ACT_N2O_VALUE", value: oxidizerValue});
            //actuatorPanelLock(true);
        }
    });

    bothButton.addEventListener("click", function () {
        var fuelValue = (getActuatorFieldValue(fuelField)) ? getActuatorFieldValue(fuelField) : DATA.SENSORS.ACT_IPA.value;
        var oxidizerValue = (getActuatorFieldValue(oxidizerField)) ? getActuatorFieldValue(oxidizerField) : DATA.SENSORS.ACT_N2O.value;

        /*socket.emit("actuator_set", {
            type: "BOTH",
            fuelValue :fuelValue,
            oxidizerValue: oxidizerValue
        });*/

        //actuatorPanelLock(true);
    });

    actuatorLockCheckbox.addEventListener("click", function () {
        actuatorPanelLock(actuatorLockCheckbox.checked);
    }); 

    //actuatorPanelLock(true);
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
            return null;
        }
    } else {
        field.value = "";
        return null;
    }
}

function addLoggingPanelListeners() {
    var startButton = document.getElementById("log_button_start");
    var stopButton = document.getElementById("log_button_stop");

    setButton(startButton, true);
    setButton(stopButton, false);

    startButton.addEventListener("click", function() {
        socket.emit("log_cmd", "START");
    });

    stopButton.addEventListener("click", function() {
        socket.emit("log_cmd", "STOP");
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

    if (DATA.IS_LOGGING) {
        setButton(startButton, false);
        setButton(stopButton, true);
    } else {
        setButton(startButton, true);
        setButton(stopButton, false);
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

function updateLastUpdatedTime() {
    var labelElement = document.getElementsByClassName("last_updated_time_panel")[0];
    var panelString = "";

    var pressureTime = (Date.now() - DATA.SENSORS.PT_N2.lastUpdated)/1000.0;
    var temperatureTime = (Date.now() - DATA.SENSORS.TC_IPA.lastUpdated)/1000.0;
    var flowTime = (Date.now() - DATA.SENSORS.FLO_IPA.lastUpdated)/1000.0;
    var loadTime = (Date.now() - DATA.SENSORS.LOAD.lastUpdated)/1000.0;

    var limitTime = 4;

    if (pressureTime < limitTime) {
        panelString += "<p class=\"updates_alive\">Pressure: " + pressureTime.toFixed(1) + " seconds ago. </p>";
    } else {
        panelString += "<p class=\"updates_dead\">Pressure is not receiving updates.</p>";
    }

    if (temperatureTime < limitTime) {
        panelString += "<p class=\"updates_alive\">Temperature: " + temperatureTime.toFixed(1) + " seconds ago.</p>";
    } else {
        panelString += "<p class=\"updates_dead\">Temperature is not receiving updates.</p>";
    }

    if (flowTime < limitTime) {
        panelString += "<p class=\"updates_alive\">Flow: " + flowTime.toFixed(1) + " seconds ago.</p>";
    } else {
        panelString += "<p class=\"updates_dead\">Flow is not receiving updates.</p>";
    }

    if (loadTime < limitTime) {
        panelString += "<p class=\"updates_alive\">Load: " + loadTime.toFixed(1) + " seconds ago.</p>";
    } else {
        panelString += "<p class=\"updates_dead\">Load is not receiving updates.</p>";
    }
    

    labelElement.innerHTML = panelString;
}

socket.on('info', function (data) {
    console.log(data)
})

socket.on('connect', function() {
    console.log("Connected");
});

socket.on('model_update', function (model){
    console.log(model);
    DATA = mergeModels(DATA, model);

    syncVisuals();
});

function mergeModels(localModel, serverModel) {

    for (var sensorName in serverModel.SENSORS) {
        if (serverModel.SENSORS.hasOwnProperty(sensorName)) {

            for (var propertyName in serverModel.SENSORS[sensorName]) {
                if(serverModel.SENSORS[sensorName].hasOwnProperty(propertyName)) {
                    localModel.SENSORS[sensorName][propertyName] = serverModel.SENSORS[sensorName][propertyName];
                }
            }
        }
    }

    localModel.IS_LOGGING = serverModel.IS_LOGGING;

    return localModel;
}

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
    //console.log(DATA.SENSORS.FLO_IPA.value);
    DATA.SENSORS.FLO_IPA.dom_element_gradient.children[1].setAttribute("offset", 1-fuelFraction);
    DATA.SENSORS.FLO_IPA.dom_element_gradient.children[2].setAttribute("offset", 1-fuelFraction);
    DATA.SENSORS.FLO_IPA.dom_element_percentage.textContent = (fuelFraction * 100).toFixed(1) + "%";
    DATA.SENSORS.FLO_IPA.dom_element_time.textContent = fuelTimeLeft.toFixed(1) + "s"

    var oxidizerFraction = (DATA.SENSORS.FLO_N2O.initial - DATA.SENSORS.FLO_N2O.accumulated) / DATA.SENSORS.FLO_N2O.initial;
    var oxidizerTimeLeft = (DATA.SENSORS.FLO_N2O.initial - DATA.SENSORS.FLO_N2O.accumulated) / DATA.SENSORS.FLO_N2O.value;
    //console.log(oxidizerFraction);
    DATA.SENSORS.FLO_N2O.dom_element_gradient.children[1].setAttribute("offset", 1-oxidizerFraction);
    DATA.SENSORS.FLO_N2O.dom_element_gradient.children[2].setAttribute("offset", 1-oxidizerFraction);
    DATA.SENSORS.FLO_N2O.dom_element_percentage.textContent = (oxidizerFraction * 100).toFixed(1) + "%";
    DATA.SENSORS.FLO_N2O.dom_element_time.textContent = oxidizerTimeLeft.toFixed(1) + "s"

} 
console.log(DATA);
setInterval(updateLastUpdatedTime, 1000);
