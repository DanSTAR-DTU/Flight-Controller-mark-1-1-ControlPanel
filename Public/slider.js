var slider = document.getElementById("myRange");

let svgEle = document.getElementById("DataSVG");


svgEle.addEventListener('load', function() {
    var svgDoc = temperature.contentDocument;
    svgDoc.getElementById('temp1');
    svgDoc.innerHTML = slider.value; // Display the default slider value
    slider.svgDoc = function() {
        output.innerHTML = this.value;
        console.log(slider.value)
    };
    console.log(slider.value)
});


