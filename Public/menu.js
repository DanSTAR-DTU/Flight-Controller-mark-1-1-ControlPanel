var a = document.getElementById("menu");
a.addEventListener("load", function () {
    var svgDoc = a.contentDocument;
    var delta = svgDoc.getElementById("rocket");
    delta.addEventListener("mousedown", function () {
        //document.location.href='rocket.html'
        window.open("rocket.html");
    })
});


a.addEventListener("load", function () {
    var svgDoc = a.contentDocument;
    var delta = svgDoc.getElementById("graph");
    delta.addEventListener("mousedown", function () {
        //document.location.href='graphs.html'
        window.open("graphs.html");
    })
});