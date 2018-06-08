let socket;
let textColor = 210;
let abortColor = 255;

let x1;
let y1;
let x2;
let y2;
let xdist;
let ydist;

function setup(){
    createCanvas(windowWidth, windowHeight);
    background(255);

    socket = io.connect('192.168.43.116:3000');
    //socket.on('mouse', newDrawing);

    noStroke();
    textSize(13);
    //DPR
    fill(150)
    rect(0,0,windowWidth/3*2,windowHeight/4);
    fill(textColor);
    text("DPR Side",10,15);

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
    text("Engine Side",(windowWidth/3*2)+10,15);

    //Abort
    fill(150,0,0);
    rect((windowWidth/3)*2,windowHeight/4*3,windowWidth,windowHeight);
    fill(abortColor,0,0);
    ellipse((windowWidth/6)*5,windowHeight/8*7,(windowWidth/3)-50,(windowHeight/4)-50);
    fill(textColor);
    textSize(50);
    text("ABORT",windowWidth/6*5-80,windowHeight/8*7+15)
}
function draw(){
    fill(abortColor,0,0);
    ellipse((windowWidth/6)*5,windowHeight/8*7,(windowWidth/3)-50,(windowHeight/4)-50);
    fill(textColor);
    textSize(50);
    text("ABORT",windowWidth/6*5-80,windowHeight/8*7+15)

    x1 = mouseX;
    y1 = mouseY;
    //Button Center
    x2 = (windowWidth/6)*5;
    y2 = windowHeight/8*7;

    xdist = abs(x2-x1);
    ydist = abs(y2-y1);

    if (xdist < ((windowWidth/3)-50)/2 && ydist < ((windowHeight/4)-50)/2){
        abortColor = 255;

    }else{
        abortColor = 200;
    }
}

function mouseClicked() {
    if(xdist < ((windowWidth/3)-50)/2 && ydist < ((windowHeight/4)-50)/2){
        alert("Abort");
    }
}

    



/*function mouseDragged(){
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
}*/