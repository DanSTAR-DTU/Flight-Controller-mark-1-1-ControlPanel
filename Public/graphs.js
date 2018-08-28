var socket = io();

var loadCellChart = loadCellChart;
var flowsChart = flowsChart;
var engineTemperaturesChart = engineTemperaturesChart;
var pressuresChart = pressuresChart;

if (loadCellChart == null) {
    console.error("Load cell chart is missing configuration.");
}

if (flowsChart == null) {
    console.error("Flows chart is missing configuration.");
}

if (engineTemperaturesChart == null) {
    console.error("Engine temperatures chart is missing configuration.");
}

if (pressuresChart == null) {
    console.error("Pressures chart is missing configuration.");
}

function addSingleData(chart, datapoint, valuenames) {
    chart.data.labels.push(datapoint.timestamp);
    for (var i = 0; i < valuenames.length; i++) {
        chart.data.datasets[i].data.push(datapoint.data[valuenames[i]]);
    }
    chart.update();
}

function addMultipleData(chart, data, valuenames) {
    data.forEach((datapoint) => {
        chart.data.labels.push(datapoint.timestamp);
        for (var i = 0; i < valuenames.length; i++) {
            chart.data.datasets[i].data.push(datapoint.data[valuenames[i]]);
        }
    });
    chart.update();
}

function clearChart(chart) {
    chart.data.labels = [];
    for (var i = 0; i < chart.data.datasets.length; i++) {
        chart.data.datasets[i].data = [];
    }
    chart.update();
}

function clearGraphs() {
    clearChart(loadCellChart);
    clearChart(flowsChart);
    clearChart(engineTemperaturesChart);
    clearChart(pressuresChart);
}

socket.on("graph_data_load", function(datapoint){
    console.log(datapoint);
    addSingleData(loadCellChart, datapoint, ["LOAD_CELL"]);   
});

socket.on("graph_data_flow", function(datapoint){
    console.log(datapoint);
    addSingleData(flowsChart, datapoint, ["FLO_IPA_VALUE", "FLO_N2O_VALUE"]);
});

socket.on("graph_data_tc", function(datapoint){
    console.log(datapoint);
    addSingleData(engineTemperaturesChart, datapoint, ["TC_1","TC_2","TC_3","TC_4","TC_5","TC_6"]); 
});

socket.on("graph_data_pressure", function(datapoint){
    console.log(datapoint);
    addSingleData(pressuresChart, datapoint, ["PT_N2", "PT_N2O", "PT_IPA", "PT_FUEL", "PT_OX", "PT_CHAM"]); 
});

socket.on("graph_history", function(data){
    console.log(data);
    addMultipleData(loadCellChart, data.LOAD, ["LOAD_CELL"]);
    addMultipleData(flowsChart, data.FLOW, ["FLO_IPA_VALUE", "FLO_N2O_VALUE"]);
    addMultipleData(engineTemperaturesChart, data.TC, ["TC_1","TC_2","TC_3","TC_4","TC_5","TC_6"]);
    addMultipleData(pressuresChart, data.PRESSURE, ["PT_N2", "PT_N2O", "PT_IPA", "PT_FUEL", "PT_OX", "PT_CHAM"]);
});

socket.on("clear_graphs", function(data) {
    clearGraphs();
});
