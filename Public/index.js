var socket = io();

var socketIOLabel = document.getElementById("con_label_socketio");
var beagleLabel = document.getElementById("con_label_beagle");

setLabelStatus(socketIOLabel, false);
setLabelStatus(beagleLabel, false);

socket.on("connect", () => {
    setLabelStatus(socketIOLabel, true);
});

socket.on("disconnect", () => {
    setLabelStatus(socketIOLabel, false);
});

function setLabelStatus(label, connected) {
    if (connected) {
        label.innerHTML = "True";
        label.classList.remove("notconnected");
        label.classList.add("connected");
    } else {
        label.innerHTML = "False";
        label.classList.remove("connected");
        label.classList.add("notconnected");
    }
}

function logging(data) {
    var log = data
    socket.emit('logging' , log);
}