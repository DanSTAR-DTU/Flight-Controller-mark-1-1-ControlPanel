var socket = io();

var loadCellChart = loadCellChart;
var flowsChart = flowsChart;
var engineTemperaturesChart = engineTemperaturesChart;

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

socket.on("graph_history", function(data){
    console.log(data);
    addMultipleData(loadCellChart, data.LOAD, ["LOAD_CELL"]);
    addMultipleData(flowsChart, data.FLOW, ["FLO_IPA_VALUE", "FLO_N2O_VALUE"]);
    addMultipleData(engineTemperaturesChart, data.TC, ["TC_1","TC_2","TC_3","TC_4","TC_5","TC_6"]);
});

socket.on("clear_graphs", function(data) {
    clearChart(loadCellChart);
    clearChart(flowsChart);
    clearChart(engineTemperaturesChart);
});
