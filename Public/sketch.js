let socket;
let textColor = 210;
function setup(){
    createCanvas(windowWidth, windowHeight);
    background(255);

    socket = io.connect('192.168.43.116:3000');
    socket.on('mouse', newDrawing);

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

}

function mouseDragged(){
    noStroke();
    fill(255);
    ellipse(mouseX, mouseY, 36 ,36);

    sendmouse(mouseX, mouseY);
}

function newDrawing(data) {
    noStroke();
    fill(255, 0, 2);
    ellipse(data.x, data.y, 36, 36);
    socket.emit('mouse', data);
}

function sendmouse(xpos, ypos) {
    // We are sending!
    console.log("sendmouse: " + xpos + " " + ypos);

    // Make a little object with  and y
    var data = {
        x: xpos,
        y: ypos
    };

    // Send that object to the socket
    socket.emit('mouse',data);
}