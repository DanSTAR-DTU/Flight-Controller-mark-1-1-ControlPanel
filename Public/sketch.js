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

    //Engine or Specifications
    fill(50,50,125);
    rect((windowWidth/3)*2,0,windowWidth,windowHeight);
    fill(textColor);
    text("Engine or Specifications",(windowWidth/3*2)+10,15);

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

    //DPR
        strokeWeight(5);
        fill(200,36,183);
        stroke(0);
        line(windowWidth/3,(windowHeight/4)*0.25,windowWidth/3,(windowHeight/4)*0.95);// main down
        line((windowWidth/3)/2,(windowHeight/4)*0.95,(windowWidth/2),(windowHeight/4)*0.95);// vandrat forbinder Oxidizer og fuel
        line(windowWidth/3,windowHeight/30+135,(windowWidth/3)/2-135,windowHeight/30+135);// vandrat go under fuel
    //fill
        line(windowWidth/3+120,windowHeight/4*0.17,windowWidth/3+120,(windowHeight/30+71)-2)// lodrat
        line(windowWidth/3-80,windowHeight/30+71,windowWidth/3+115,windowHeight/30+71);// vandrat
        fill(255);stroke(255);
        triangle(windowWidth/3+115,(windowHeight/30+71)-5,windowWidth/3+125,(windowHeight/30+71)-5,windowWidth/3+120,windowHeight/30+71);//fill
        stroke(0);fill(0);
        triangle(windowWidth/3-90,windowHeight/30+71,windowWidth/3-80,(windowHeight/30+71)-5,windowWidth/3-80,(windowHeight/30+71)+5);//vandrat
        fill(200,36,183);
        noStroke();
    //Tap
        stroke(0);
        line(windowWidth/3,windowHeight/30+96,windowWidth/3-198,windowHeight/30+96);
        fill(255);stroke(255);
        triangle(windowWidth/3-200,windowHeight/30+96,windowWidth/3-190,(windowHeight/30+96)-5,windowWidth/3-190,(windowHeight/30+96)+5);//Vinkelret vandrat
        triangle(windowWidth/3-204,(windowHeight/30+96)-5,windowWidth/3-199,(windowHeight/30+96)-15,windowWidth/3-209,(windowHeight/30+96)-15);//Vinkelret lodrat
    //Valve
        triangle(windowWidth/3+50,windowHeight/30+71,windowWidth/3+40,(windowHeight/30+71)-5,windowWidth/3+40,(windowHeight/30+71)+5);
        triangle(windowWidth/3+52,windowHeight/30+71,windowWidth/3+62,(windowHeight/30+71)-5,windowWidth/3+62,(windowHeight/30+71)+5);
    //tank
        fill(200,36,183);
        noStroke();
        beginShape()
        arc(windowWidth/3,windowHeight/30,100,30,PI,0,PIE);
        rect(windowWidth/3-50,windowHeight/30,100,50);
        arc(windowWidth/3,windowHeight/30+49,100,30,0,PI,PIE);
        endShape();


    //Fuel Side
        stroke(0);
        line((windowWidth/3)/2,(windowHeight/4)*0.95,(windowWidth/3)/2,windowHeight/2);// DPR to fuel tank
        line((windowWidth/3)/2,windowHeight/2,(windowWidth/3)/2,windowHeight-60);
        line((windowWidth/3)/2-135,windowHeight/30+135,(windowWidth/3)/2-135,windowHeight-80); //lodrat lang, DRP to under tank
        line((windowWidth/3)/2-135,windowHeight-79,(windowWidth/3)/2,windowHeight-80);// vandret under tank fra DRP
        line((windowWidth/3)/2-135,windowHeight-110,windowWidth/2,windowHeight-110)//nederste tværgående
    //Fill
        line(windowWidth/6*0.6,windowHeight/2*0.75,windowWidth/6*0.6,windowHeight/2+190)
        line(windowWidth/6,windowHeight/2+190,windowWidth/6*0.6,windowHeight/2+190);
        fill(255);stroke(255);
        triangle(windowWidth/6*0.6-5,windowHeight/2*0.8,windowWidth/6*0.6+5,windowHeight/2*0.8,windowWidth/6*0.6,windowHeight/2*0.8+10)//fill
        noFill()
        triangle((windowWidth/3)/2-5,windowHeight-60,(windowWidth/3)/2+5,windowHeight-60,(windowWidth/3)/2,windowHeight-50,);
        fill(200,36,183);
    //Fork
        stroke(0);
        line(windowWidth/6*1.3,windowHeight/8*3,windowWidth/6*1.3,windowHeight/8*2.5)//op lodrat 1
        line(windowWidth/6*1.3,windowHeight/8*2.5,windowWidth/6*1.5,windowHeight/8*2.5)//op vandrat
        line(windowWidth/6*1.5,windowHeight/8*2.5,windowWidth/6*1.5,windowHeight/8*2.3)//op lodrat 2
        line(windowWidth/3/2,windowHeight/8*3,windowWidth/6*1.7,windowHeight/8*3);//mellem
        line(windowWidth/6*1.2,windowHeight/8*3,windowWidth/6*1.2,windowHeight/8*3.2); //ned lodrat
        line(windowWidth/6*1.2,windowHeight/8*3.2,windowWidth/6*1.55,windowHeight/8*3.2)//ned vandrat
        noStroke()
    //Valve
        stroke(255);fill(255);
        triangle((windowWidth/6*0.6)+50,windowHeight/2+190,(windowWidth/6*0.6)+40,(windowHeight/2+190)-5,(windowWidth/6*0.6)+40,(windowHeight/2+190)+5);
        triangle((windowWidth/6*0.6)+53,windowHeight/2+190,(windowWidth/6*0.6)+63,(windowHeight/2+190)-5,(windowWidth/6*0.6)+63,(windowHeight/2+190)+5);
        noStroke();fill(200,36,183);
    //Tank
        beginShape();
        arc((windowWidth/3)/2,windowHeight/2,100,30,PI,0,PIE);
        rect((windowWidth/3)/2-50,windowHeight/2,100,150);
        arc((windowWidth/3)/2,windowHeight/2+150,100,30,0,PI,PIE);
        endShape();


    //Oxidizer Side
        stroke(0);
        line(windowWidth/2-0.1,(windowHeight/4)*0.95,windowWidth/2-0.1,windowHeight/2);//DPR to oxidizer tank
        line(windowWidth/2+0.1,windowHeight/2,windowWidth/2+0.1,windowHeight-60);
    //Fill
        line(windowWidth/6*2.6,windowHeight/2*0.75,windowWidth/6*2.6,windowHeight/2+190)
        line(windowWidth/6*2.6,windowHeight/2+190,windowWidth/2+0.1,windowHeight/2+190);
        fill(255);stroke(255);
    //trekaner
        triangle(windowWidth/6*2.6-5,windowHeight/2*0.8,windowWidth/6*2.6+5,windowHeight/2*0.8,windowWidth/6*2.6,windowHeight/2*0.8+10)//fill
        triangle(windowWidth/2-4,windowHeight-60,windowWidth/2+6,windowHeight-60,windowWidth/2+1,windowHeight-50);
        fill(200,36,183);
    //Fork
        stroke(0);
        //op
        line(windowWidth/6*3.3,windowHeight/8*3,windowWidth/6*3.3,windowHeight/8*2.5)//op lodrat 1
        line(windowWidth/6*3.3,windowHeight/8*2.5,windowWidth/6*3.5,windowHeight/8*2.5)//op vandrat
        line(windowWidth/6*3.5,windowHeight/8*2.5,windowWidth/6*3.5,windowHeight/8*2.3)//op lodrat 2
        //mellem
        line(windowWidth/2-0.1,windowHeight/8*3,windowWidth/6*3.7,windowHeight/8*3);//mellem
        line(windowWidth/6*3.7,windowHeight/8*3,windowWidth/6*3.7,windowHeight/8*2.7);//mellem ekstra lodrat 1
        line(windowWidth/6*3.7,windowHeight/8*2.7,windowWidth/6*3.85,windowHeight/8*2.7)//mellem ekstra vandrat
        line(windowWidth/6*3.85,windowHeight/8*2.7,windowWidth/6*3.85,windowHeight/8*2.3)
        //ned
        line(windowWidth/6*3.2,windowHeight/8*3,windowWidth/6*3.2,windowHeight/8*3.2); //ned lodrat
        line(windowWidth/6*3.2,windowHeight/8*3.2,windowWidth/6*3.55,windowHeight/8*3.2)//ned vandrat
        noStroke()
    //Valve
        stroke(255);fill(255);
        triangle((windowWidth/2-4)-52,windowHeight/2+190,(windowWidth/2-4)-62,(windowHeight/2+190)-5,(windowWidth/2-4)-62,(windowHeight/2+190)+5);
        triangle((windowWidth/2-4)-50,windowHeight/2+190,(windowWidth/2-4)-40,(windowHeight/2+190)-5,(windowWidth/2-4)-40,(windowHeight/2+190)+5);
        noStroke();fill(200,36,183);
    //tank
        beginShape();
        arc((windowWidth/2),windowHeight/2,100,30,PI,0,PIE);
        rect((windowWidth/2)-50,windowHeight/2,100,150)
        arc((windowWidth/2),windowHeight/2+150,100,30,0,PI,PIE);
        endShape();
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