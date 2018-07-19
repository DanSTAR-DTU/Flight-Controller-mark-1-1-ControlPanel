var socket = io.connect('0.0.0.0:3000');

socket.on('info', setInterval(function (data){
    console.log(data);
    var a = document.getElementById("testSVG");
    a.addEventListener("load",function(){
        var svgDoc = a.contentDocument;
        var delta = svgDoc.getElementById("oxy");
        delta.addEventListener("mousedown",function(){
            alert('hello world!')
        }, false);

   })

})