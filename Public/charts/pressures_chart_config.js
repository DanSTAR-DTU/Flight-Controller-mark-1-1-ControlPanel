var pressuresGraph = document.getElementById("pressures_graph");
var pressuresContext = pressuresGraph.getContext("2d");
var pressuresChart = new Chart(pressuresContext, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'PT_N2',
            data: [],
            backgroundColor: ['rgba(255, 99, 132, 0.0)'],
            borderColor: ['rgba(255, 99, 132, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'PT_N2O',
            data: [],
            backgroundColor: ['rgba(229, 255, 96, 0.0)'],
            borderColor: ['rgba(229, 255, 96, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'PT_IPA',
            data: [],
            backgroundColor: ['rgba(232, 169, 78, 0.0)'],
            borderColor: ['rgba(232, 169, 78, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'PT_FUEL',
            data: [],
            backgroundColor: ['rgba(109, 78, 232, 0.0)'],
            borderColor: ['rgba(109, 78, 232, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'PT_OX',
            data: [],
            backgroundColor: ['rgba(105, 254, 255, 0.0)'],
            borderColor: ['rgba(105, 254, 255, 1.0)'],
            borderWidth: 1
        },
        {
            label: 'PT_CHAM',
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
            text: 'Pressures over time',
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
                    labelString: "Pressure [Bar]",
                    fontColor: 'rgb(255,255,255)'
                }
            }]
        },
        tooltips: {
            enabled: true
        }
    }
});