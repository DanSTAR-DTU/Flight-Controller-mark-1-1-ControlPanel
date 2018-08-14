var socket = io();

var loadCellChart = loadCellChart;
var flowsChart = flowsChart;
var engineTemperaturesChart = engineTemperaturesChart;

function addData(chart, timestamp, value) {
    chart.data.labels.push(timestamp);
    chart.data.datasets[0].data.push(value);
    chart.update();
}

socket.on("graph_data", function(data){
    console.log(data);
    addData(loadCellChart, data.timestamp, data.block.LOAD);
    addData(flowsChart, data.timestamp, data.block.TC_IPA);
    addData(engineTemperaturesChart, data.timestamp, data.block.PT_N2);
    
});

socket.on("graph_history", function(data){
    console.log(data);
    data.forEach((datapoint) => {
        addData(loadCellChart, datapoint.timestamp, datapoint.block.LOAD);
        addData(flowsChart, datapoint.timestamp, datapoint.block.TC_IPA);
        addData(engineTemperaturesChart, datapoint.timestamp, datapoint.block.PT_N2);
    });
});
