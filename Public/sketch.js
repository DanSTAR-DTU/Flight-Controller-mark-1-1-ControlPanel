let socket;
let textColor = 210;
function setup(){
    createCanvas(windowWidth, windowHeight);
    background(255);

    socket = io.connect('http://localhost:3000');

    noStroke();
    //DPR
    fill(150)
    rect(0,0,windowWidth/3*2,windowHeight/4);
    fill(textColor);
    text("DPR side",10,15);

    //Fuel
    fill(100,50,50);
    rect(0,windowHeight/4,windowWidth/3,windowHeight);
    fill(textColor);
    text("Fuel Side", 10,(windowHeight/4)+15);

    //Oxidizer
    fill(50,100,50)
    rect(windowWidth/3,windowHeight/4,windowWidth/3,windowHeight)
    fill(textColor);
    text("Oxidizer Side",(windowWidth/3)+10,(windowHeight/4)+15);

    //Engine
    fill(50,50,125);
    rect((windowWidth/3)*2,0,windowWidth,windowHeight);
    fill(textColor);
    text("Engine side",(windowWidth/3*2)+10,15);
}


function draw(){
    noStroke();
}