var engineTemperaturesGraph = document.getElementById("engine_temperatures_graph");
var engineTemperaturesContext = engineTemperaturesGraph.getContext("2d");
var engineTemperaturesChart = new Chart(engineTemperaturesContext, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'TC_1',
            data: [],
            backgroundColor: ['rgba(255, 99, 132, 0.0)'],
            borderColor: ['rgba(255, 99, 132, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'TC_2',
            data: [],
            backgroundColor: ['rgba(229, 255, 96, 0.0)'],
            borderColor: ['rgba(229, 255, 96, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'TC_3',
            data: [],
            backgroundColor: ['rgba(232, 169, 78, 0.0)'],
            borderColor: ['rgba(232, 169, 78, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'TC_4',
            data: [],
            backgroundColor: ['rgba(109, 78, 232, 0.0)'],
            borderColor: ['rgba(109, 78, 232, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'TC_5',
            data: [],
            backgroundColor: ['rgba(105, 254, 255, 0.0)'],
            borderColor: ['rgba(105, 254, 255, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'TC_6',
            data: [],
            backgroundColor: ['rgba(96, 255, 123, 0.0)'],
            borderColor: ['rgba(96, 255, 123, 1.0)'],
            borderWidth: 1
        },]
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
            text: 'Engine temperatures over time',
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