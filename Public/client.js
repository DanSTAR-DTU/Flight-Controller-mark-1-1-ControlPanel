var socket = io.connect('0.0.0.0:3000');
socket.on('info', function (data) {
    console.log(data);
    var svg = document.getElementById("svg60")
    svg.addEventListener('load', function() {
        setInterval(
            svg.getElementById('fuel_tank').setAttribute('fill', 'red'),2000)
    });
});