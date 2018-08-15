var socket = io();

var loadCellChart = loadCellChart;
var flowsChart = flowsChart;
var engineTemperaturesChart = engineTemperaturesChart;

function addSingleData(chart, datapoint, valuenames) {
    chart.data.labels.push(datapoint.timestamp);
    for (var i = 0; i < valuenames.length; i++) {
        chart.data.datasets[i].data.push(datapoint.block[valuenames[i]]);
    }
    chart.update();
}

function addMultipleData(chart, data, valuenames) {
    data.forEach((datapoint) => {
        chart.data.labels.push(datapoint.timestamp);
        for (var i = 0; i < valuenames.length; i++) {
            chart.data.datasets[i].data.push(datapoint.block[valuenames[i]]);
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

socket.on("graph_data", function(datapoint){
    console.log(datapoint);
    addSingleData(loadCellChart, datapoint, ["LOAD"]);
    addSingleData(flowsChart, datapoint, ["FLO_IPA", "FLO_N2O"]);
    addSingleData(engineTemperaturesChart, datapoint, ["TC_1","TC_2","TC_3","TC_4","TC_5","TC_6"]);
    
});

socket.on("graph_history", function(data){
    console.log(data);
    addMultipleData(loadCellChart, data, ["LOAD"]);
    addMultipleData(flowsChart, data, ["FLO_IPA", "FLO_N2O"]);
    addMultipleData(engineTemperaturesChart, data, ["TC_1","TC_2","TC_3","TC_4","TC_5","TC_6"]);
});

socket.on("clear_graphs", function(data) {
    clearChart(loadCellChart);
    clearChart(flowsChart);
    clearChart(engineTemperaturesChart);
});
