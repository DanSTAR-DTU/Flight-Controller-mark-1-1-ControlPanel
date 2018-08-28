// Valve States
var OPEN = "OPEN";
var CLOSED = "CLOSED";

var MODEL = {
    SENSORS: {
        SV_FLUSH: {value: "OPEN", type: "VALVE", lastUpdated: 0},
        SV_N2O: {value: "OPEN", type: "VALVE", lastUpdated: 0},
        SV_N2O_FILL: {value: "OPEN", type: "VALVE", lastUpdated: 0},
        SV_IPA: {value: "OPEN", type: "VALVE", lastUpdated: 0},

        PT_N2: {value: 10, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_IPA: {value: 10, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_N2O: {value: 10, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_FUEL: {value: 10, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_OX: {value: 10, type: "PRESSURE_SENSOR", lastUpdated: 0},
        PT_CHAM: {value: 10, type: "PRESSURE_SENSOR", lastUpdated: 0},

        TC_IPA: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_N2O: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

        TC_1: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_2: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_3: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_4: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_5: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},
        TC_6: {value: 10, type: "TEMPERATURE_SENSOR", lastUpdated: 0},

        FLO_IPA: {value: 10, initial: 20, accumulated: 0, type: "FLOW_SENSOR", lastUpdated: 0, density: 786},
        FLO_N2O: {value: 10, initial: 20, accumulated: 0, type: "FLOW_SENSOR", lastUpdated: 0, density: 1071},

        LOAD: {value: 10, type: "LOAD_CELL", lastUpdated: 0},

        ACT_IPA: {value: 10, type: "ACTUATOR", lastUpdated: 0},
        ACT_N2O: {value: 10, type: "ACTUATOR", lastUpdated: 0}
    },
    IS_LOGGING: false,
};

var DATA = {
    SENSORS: {
        SV_FLUSH: {svg_name: "SV_FLUSH", value: CLOSED, type: "VALVE", dom_element: null},
        SV_N2O: {svg_name: "SV_N2O", value: CLOSED, type: "VALVE", dom_element: null},
        SV_N2O_FILL: {svg_name: "SV_N2O_FILL", value: CLOSED, type: "VALVE", dom_element: null},
        SV_IPA: {svg_name: "SV_IPA", value: CLOSED, type: "VALVE", dom_element: null},

        PT_N2: {svg_name: "PT_N2", value: 0, type: "PRESSURE_SENSOR", dom_element: null, lastUpdated: 0},
        PT_IPA: {svg_name: "PT_IPA", value: 0, type: "PRESSURE_SENSOR", dom_element: null, lastUpdated: 0},
        PT_N2O: {svg_name: "PT_N2O", value: 0, type: "PRESSURE_SENSOR", dom_element: null, lastUpdated: 0},

        PT_FUEL: {svg_name: "PT_FUEL", value: 0, type: "PRESSURE_SENSOR", dom_element: null, lastUpdated: 0},
        PT_OX: {svg_name: "PT_OX", value: 0, type: "PRESSURE_SENSOR", dom_element: null, lastUpdated: 0},
        PT_CHAM: {svg_name: "PT_CHAM", value: 0, type: "PRESSURE_SENSOR", dom_element: null, lastUpdated: 0},

        TC_IPA: {svg_name: "TC_IPA", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},
        TC_N2O: {svg_name: "TC_N2O", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},

        TC_1: {svg_name: "TC_1", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},
        TC_2: {svg_name: "TC_2", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},
        TC_3: {svg_name: "TC_3", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},
        TC_4: {svg_name: "TC_4", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},
        TC_5: {svg_name: "TC_5", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},
        TC_6: {svg_name: "TC_6", value: 0, type: "TEMPERATURE_SENSOR", dom_element: null, lastUpdated: 0},

        FLO_IPA: {svg_name: "FLO_IPA", value: 0, type: "FLOW_SENSOR", dom_element_l: null, dom_element_m: null, dom_element_gradient: null, dom_element_percentage: null, dom_element_time: null, density: 0, accumulated: 18, lastUpdated: 0},
        FLO_N2O: {svg_name: "FLO_N2O", value: 0, type: "FLOW_SENSOR", dom_element_l: null,  dom_element_m: null, dom_element_gradient: null, dom_element_percentage: null, dom_element_time: null, density: 0, accumulated: 32, lastUpdated: 0},

        LOAD: {html_name: "load_cell_text", value: 0, type: "LOAD_CELL", dom_element: null, lastUpdated: 0},

        ACT_IPA: {svg_name: "ACT_IPA", value: 0, type: "ACTUATOR", dom_element: null},
        ACT_N2O: {svg_name: "ACT_N2O", value: 0, type: "ACTUATOR", dom_element: null}
    },
    IS_LOGGING: false
}

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

DATA = mergeModelIntoData(DATA, MODEL);
console.log(DATA);