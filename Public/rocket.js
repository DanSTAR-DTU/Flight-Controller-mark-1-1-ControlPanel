/*var socket = io.connect('0.0.0.0:3000');
var array
var split = {}


socket.on('info', function (data) {
    var a = document.getElementById("svg_data");
    a.addEventListener("load", function () {
        var svgDoc = a.contentDocument;
        var delta = svgDoc.getElementById("oxy")
        delta.addEventListener("mousedown", function () {
            array = data.replace(/,|;/gi,'');
            array = array.split(' ');
            for(var i = 0; i<=(array.length/2)+1; i=i+2){
                split[array[i]] = array[i+1]
            }
            console.log(split)
            svgDoc.getElementById('oxy').setAttribute('fill', 'green');

            socket.emit("dataFromClient", split)
        }, false);

    });

});
//'/([^,]+)([^;]+)/g'
*/
var socket = io.connect('0.0.0.0:3000');

socket.on('info', function (data) {
    console.log(data)
})

var a = document.getElementById("DataSVG");
var stateArray = []
var valvesArr = []
//sets alle valves to closed state
function preLoad() {
    var svgDoc = a.contentDocument;
    for (var i = 1; i <= 6; i++) {
        svgDoc.getElementById('vent'+i+'_text').textContent = "CLOSED";
        svgDoc.getElementById('vent'+i+'_text').style.fill = 'red';

        stateArray[i] = false

    }

}
// listensten to all click events on vents
a.addEventListener('load', function () {
    preLoad();
    valves(1);
    valves(2);
    valves(3);
    valves(4);
    actuator();
});

function valves(i) {
    var svgDoc = a.contentDocument
    var delta = svgDoc.getElementById("vent2-"+i);
    delta.addEventListener("click", function () {
        if (stateArray[i] == false) {
            svgDoc.getElementById('vent'+i+'_text').textContent = 'OPEN';
            svgDoc.getElementById('vent'+i+'_text').style.fill = 'green';
            stateArray[i] = true
        } else {
            svgDoc.getElementById('vent'+i+'_text').textContent = "CLOSED";
            svgDoc.getElementById('vent'+i+'_text').style.fill = 'red';
            stateArray[i] = false
        }

    })
}


function actuator() {
    var svgDoc = a.contentDocument;
    var delta = document.getElementById("openValveButton1")
    delta.addEventListener("click", function () {
        var input = document.getElementById('openValve1')
        console.log(input.value)
        if(input.value == 'close'){
            svgDoc.getElementById('vent5_text').textContent = "CLOSED";
            svgDoc.getElementById('vent5_text').style.fill = 'red';
        }else if (input.value == 'open') {
            svgDoc.getElementById('vent5_text').textContent = 'OPEN';
            svgDoc.getElementById('vent5_text').style.fill = 'green';
        }else{
            svgDoc.getElementById('vent5_text').textContent = input.value;
            svgDoc.getElementById('vent5_text').style.fill = 'green';
        }
    })
    var gamma = document.getElementById("openValveButton2")
    gamma.addEventListener("click", function () {
        var input = document.getElementById('openValve2')
        console.log(input.value)
        if(input.value == 'close'){
            svgDoc.getElementById('vent6_text').textContent = "CLOSED";
            svgDoc.getElementById('vent6_text').style.fill = 'red';
        }else if (input.value == 'open') {
            svgDoc.getElementById('vent6_text').textContent = 'OPEN';
            svgDoc.getElementById('vent6_text').style.fill = 'green';
        }else{
            svgDoc.getElementById('vent6_text').textContent = input.value;
            svgDoc.getElementById('vent6_text').style.fill = 'green';

        }
    })
}
