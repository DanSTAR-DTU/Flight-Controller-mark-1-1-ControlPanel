var socket = io();

var loadCellChart = loadCellChart;
var flowsChart = flowsChart;
var engineTemperaturesChart = engineTemperaturesChart;

function addSingleData(chart, setIndex, timestamp, value) {
    chart.data.labels.push(timestamp);
    chart.data.datasets[setIndex].data.push(value);
    chart.update();
}

function addMultipleData(chart, setIndex, data, valuename) {
    data.forEach((datapoint) => {
        chart.data.labels.push(datapoint.timestamp);
        chart.data.datasets[setIndex].data.push(datapoint.block[valuename]);
    });
    chart.update();
}

socket.on("graph_data", function(data){
    console.log(data);
    addSingleData(loadCellChart, 0, data.timestamp, data.block.LOAD);
    addSingleData(flowsChart, 0, data.timestamp, data.block.FLO_IPA);
    addSingleData(engineTemperaturesChart, 0, data.timestamp, data.block.TC_1);
    
});

socket.on("graph_history", function(data){
    console.log(data);
    addMultipleData(loadCellChart, 0, data, "LOAD");
    addMultipleData(flowsChart, 0, data, "FLO_IPA");
    addMultipleData(engineTemperaturesChart, 0, data, "TC_1");
});

socket.on("clear_graphs", function(data) {
    // Clear load cell graph
    loadCellChart.data.labels = [];
    loadCellChart.data.datasets[0].data = [];
    loadCellChart.update();

    // Clear flow chart graph
    flowsChart.data.labels = [];
    flowsChart.data.datasets[0].data = [];
    flowsChart.update();

    // Clear engine temperature graph
    engineTemperaturesChart.data.labels = [];
    engineTemperaturesChart.data.datasets[0].data = [];
    engineTemperaturesChart.update();
    
});
