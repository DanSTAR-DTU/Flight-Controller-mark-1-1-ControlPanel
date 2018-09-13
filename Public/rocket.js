var socket = io();

// Valve States
var OPEN = "OPEN";
var CLOSED = "CLOSED";
var isBurnActive = false;
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
    STATES: {
        NEUTRAL: {id: 1, activeClassName: "state_button_active", domID: "state_bt_neutral", domElement: null},
        OX_LOADING: {id: 2, activeClassName: "state_button_active", domID: "state_bt_ox_loading", domElement: null},
        PRESSURIZED_STANDBY: {id: 3, activeClassName: "state_button_active", domID: "state_bt_pressurized_standby", domElement: null},
        PRE_CHILL_N2O_LINE: {id: 4, activeClassName: "state_button_active", domID: "state_bt_pre_chill_n2o_line", domElement: null},
        IGNITION: {id: 5, activeClassName: "state_button_active", domID: "state_bt_ignition", domElement: null},
        BURN: {id: 6, activeClassName: "state_button_active", domID: "state_bt_burn", domElement: null},
        SHUTDOWN: {id: 7, activeClassName: "state_button_active", domID: "state_bt_shutdown", domElement: null},
        EMERGENCY: {id: 8, activeClassName: "state_button_active", domID: "state_bt_emergency", domElement: null}
    },
    ACTIVE_STATE_ID: 1,
    IS_LOGGING: false,
    TODAY_PRESSURE_BAR: 0
}

var lockableFields = {
    fuel_density: {
        locked: false,
        field_id: "flowrate_fuel_density_input",
        button_id: "flowrate_fuel_density_update" 
    },
    oxidizer_density: {
        locked: false,
        field_id: "flowrate_oxidizer_density_input",
        button_id: "flowrate_oxidizer_density_update" 
    },
    today_pressure: {
        locked: false,
        field_id: "daily_pressure_field",
        button_id: "daily_pressure_set" 
    }
}

massFlowRatioSVGDomElement = null;

// INIT (wait on SVG)
window.onload = function () {
    // Animate in
    document.body.classList.remove("notloaded");

    // Initialization
    initializeSVGElements();
    addFlowratePanelListeners();
    addLoggingPanelListeners();
    addInitialVolumesListener();
    addActuatorPanelListeners();
    addTodayPressureListener();
    addStateButtonsListener();
    addLoadResetButtonListener();
    addAccumulatedFlowResetButtonListener();
    addLockOverlayListener();
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

    massFlowRatioSVGDomElement = svgDoc.getElementById("MASS_FLOW_RATIO");
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

    updateMassFlowRatio(DATA.SENSORS.FLO_IPA, DATA.SENSORS.FLO_N2O);

    updateFlowratePanel();
    updateLogButtons();
    updateInitialFuelVolume();
    updateTodayPressure();
    updateStateButtonVisuals();
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
    pressureSensor.dom_element.innerHTML = pressureSensor.value.toFixed(decimals) + " bara";
}

function updateTemperatureSensor(temperatureSensor, decimals) {
    temperatureSensor.dom_element.innerHTML = temperatureSensor.value.toFixed(decimals) + " °C";
}

function updateFlowSensor(flowSensor, decimals) {
    flowSensor.dom_element_l.textContent = flowSensor.value.toFixed(decimals) + " L/s";
    flowSensor.dom_element_m.textContent = (flowSensor.value * (flowSensor.density/1000)).toFixed(decimals) + " kg/s";
}

function updateActuator(actuator) {
    actuator.dom_element.textContent = Math.ceil(actuator.value) + "%";
}

function updateFlowratePanel() {
    
    if (lockableFields.fuel_density.locked) {
        var fuelDensityInput = document.getElementById(lockableFields.fuel_density.field_id);
        fuelDensityInput.value = DATA.SENSORS.FLO_IPA.density;
    }
    
    if (lockableFields.oxidizer_density.locked) {
        var oxidizerDensityInput = document.getElementById(lockableFields.oxidizer_density.field_id);
        oxidizerDensityInput.value = DATA.SENSORS.FLO_N2O.density;
    }
}

function updateMassFlowRatio(FLO_IPA, FLO_N2O) {
    var ratio = (FLO_N2O.value * (FLO_N2O.density / 1000.0)) / (FLO_IPA.value * (FLO_IPA.density / 1000.0))
    if (!isNaN(ratio)) {
        massFlowRatioSVGDomElement.children[0].innerHTML = ratio.toFixed(2);
    } else {
        massFlowRatioSVGDomElement.children[0].innerHTML = "0.0";
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
            socket.emit("valve", {name: dataElement.svg_name, value: OPEN});
        } else if (dataElement.value == OPEN) {
            socket.emit("valve", {name: dataElement.svg_name, value: CLOSED});
        }

    });
}

function addFlowratePanelListeners() {
    var fuelDensityInput = document.getElementById(lockableFields.fuel_density.field_id);
    var fuelDensityButton = document.getElementById(lockableFields.fuel_density.button_id);

    var oxidizerDensityInput = document.getElementById(lockableFields.oxidizer_density.field_id);
    var oxidizerDensityButton = document.getElementById(lockableFields.oxidizer_density.button_id);

    // Initial disabled input
    lockField(true, "fuel_density");
    lockField(true, "oxidizer_density");
    
    // Add click listeners
    fuelDensityButton.addEventListener("click", function() {
        if (lockableFields.fuel_density.locked) {
            lockField(false, "fuel_density");
        } else {
            var fuelDensity = getFieldValue(fuelDensityInput, 0, Infinity);

            if (fuelDensity) {
                lockField(true, "fuel_density");
                console.log("Fuel density: " + fuelDensity);
                socket.emit("flowrate_density_change", {name: "FLO_IPA", density: fuelDensity});
            } else {
                alert("Please input number!");
            }
            
        } 
    });

    oxidizerDensityButton.addEventListener("click", function() {
        if (lockableFields.oxidizer_density.locked) {
            lockField(false, "oxidizer_density");
        } else {
            var oxidizerDensity = getFieldValue(oxidizerDensityInput, 0, Infinity);
            
            if (oxidizerDensity) {
                lockField(true, "oxidizer_density");
                console.log("Oxidizer density: " + oxidizerDensity);
                socket.emit("flowrate_density_change", {name: "FLO_N2O", density: oxidizerDensity});
            } else {
                alert("Please input number!");
            }
        }
    });
}

function addActuatorPanelListeners() {

    actuatorPanelLock(true);

    var fuelAdd1 = document.getElementById("actuator_button_fuel_add_1");
    var fuelAdd10 = document.getElementById("actuator_button_fuel_add_10");
    var fuelSub1 = document.getElementById("actuator_button_fuel_sub_1");
    var fuelSub10 = document.getElementById("actuator_button_fuel_sub_10");

    var fuelField = document.getElementById("actuator_fuel_field");
    var fuelSet = document.getElementById("actuator_button_fuel_set");
    var fuelSet0 = document.getElementById("actuator_button_fuel_set_0");
    var fuelSet100 = document.getElementById("actuator_button_fuel_set_100");

    var oxidizerAdd1 = document.getElementById("actuator_button_oxidizer_add_1");
    var oxidizerAdd10 = document.getElementById("actuator_button_oxidizer_add_10");
    var oxidizerSub1 = document.getElementById("actuator_button_oxidizer_sub_1");
    var oxidizerSub10 = document.getElementById("actuator_button_oxidizer_sub_10");

    var oxidizerField = document.getElementById("actuator_oxidizer_field");
    var oxidizerSet = document.getElementById("actuator_button_oxidizer_set");
    var oxidizerSet0 = document.getElementById("actuator_button_oxidizer_set_0");
    var oxidizerSet100 = document.getElementById("actuator_button_oxidizer_set_100");

    var bothSet = document.getElementById("actuator_button_both_set");
    var bothSet0 = document.getElementById("actuator_button_both_set_0");
    var bothSet100 = document.getElementById("actuator_button_both_set_100");

    var actuatorLockCheckbox = document.getElementById("actuator_lock_checkbox");
    
    // Listeners for Fuel Actuator panel buttons

    fuelAdd1.addEventListener("click", e => {
        actuatorSingleSet("ACT_IPA_VALUE", Math.min(DATA.SENSORS.ACT_IPA.value + 1, 100));
    });

    fuelAdd10.addEventListener("click", e => {
        actuatorSingleSet("ACT_IPA_VALUE", Math.min(DATA.SENSORS.ACT_IPA.value + 10, 100));
    });

    fuelSub1.addEventListener("click", e => {
        actuatorSingleSet("ACT_IPA_VALUE", Math.max(DATA.SENSORS.ACT_IPA.value - 1, 0));
    });

    fuelSub10.addEventListener("click", e => {
        actuatorSingleSet("ACT_IPA_VALUE", Math.max(DATA.SENSORS.ACT_IPA.value - 10, 0));
    });
    
    fuelSet0.addEventListener("click", function () {
        actuatorSingleSet("ACT_IPA_VALUE", 0);
    });

    fuelSet100.addEventListener("click", function () {
        actuatorSingleSet("ACT_IPA_VALUE", 100);
    });

    fuelSet.addEventListener("click", function () {
        actuatorFuelFieldSet();
    });

    fuelField.addEventListener("keyup", function (e) {
        e.preventDefault();
        if (e.keyCode === 13) {
            actuatorFuelFieldSet(fuelField);
        }
    });

    // Listeners for Oxidizer Actuator panel buttons

    oxidizerAdd1.addEventListener("click", e => {
        actuatorSingleSet("ACT_N2O_VALUE", Math.min(DATA.SENSORS.ACT_N2O.value + 1, 100));
    });

    oxidizerAdd10.addEventListener("click", e => {
        actuatorSingleSet("ACT_N2O_VALUE", Math.min(DATA.SENSORS.ACT_N2O.value + 10, 100));
    });

    oxidizerSub1.addEventListener("click", e => {
        actuatorSingleSet("ACT_N2O_VALUE", Math.max(DATA.SENSORS.ACT_N2O.value - 1, 0));
    });

    oxidizerSub10.addEventListener("click", e => {
        actuatorSingleSet("ACT_N2O_VALUE", Math.max(DATA.SENSORS.ACT_N2O.value - 10, 0));
    });
    
    oxidizerSet0.addEventListener("click", function () {
        actuatorSingleSet("ACT_N2O_VALUE", 0);
    });

    oxidizerSet100.addEventListener("click", function () {
        actuatorSingleSet("ACT_N2O_VALUE", 100);
    });

    oxidizerSet.addEventListener("click", function () {
        actuatorOxidizerFieldSet();
    });

    oxidizerField.addEventListener("keyup", function (e) {
        e.preventDefault();
        if (e.keyCode === 13) {
            actuatorOxidizerFieldSet();
        }
    });

    // Listener for Both Actuator panel buttons

    bothSet0.addEventListener("click", function () {
        actuatorBothSet(0, 0);
    });

    bothSet100.addEventListener("click", function () {
        actuatorBothSet(100, 100);
    });

    bothSet.addEventListener("click", function () {
        var fuelField = document.getElementById("actuator_fuel_field");
        var oxidizerField = document.getElementById("actuator_oxidizer_field");

        var fuelValue = (getFieldValue(fuelField, 0, 100)) ? getFieldValue(fuelField, 0, 100) : DATA.SENSORS.ACT_IPA.value;
        var oxidizerValue = (getFieldValue(oxidizerField, 0, 100)) ? getFieldValue(oxidizerField, 0, 100) : DATA.SENSORS.ACT_N2O.value;
        actuatorBothSet(fuelValue, oxidizerValue);
    });

    actuatorLockCheckbox.addEventListener("click", function () {
        actuatorPanelLock(actuatorLockCheckbox.checked);
    }); 
}

function actuatorFuelFieldSet() {
    var fuelField = document.getElementById("actuator_fuel_field");
    var fuelValue = getFieldValue(fuelField, 0, 100);
    if (fuelValue) {
        actuatorSingleSet("ACT_IPA_VALUE", fuelValue);
    }
}

function actuatorOxidizerFieldSet() {
    var oxidizerField = document.getElementById("actuator_oxidizer_field");
    var oxidizerValue = getFieldValue(oxidizerField, 0, 100);
    if(oxidizerValue) {
        actuatorSingleSet("ACT_N2O_VALUE", oxidizerValue);
    }
}

function actuatorSingleSet(name, value) {
    socket.emit("actuator_set", {type: "SINGLE", name: name, value: value});
}

function actuatorBothSet(fuelValue, oxidizerValue) {
    socket.emit("actuator_set", {
        type: "BOTH",
        fuelValue: fuelValue,
        oxidizerValue: oxidizerValue
    })
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
        var fuelValue = getFieldValue(initialFuelField, 0, Infinity);
        if (fuelValue) {
            socket.emit("initial_volume", {name: "INITIAL_FUEL", value: fuelValue});
            initialVolumePanelLock(true);
        } else {
            console.log("Initial fuel input has non-number characters: " + fuelValue);
        }
    });

    setInitialOxidizerButton.addEventListener("click", function() {
        var oxidizerValue = getFieldValue(initialOxidizerField, 0, Infinity);
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


function addTodayPressureListener() {
    var setPressureButton = document.getElementById("daily_pressure_set");
    var pressureField = document.getElementById("daily_pressure_field");

    lockField(true, "today_pressure");

    setPressureButton.addEventListener("click", (event) => {
        if (lockableFields.today_pressure.locked) {
            lockField(false, "today_pressure");
        } else {
            var pressureValue = getFieldValue(pressureField, 0, Infinity);
            if (pressureValue) {
                lockField(true, "today_pressure");
                socket.emit("today_pressure", {name: "TODAY_PRESSURE", value: (pressureValue / 1000.0)});
            } else {
                console.log("Today's pressure input has non-number characters: " + pressureValue);
            }
        } 
    });
}

function addLoadResetButtonListener(){
    var resetButton = document.getElementById("load_reset_button");
    resetButton.addEventListener("click", function() {
        socket.emit("reset_load_cell", "");
    });
}

function addAccumulatedFlowResetButtonListener(){
    var resetButton = document.getElementById("accumulated_flow_reset");
    resetButton.addEventListener("click", function() {
        socket.emit("reset_accumulated_flow", "");
    });
}

function addStateButtonsListener () {
    DATA.STATES.NEUTRAL.domElement = document.getElementById(DATA.STATES.NEUTRAL.domID);
    DATA.STATES.NEUTRAL.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.NEUTRAL);
    });

    DATA.STATES.OX_LOADING.domElement = document.getElementById(DATA.STATES.OX_LOADING.domID);
    DATA.STATES.OX_LOADING.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.OX_LOADING);
    });
    
    DATA.STATES.PRESSURIZED_STANDBY.domElement = document.getElementById(DATA.STATES.PRESSURIZED_STANDBY.domID);
    DATA.STATES.PRESSURIZED_STANDBY.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.PRESSURIZED_STANDBY);
    });

    DATA.STATES.PRE_CHILL_N2O_LINE.domElement = document.getElementById(DATA.STATES.PRE_CHILL_N2O_LINE.domID);
    DATA.STATES.PRE_CHILL_N2O_LINE.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.PRE_CHILL_N2O_LINE);
    });

    DATA.STATES.IGNITION.domElement = document.getElementById(DATA.STATES.IGNITION.domID);
    DATA.STATES.IGNITION.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.IGNITION);
    });

    DATA.STATES.BURN.domElement = document.getElementById(DATA.STATES.BURN.domID);
    DATA.STATES.BURN.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.BURN);
    });

    DATA.STATES.SHUTDOWN.domElement = document.getElementById(DATA.STATES.SHUTDOWN.domID);
    DATA.STATES.SHUTDOWN.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.SHUTDOWN);
    });

    DATA.STATES.EMERGENCY.domElement = document.getElementById(DATA.STATES.EMERGENCY.domID);
    DATA.STATES.EMERGENCY.domElement.addEventListener("click", function(){
        stateButtonPressed(DATA.STATES.EMERGENCY);
    });

    // Initial state
    updateStateButtonVisuals();
}

function stateButtonPressed(state) {
    socket.emit("state_set", {name: "STATE_ID", id: state.id});
}

function addLockOverlayListener() {
    var lockPanel = document.getElementById("lock_overlay_container")
    var text = lockPanel.children[0];
    var checkbox = lockPanel.children[1];
    
    checkbox.addEventListener("click", function() {
        if (checkbox.checked) {
            lockPanel.classList.add("overlay_lock");
            text.innerHTML = "LOCKED";
        } else {
            lockPanel.classList.remove("overlay_lock");
            text.innerHTML = "Lock";
        }
    });
}

function updateStateButtonVisuals() {

    var activeState = findStateByID(DATA.ACTIVE_STATE_ID);

    for (var stateName in DATA.STATES) {
        if (DATA.STATES.hasOwnProperty(stateName)) {

            var curState = DATA.STATES[stateName];
            var curButton = document.getElementById(curState.domID);

            // Reset button (remove styling)
            curButton.classList.remove(DATA.STATES[stateName].activeClassName);

            if (curState.id == activeState.id) {
                // Set active on clicked button
                curButton.classList.add(activeState.activeClassName);
            }
        }
    }
}

function findStateByID(id) {
    for(var stateName in DATA.STATES) {
       if (DATA.STATES[stateName].id == id) {
           return DATA.STATES[stateName];
       }
       
    }
}

function getFieldValue(field, lower, upper) {
    var value = parseFloat(field.value);
    if (!isNaN(value)) {
        if (value >= lower && value <= upper) {
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

function lockField(enabled, lockableName) {
    var field = document.getElementById(lockableFields[lockableName].field_id);
    var button = document.getElementById(lockableFields[lockableName].button_id);

    if (enabled) {
        field.classList.add("panel_input_disabled");
        lockableFields[lockableName].locked = true;
        button.innerHTML = "Unlock";
    } else {
        field.classList.remove("panel_input_disabled");
        lockableFields[lockableName].locked  = false;
        button.innerHTML = "Lock";
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

function updateTodayPressure() {
    //var label = document.getElementById("daily_pressure_label");
    //label.innerHTML = "Today's pressure: " + DATA.TODAY_PRESSURE_BAR + " bar";
    
    if (lockableFields.today_pressure.locked) {
        var todayPressureField = document.getElementById(lockableFields.today_pressure.field_id);
        todayPressureField.value = DATA.TODAY_PRESSURE_BAR * 1000;
    }
}

function updateLastUpdatedTime() {
    var labelElement = document.getElementsByClassName("last_updated_time_panel")[0];
    var panelString = "";

    var pressureTime = (Date.now() - DATA.SENSORS.PT_N2.lastUpdated)/1000.0;
    var temperatureTime = (Date.now() - DATA.SENSORS.TC_IPA.lastUpdated)/1000.0;
    var flowTime = (Date.now() - DATA.SENSORS.FLO_IPA.lastUpdated)/1000.0;
    var loadTime = (Date.now() - DATA.SENSORS.LOAD.lastUpdated)/1000.0;
    var valveTime = (Date.now() - DATA.SENSORS.SV_FLUSH.lastUpdated)/1000.0;

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

    if (valveTime < limitTime) {
        panelString += "<p class=\"updates_alive\">Valve: " + valveTime.toFixed(1) + " seconds ago.</p>";
    } else {
        panelString += "<p class=\"updates_dead\">Valve is not receiving updates.</p>";
    }
    
    labelElement.innerHTML = panelString;
}

socket.on('info', function (data) {
    console.log(data)
})

socket.on('connect', function() {
    console.log("Connected");
});

function updateBurnTimer(){
    if(isBurnActive){
        document.getElementById('Timer').innerHTML =  ((Date.now() - startTime) / 1000.0).toFixed(2) + "s";
    }
}
var startTime;
socket.on('model_update', function (model){
    DATA = mergeModels(DATA, model);
    
    if(DATA.SENSORS.PT_CHAM.value >= 5){
        if(!isBurnActive){
            isBurnActive = true;
            startTime = Date.now();
        }
    }else{
        isBurnActive = false;
    }

    syncVisuals();
    //console.log("Model update");
});

function mergeModels(localModel, serverModel) {
    // Merge sensor data
    for (var sensorName in serverModel.SENSORS) {
        if (serverModel.SENSORS.hasOwnProperty(sensorName)) {

            // Create sensor if it does not exists
            localModel.SENSORS[sensorName] = localModel.SENSORS[sensorName] || {}

            for (var propertyName in serverModel.SENSORS[sensorName]) {
                if(serverModel.SENSORS[sensorName].hasOwnProperty(propertyName)) {
                    localModel.SENSORS[sensorName][propertyName] = serverModel.SENSORS[sensorName][propertyName];
                }
            }
        }
    }

    // Merge state data
    for (var stateName in serverModel.STATES) {
        if (serverModel.STATES.hasOwnProperty(stateName)) {

            // Create sensor if it does not exists
            localModel.STATES[stateName] = localModel.STATES[stateName] || {}

            for (var propertyName in serverModel.STATES[stateName]) {
                if(serverModel.STATES[stateName].hasOwnProperty(propertyName)) {
                    localModel.STATES[stateName][propertyName] = serverModel.STATES[stateName][propertyName];
                }
            }
        }
    }

    // Merge meta data
    localModel.ACTIVE_STATE_ID = serverModel.ACTIVE_STATE_ID;
    localModel.IS_LOGGING = serverModel.IS_LOGGING;
    localModel.TODAY_PRESSURE_BAR = serverModel.TODAY_PRESSURE_BAR;

    return localModel;
}

function updateVolumeIndicators() {

    // Temporarily shorten variable names
    var FLO_IPA = DATA.SENSORS.FLO_IPA;
    var FLO_N2O = DATA.SENSORS.FLO_N2O;

    var fuelFraction = Math.max((FLO_IPA.initial - FLO_IPA.accumulated) / FLO_IPA.initial, 0);
    var fuelTimeLeft = Math.max((FLO_IPA.initial - FLO_IPA.accumulated) / FLO_IPA.value, 0);
    
    FLO_IPA.dom_element_gradient.children[1].setAttribute("offset", 1-fuelFraction);
    FLO_IPA.dom_element_gradient.children[2].setAttribute("offset", 1-fuelFraction);
    FLO_IPA.dom_element_percentage.textContent = (fuelFraction * 100).toFixed(1) + "%";
    FLO_IPA.dom_element_time.textContent = fuelTimeLeft.toFixed(1) + "s"

    var oxidizerFraction = Math.max((FLO_N2O.initial - FLO_N2O.accumulated) / FLO_N2O.initial, 0);
    var oxidizerTimeLeft = Math.max((FLO_N2O.initial - FLO_N2O.accumulated) / FLO_N2O.value, 0);

    FLO_N2O.dom_element_gradient.children[1].setAttribute("offset", 1-oxidizerFraction);
    FLO_N2O.dom_element_gradient.children[2].setAttribute("offset", 1-oxidizerFraction);
    FLO_N2O.dom_element_percentage.textContent = (oxidizerFraction * 100).toFixed(1) + "%";
    FLO_N2O.dom_element_time.textContent = oxidizerTimeLeft.toFixed(1) + "s";

} 
setInterval(updateBurnTimer, 87);
setInterval(updateLastUpdatedTime, 500);
