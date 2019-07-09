//-------------------Initial Canvas Creation & Resize Listener-----------------
var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 4;

var c = canvas.getContext('2d');

window.addEventListener('resize', function (event) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 4;
});

//-------------------------------Star Logic------------------------------------
var xMousePos;
var yMousePos;

function Star(xPos, yPos) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.radius = Math.random() * 1.5;
    this.xSpeed = Math.random() - 0.5;
    this.ySpeed = Math.random() - 0.5;
}

function initStars(numCircles) {
    let stars = [];
    for (let i = 0; i < numCircles; i++) {
        let xPos = Math.random() * canvas.width;
        let yPos = Math.random() * canvas.height;
        stars.push(new Star(xPos, yPos));
    }
    return stars;
}

function drawStars(stars) {
    for (let star of stars) {
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(star.xPos, star.yPos, star.radius, 0, 2 * Math.PI);
        c.fill();
    }
}

function updateStars(stars) {
    let newStars = []
    for (let i = 0; i < stars.length; i++) {
        let xPos = stars[i].xPos + stars[i].xSpeed;
        let yPos = stars[i].yPos + stars[i].ySpeed;
        stars[i].xPos = xPos;
        stars[i].yPos = yPos;
        if ((xPos >= 0 && xPos <= canvas.width) &&
            (yPos >= 0 && yPos <= canvas.height)) {
            newStars.push(stars[i]);
        }
    }
    return newStars;
}

function checkStarPopulation(stars, initNumStars) {
    while (stars.length < initNumStars) {
        let wall = Math.floor(Math.random() * 4) + 1; // correstponds to wall side
        let xPos = Math.random() * canvas.width;
        let yPos = Math.random() * canvas.height;
        if (wall == 1)
            stars.push(new Star(0, yPos));
        else if (wall == 2)
            stars.push(new Star(xPos, 0));
        else if (wall == 3)
            stars.push(new Star(canvas.width, yPos));
        else if (wall == 4)
            stars.push(new Star(xPos, canvas.height));
    }
    return stars;
}

function euclideanDistance(star1, star2) {
    return Math.sqrt(Math.pow(star2.xPos - star1.xPos, 2) +
        Math.pow(star2.yPos - star1.yPos, 2));
}

/**
 * gets the opacity of the 
 * @param {number} MaxDistance - the max possible value CurrentDistance could have
 * @param {number} MaxBrightness - the max opacity wanted (i.e. ff -> 255)
 * @param {number} CurrentDistance - the value that needs to be converted
 * @returns a String representation of the last two hex values 
 */
function getHexVal(MaxDistance, MaxBrightness, CurrentDistance) {
    const OldRange = MaxDistance;
    const NewRange = MaxBrightness;
    const NewValue = Math.round((CurrentDistance * NewRange) / OldRange);
    let hexVal = (MaxBrightness - NewValue).toString(16);
    if (hexVal.length == 1)
        hexVal = "0" + hexVal;
    if (hexVal.length == 0)
        hexVal = "00";
    return hexVal;
}

function drawLines(stars, maxEuclideanDistance) {
    const MaxBrightness = 48;
    for (let i = 0; i < stars.length; i++) {
        let mouseED = euclideanDistance(new Star(xMousePos, yMousePos), stars[i]);
        if (mouseED < maxEuclideanDistance) {
            const hexVal = getHexVal(maxEuclideanDistance, MaxBrightness, mouseED);
            c.strokeStyle = '#ffffff' + hexVal;
            c.beginPath();
            c.moveTo(stars[i].xPos, stars[i].yPos);
            c.lineTo(xMousePos, yMousePos);
            c.stroke();
        }
        for (let j = i; j < stars.length; j++) {
            let ed = euclideanDistance(stars[i], stars[j]);
            if (ed < maxEuclideanDistance) {
                const hexVal = getHexVal(maxEuclideanDistance, MaxBrightness, ed);
                c.strokeStyle = '#ffffff' + hexVal;
                c.beginPath();
                c.moveTo(stars[i].xPos, stars[i].yPos);
                c.lineTo(stars[j].xPos, stars[j].yPos);
                c.stroke();
            }
        }
    }
}

// ----------------------MOUSE INTERACTABILITY---------------------------------
function findMouseCoords(mouseEvent) {
    var xpos;
    var ypos;
    if (mouseEvent) {
        //FireFox
        xpos = mouseEvent.pageX;
        ypos = mouseEvent.pageY;
    } else {
        //IE
        xpos = window.event.x + document.body.scrollLeft - 2;
        ypos = window.event.y + document.body.scrollTop - 2;
    }
    xMousePos = xpos;
    yMousePos = ypos;
}

function addClusterOnClick(mouseEvent) {
    for (let i = 0; i < 4; i++) {
        stars.push(new Star(xMousePos, yMousePos));
    }
}
document.querySelector('canvas').onmousemove = findMouseCoords;
document.querySelector('canvas').onmousedown = addClusterOnClick;

// ---------------------------Animation/"main"---------------------------------
var initNumStars = 175;
var maxEuclideanDistance = 200;

var stars = initStars(initNumStars);
drawStars(stars);

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);
    stars = updateStars(stars);
    stars = checkStarPopulation(stars, initNumStars);
    drawStars(stars);
    drawLines(stars, maxEuclideanDistance);
    checkForms();
}
animate();

//-----------------------Handle Submit-----------------------------------------
window.addEventListener('keydown', function (e) {
    if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {
        if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {
            e.preventDefault();
            return false;
        }
    }
}, true);

function checkForms() {
    if (document.getElementById("numstarsID")) {
        let numStars = parseInt(document.getElementById("numstarsID").value);
        if (numStars && numStars <= 800)
            initNumStars = parseInt(numStars);
    }
    if (document.getElementById("edID")) {
        let ed = parseInt(document.getElementById("edID").value);
        if (ed && ed < 1000)
            maxEuclideanDistance = parseInt(ed);
        else if (ed && ed >= 1000)
            maxEuclideanDistance = 1000;
    }
}