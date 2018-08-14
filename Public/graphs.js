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
    addSingleData(flowsChart, 0, data.timestamp, data.block.TC_IPA);
    addSingleData(engineTemperaturesChart, 0, data.timestamp, data.block.PT_N2);
    
});

socket.on("graph_history", function(data){
    console.log(data);
    addMultipleData(loadCellChart, 0, data, "LOAD");
    addMultipleData(flowsChart, 0, data, "TC_IPA");
    addMultipleData(engineTemperaturesChart, 0, data, "PT_N2");
});
