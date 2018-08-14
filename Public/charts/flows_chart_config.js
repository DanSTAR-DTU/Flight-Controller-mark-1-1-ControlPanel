var flowsGraph = document.getElementById("flows_graph");
var flowsContext = flowsGraph.getContext("2d");
var flowsChart = new Chart(flowsContext, {
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
            text: 'Flows over time',
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
                    labelString: "Time [s]",
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