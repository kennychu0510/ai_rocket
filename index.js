"use strict";
const _canvas = document.querySelector('canvas');
if (!_canvas)
    throw new Error('canvas not found');
const canvas = _canvas;
let _c = canvas.getContext('2d');
if (!_c)
    throw new Error('canvas not found');
const c = _c;
/* QUERY SELECTORS */
const currentScore = getDOMElement('#current-score');
const totalScore = getDOMElement('#total-score');
const genStarBtn = getDOMElement('#gen-star');
const rocketSpeed = getDOMElement('#rocket-speed');
// TIMER
const timerMilliseconds = getDOMElement('#millisecond');
const timerSeconds = getDOMElement('#second');
const _scoreboard = document.querySelector('#scoreboard');
if (!_scoreboard)
    throw new Error('score-board not found');
const scoreboard = _scoreboard;
const resetBtn = getDOMElement('#reset');
resetBtn.addEventListener('click', () => {
    location.reload();
});
const body = document.querySelector('body');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;
/* VARIABLES */
const boundarySize = 40;
const starSize = 20;
const boundaryOffset = 20;
const trackTopBound = boundaryOffset;
const trackBotBound = canvas.height - boundaryOffset;
const trackLeftBound = boundaryOffset;
const trackRightBound = canvas.width - boundaryOffset;
const addStarBtn = getDOMElement('#add-star');
addStarBtn.addEventListener('click', () => {
    addStarMode = !addStarMode;
    if (addStarMode) {
        addStarBtn.textContent = 'Done';
    }
    else {
        addStarBtn.textContent = 'Add Star';
    }
});
/* GAME STATES */
let addStarMode = false;
let gameStarted = false;
let startTime;
let totalStars;
/* MEDIA */
const spaceshipImg = new Image();
spaceshipImg.src = './media/spaceship.png';
const starImg = new Image();
starImg.src = './media/star.png';
class Boundary {
    top;
    right;
    bot;
    left;
    constructor(top, right, bot, left) {
        this.top = top;
        this.right = right;
        this.bot = bot;
        this.left = left;
    }
    draw() {
        c.beginPath();
        c.strokeStyle = 'red';
        c.moveTo(this.left, this.top);
        c.lineTo(this.right, this.top);
        c.lineTo(this.right, this.bot);
        c.lineTo(this.left, this.bot);
        c.closePath();
        c.stroke();
    }
}
class Star {
    position;
    image;
    size;
    constructor(position) {
        this.position = position;
        this.image = starImg;
        this.size = starSize;
    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }
}
class Rocket {
    position;
    velocity;
    size;
    acceleration;
    image;
    alive;
    angle;
    turn;
    collectedStars;
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = 1.5;
        this.size = 40;
        this.turn = 45;
        this.image = spaceshipImg;
        this.alive = true;
        this.angle = 90;
        this.collectedStars = 0;
    }
    draw() {
        c.save();
        c.translate(this.position.x + this.size / 2, this.position.y + this.size / 2);
        c.rotate(this.angle * Math.PI / 180);
        c.translate(-(this.position.x + this.size / 2), -(this.position.y + this.size / 2));
        c.drawImage(this.image, this.position.x + this.velocity.x * Math.sin(degreeToRadian(this.angle)), this.position.y + this.velocity.y, this.size, this.size);
        // c.fillRect(this.position.x, this.position.y, this.size, this.size)
        // c.fill()
        c.restore();
        // c.rotate(10)
    }
    changeDirection(key) {
        if (key === 'w') {
            const x_direction = this.acceleration * Math.sin(degreeToRadian(this.angle));
            const y_direction = -this.acceleration * Math.sin(degreeToRadian(90 - this.angle));
            console.log({ x_direction, y_direction });
            this.velocity.x = x_direction;
            this.velocity.y = y_direction;
        }
        if (key === 's') {
            this.velocity.y = 0;
            this.velocity.x = 0;
        }
        if (key === 'a')
            this.angle -= this.turn;
        if (key === 'd')
            this.angle += this.turn;
        console.log(this.stats());
    }
    slowDown() {
        if (this.velocity.y > 0) {
            this.velocity.y -= 1;
        }
        else if (this.velocity.y < 0) {
            this.velocity.y += 1;
        }
        if (this.velocity.x > 0) {
            this.velocity.x -= 1;
        }
        else if (this.velocity.x < 0) {
            this.velocity.x += 1;
        }
    }
    update() {
        this.draw();
        if (this.position.y < trackTopBound || this.position.y + this.size > trackBotBound || this.position.x < trackLeftBound || (this.position.x + this.size) > trackRightBound) {
            this.alive = false;
            statusMessage.updateMsg('you have crashed!');
            return;
        }
        /* DETECT STAR COLLECTION */
        for (let [i, star] of listOfStars.entries()) {
            const dx = (this.position.x + this.size / 2) - (star.x + 10);
            const dy = (this.position.y + this.size / 2) - (star.y + 10);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.size / 2 + 10) {
                listOfStars = listOfStars.filter(thisStar => thisStar !== star);
                let scoreNum = +currentScore.textContent;
                currentScore.textContent = String(scoreNum + 1);
                this.collectedStars++;
                break;
            }
        }
        // middle obstacle
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
    }
    stats() {
        return ({
            x: this.position.x,
            y: this.position.y,
            x_speed: this.velocity.x,
            y_speed: this.velocity.y,
            angle_degrees: this.angle,
            acceleration: this.acceleration
        });
    }
    stop() {
        this.velocity.y = 0;
        this.velocity.x = 0;
        this.alive = false;
    }
    changeAcceleration(acceleration) {
        this.acceleration = acceleration;
    }
}
class CanvasText {
    message;
    font;
    color;
    position;
    constructor(message, position) {
        this.message = message;
        this.font = '30px Arial';
        this.color = 'cyan';
        this.position = position;
    }
    updateMsg(message) {
        this.message = message;
    }
    draw() {
        c.font = this.font;
        c.fillStyle = this.color;
        c.textAlign = 'center';
        c.fillText(this.message, this.position.x, this.position.y);
    }
}
/* CREATE NEW CAR */
const availableDirections = ['w', 's', 'd', 'a'];
const userCar = new Rocket({ x: canvas.width / 10, y: canvas.height / 4 }, { x: 0, y: 0 });
/* CREATE BOUNDARIES */
const outerBoundary = new Boundary(trackTopBound, trackRightBound, trackBotBound, trackLeftBound);
/* CREATE NEW STARS */
let listOfStars = [];
/* CANVAS TEXTS */
const statusMsgPosition = {
    x: canvas.width / 2,
    y: canvas.height / 2
};
const statusMessage = new CanvasText(`W to move, A + D to turn, S to stop`, statusMsgPosition);
/* RENDER PER FRAME */
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    /* CHECK IF ALL STARS COLLECTED */
    if (totalStars === userCar.collectedStars && gameStarted) {
        statusMessage.updateMsg('Well Done!');
        userCar.stop();
        const endTime = new Date();
        console.log(`time taken: ` + (+endTime - +startTime) / 1000);
        gameStarted = false;
    }
    /* UPDATE TIMER */
    if (gameStarted) {
        const timeTaken = Number(new Date()) - +startTime;
        timerMilliseconds.textContent = String(timeTaken % 1000).padStart(3, '0');
        timerSeconds.textContent = String(Math.floor(timeTaken / 1000)).padStart(2, '0');
    }
    outerBoundary.draw();
    statusMessage.draw();
    for (let star of listOfStars) {
        const newStar = new Star(star);
        newStar.draw();
    }
    // userCar.slowDown()
    userCar.update();
    // console.log(userCar.stats())
}
animate();
/*
----------------------------------------------------------------
EVENT LISTENERS
----------------------------------------------------------------
*/
window.addEventListener('keydown', ({ key }) => {
    if (availableDirections.includes(key)) {
        if (!gameStarted && listOfStars.length > 0) {
            gameStarted = true;
            startTime = new Date();
            totalStars = listOfStars.length;
            statusMessage.updateMsg('');
        }
        userCar.changeDirection(key);
    }
});
canvas.addEventListener('click', (e) => {
    if (!addStarMode)
        return;
    const x = e.clientX - starSize / 2;
    const y = e.clientY - scoreboard.getBoundingClientRect().bottom - starSize;
    const position = { x, y };
    addAStar(position);
});
genStarBtn.addEventListener('click', () => {
    // Offset to prevent star appearing at the boundaries
    const offset = 100;
    const maxY = trackBotBound - offset;
    const minY = trackTopBound + offset;
    const maxX = trackRightBound - offset;
    const minX = trackLeftBound + offset;
    const x = Math.floor(Math.random() * (maxX - minX + 1) + minX);
    const y = Math.floor(Math.random() * (maxY - minY + 1) + minY);
    const position = { x, y };
    addAStar(position);
});
rocketSpeed.value = String(userCar.stats().acceleration);
rocketSpeed.addEventListener('change', () => {
    if (Number(rocketSpeed.value) <= 0)
        return;
    userCar.changeAcceleration(Number(rocketSpeed.value));
});
/*
----------------------------------------------------------------
FUNCTIONS
----------------------------------------------------------------
*/
function getDOMElement(element) {
    const _element = document.querySelector(element);
    if (!_element)
        throw new Error(`${_element} not found`);
    return _element;
}
function degreeToRadian(degree) {
    return degree * Math.PI / 180;
}
function addAStar(position) {
    listOfStars.push(position);
    totalScore.textContent = String(listOfStars.length);
}
