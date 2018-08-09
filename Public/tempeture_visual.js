let temperature = document.getElementById("DataSVG");


temperature.addEventListener('load', function(){
    var svgDoc = temperature.contentDocument

    svgDoc.getElementById('pressure_tank').textContent = 0 +' bar';
    svgDoc.getElementById('fuel_pressure').textContent = 0 +' bar';;
    svgDoc.getElementById('oxid_pressure').textContent = 0 +' bar';;
    svgDoc.getElementById('left_side_pressure').textContent = 0 +' bar';;
    svgDoc.getElementById('right_side_pressure').textContent = 0 +' bar';;
    svgDoc.getElementById('fuel_flow').textContent = 0+' flow'; ;
    svgDoc.getElementById('oxid_flow').textContent = 0+' flow';
    svgDoc.getElementById("fuel_temp").textContent = 0+' C';
    svgDoc.getElementById("oxid_temp").textContent = 0+' C';
    svgDoc.getElementById("champer_pressure").textContent = 0+' bar';
    for(var i = 1; i <= 6; i++) {
        console.log('temp'+i+'');
        svgDoc.getElementById('temp'+i+'').textContent = 0
    }
});




