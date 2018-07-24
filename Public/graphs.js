var socket = io();

var graph = document.getElementById("graph");
var context = graph.getContext("2d");
var chart = new Chart(context, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Input',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        elements: {
            line: {
                tension: 0
            },
            point: {
                radius: 1,
                pointStyle: 'circle'
            }
        },
        title: {
            display: true,
            text: 'Data chart',
            fontColor: 'rgb(255,255,255)'
        },
        legend: {
            display: true,
            labels: {
                fontColor: 'rgb(255,255,255)',
                usePointStyle: true
            }
        },
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero:true,
                    fontColor: 'rgb(255,255,255)'
                },
                scaleLabel: {
                    display: true,
                    labelString: "Time [ms]",
                    fontColor: 'rgb(255,255,255)'
                }
            }], yAxes: [{
                ticks: {
                    beginAtZero:true,
                    fontColor: 'rgb(255,255,255)'
                },
                scaleLabel: {
                    display: true,
                    labelString: "Input size",
                    fontColor: 'rgb(255,255,255)'
                }
            }]
        },
        tooltips: {
            enabled: true
        }
    }
});

var startTime = Date.now();
var lastValue = 50;

/*addData(chart, 0, getRandomValue());
setInterval(function() {
    addData(chart, Date.now() - startTime, getRandomValue());
}, 250);*/

function addData(chart, timestamp, value) {
    chart.data.labels.push(timestamp);
    chart.data.datasets[0].data.push(value);
    chart.update();
}

function getRandomValue() {
    lastValue += ((Math.random() * 10) - 5);
    return lastValue;
}

socket.on("graph_data", function(data){
    console.log(data);
    addData(chart, data.timestamp, data.value);
});