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
//control of vent 1
var a = document.getElementById("DataSVG");
var stateArray = []

function preLoad() {
    var svgDoc = a.contentDocument;
    for (var i = 1; i <= 6; i++) {
        svgDoc.getElementById('vent'+i+'_text').textContent = "OFF";
        svgDoc.getElementById('vent'+i+'_text').style.fill = 'red';
        stateArray[i] = false

    }

}


a.addEventListener('load', function () {
    preLoad()
    vents(1)
    vents(2)
    vents(3)
    vents(4)
    vents(5)
    vents(6)
});

function vents(i) {
    var svgDoc = a.contentDocument
    var delta = svgDoc.getElementById("vent"+i);
    delta.addEventListener("click", function () {
        if (stateArray[i] == false) {
            svgDoc.getElementById('vent'+i+'_text').textContent = 'ON';
            svgDoc.getElementById('vent'+i+'_text').style.fill = 'green';
            stateArray[i] = true
        } else {
            svgDoc.getElementById('vent'+i+'_text').textContent = "OFF";
            svgDoc.getElementById('vent'+i+'_text').style.fill = 'red';
            stateArray[i] = false
        }

    })
}


