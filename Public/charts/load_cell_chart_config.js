var loadCellGraph = document.getElementById("load_cell_graph");
var loadCellContext = loadCellGraph.getContext("2d");
var loadCellChart = new Chart(loadCellContext, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'LOAD',
            data: [],
            backgroundColor: ['rgba(255, 99, 132, 0.0)'],
            borderColor: ['rgba(255, 99, 132, 1.0)'],
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
            text: 'Load cell over time',
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
                    labelString: "Force [N]",
                    fontColor: 'rgb(255,255,255)'
                }
            }]
        },
        tooltips: {
            enabled: true
        }
    }
});