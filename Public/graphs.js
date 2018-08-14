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
    addData(loadCellChart, data.timestamp, data.block.s1);
    addData(flowsChart, data.timestamp, data.block.s2);
    addData(engineTemperaturesChart, data.timestamp, data.block.s3);
    
});

socket.on("graph_history", function(data){
    console.log(data);
    data.forEach((datapoint) => {
        addData(loadCellChart, datapoint.timestamp, datapoint.block.s1);
    });
    data.forEach((datapoint) => {
        addData(flowsChart, datapoint.timestamp, datapoint.block.s2);
    });
    data.forEach((datapoint) => {
        addData(engineTemperaturesChart, datapoint.timestamp, datapoint.block.s3);
    });
});
