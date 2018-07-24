var socket = io.connect('0.0.0.0:3000');
var array
var split = {}


socket.on('info', function (data) {
    var a = document.getElementById("svg60");
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