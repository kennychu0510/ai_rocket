type Position = {
    x: number,
    y: number
}

type BlackholeType = {
  blackhole1: Position,
  blackhole2: Position
}

/* QUERY SELECTORS */
const _canvas = document.querySelector('canvas');
if (!_canvas) throw new Error('canvas not found');
const canvas = _canvas;

const _c = canvas.getContext('2d');
if (!_c) throw new Error('canvas not found');
const c = _c;

const currentScore = getDOMElement('#current-score');
const totalScore = getDOMElement('#total-score');
const genStarBtn = getDOMElement('#gen-star');
const genMeteorBtn = getDOMElement('#gen-meteor');
const genBlackholeBtn = getDOMElement('#gen-blackhole');
const rocketSpeed = getDOMElement('#rocket-speed') as HTMLInputElement;
const addStarBtn = getDOMElement('#add-star');
const resetBtn = getDOMElement('#reset');
const saveStarsBtn = getDOMElement('#save-stars');
const boundaryModeBtn = getDOMElement('#boundary-mode');
const _scoreboard = document.querySelector('#scoreboard');
if (!_scoreboard) throw new Error('score-board not found');
const scoreboard = _scoreboard as HTMLElement;

/* TIMER */
const timerMilliseconds = getDOMElement('#millisecond');
const timerSeconds = getDOMElement('#second');


/* CANVAS */
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

/* VARIABLES */
const starSize = 20;
const meteoriteSize = 50;
const blackholeSize = 80;

const boundaryOffset = 20;
const trackTopBound = boundaryOffset;
const trackBotBound = canvas.height - boundaryOffset;
const trackLeftBound = boundaryOffset;
const trackRightBound = canvas.width - boundaryOffset;


/* GAME STATES */
let addStarModeOn = false;
let gameStarted = false;
let startTime: Date;
let totalStars: number;

/* MEDIA */
const spaceshipImg = new Image();
spaceshipImg.src = './media/rocket.png';

const spaceshipFlyingImg = new Image();
spaceshipFlyingImg.src = './media/rocket_flying.png';

const meteoriteImg = new Image();
meteoriteImg.src = './media/meteorite.png';

const starImg = new Image();
starImg.src = './media/star.png';

const blackholeImg = new Image();
blackholeImg.src = './media/blackhole.png';

const spaceshipDamagedImg = new Image();
spaceshipDamagedImg.src = './media/spaceship_damaged.png';

const spaceshipDecadeImg = new Image();
spaceshipDecadeImg.src = './media/spaceship_decade.png';

const boomImg = new Image();
boomImg.src = './media/boom.png';
/* OBJECTS */
class Boundary {
  private top: number;
  private right: number;
  private bot: number;
  private left: number;
  private color: string;
  private boundaryModeOn: boolean;
  constructor(top: number, right: number, bot: number, left: number) {
    this.top = top;
    this.right = right;
    this.bot = bot;
    this.left = left;
    this.color = 'red';
    this.boundaryModeOn = true;
  }
  draw() {
    c.beginPath();
    c.strokeStyle = this.color;
    c.moveTo(this.left, this.top);
    c.lineTo(this.right, this.top);
    c.lineTo(this.right, this.bot);
    c.lineTo(this.left, this.bot);
    c.closePath();
    c.stroke();
  }

  turnOffBoundary() {
    this.color = 'green';
    this.boundaryModeOn = false;
  }

  turnOnBoundary() {
    this.color = 'red';
    this.boundaryModeOn = true;
  }

  getBoundaryMode() {
    return this.boundaryModeOn;
  }
}

class Star {
  private position: Position;
  private image: HTMLImageElement;
  private size: number;
  constructor(position: Position) {
    this.position = position;
    this.image = starImg;
    this.size = starSize;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
  }
}

class Meteorite {
  private position: Position;
  private image: HTMLImageElement;
  private size: number;
  constructor(position: Position) {
    this.position = position;
    this.image = meteoriteImg;
    this.size = meteoriteSize;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
  }
}

class Blackhole {
  private position: Position;
  private image: HTMLImageElement;
  private size: number;
  constructor(position: Position) {
    this.position = position;
    this.image = blackholeImg;
    this.size = blackholeSize;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
  }
}


class Rocket {
  private position: Position;
  private velocity: Position;
  private size: number;
  private acceleration: number;
  private image_static: HTMLImageElement;
  private image_flying: HTMLImageElement;
  private alive: boolean;
  private angle: number;
  private turn: number;
  public collectedStars: number;
  constructor(position: Position, velocity: Position) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = 1.5;
    this.size = 50;
    this.turn = 45;
    this.image_static = spaceshipImg;
    this.image_flying = spaceshipFlyingImg;
    this.alive = true;
    this.angle = 90;
    this.collectedStars = 0;
  }

  draw() {
    c.save();
    c.translate(this.position.x + this.size / 2, this.position.y + this.size / 2);
    c.rotate(this.angle * Math.PI / 180);
    c.translate(-(this.position.x + this.size / 2), -(this.position.y + this.size / 2));
    let image;
    if (this.velocity.x == 0 && this.velocity.y === 0) {
      image = this.image_static;
    } else {
      image = this.image_flying;
    }

    c.drawImage(image, this.position.x + this.velocity.x * Math.sin(degreeToRadian(this.angle)), this.position.y + this.velocity.y, this.size, this.size);
    // c.fillRect(this.position.x, this.position.y, this.size, this.size)
    // c.fill()
    c.restore();
    // c.rotate(10)
  }

  changeDirection(key: string) {
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
    if (key === 'a') this.angle -= this.turn;
    if (key === 'd') this.angle += this.turn;
    console.log(this.stats());
  }

  slowDown() {
    if (this.velocity.y > 0) {
      this.velocity.y -= 1;
    } else if (this.velocity.y < 0) {
      this.velocity.y += 1;
    }
    if (this.velocity.x > 0) {
      this.velocity.x -= 1;
    } else if (this.velocity.x < 0) {
      this.velocity.x += 1;
    }
  }

  update() {
    this.draw();
    if (!this.alive) {
      return;
    }
    if (outerBoundary.getBoundaryMode()) {
      if (this.position.y < trackTopBound || this.position.y + this.size > trackBotBound || this.position.x < trackLeftBound || (this.position.x + this.size) > trackRightBound) {
        this.alive = false;
        gameStarted = false;
        statusMessage.updateMsg('you have crashed!');
        return;
      }
    } else {
      if (this.position.y < trackTopBound) {
        this.position.y = trackBotBound - this.size;
      }
      if (this.position.y + this.size > trackBotBound) {
        this.position.y = trackTopBound;
      }
      if (this.position.x < trackLeftBound) {
        this.position.x = trackRightBound - this.size;
      }
      if (this.position.x + this.size > trackRightBound) {
        this.position.x = trackLeftBound;
      }
    }

    /* DETECT STARS COLLECTED */
    for (const star of listOfStars) {
      const dx = (this.position.x + this.size / 2) - (star.x + 10);
      const dy = (this.position.y + this.size / 2) - (star.y + 10);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size / 2 + 10) {
        listOfStars = listOfStars.filter((thisStar) => thisStar !== star);
        const scoreNum = +currentScore.textContent!;
                currentScore.textContent! = String(scoreNum + 1);
                this.collectedStars++;
                break;
      }
    }

    /* METEORITE COLLISION DECTION */
    for (const meteorite of listOfMeteorite) {
      const dx = (this.position.x + this.size /2 ) - (meteorite.x + meteoriteSize/2);
      const dy = (this.position.y + this.size /2 ) - (meteorite.y + meteoriteSize/2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.size / 2 + meteoriteSize/2) {
        this.velocity.x = -this.velocity.x;
        this.velocity.y = -this.velocity.y;
        this.image_static = spaceshipDecadeImg;
        this.image_flying = spaceshipDecadeImg;
        if (this.acceleration == 0.65) {
          this.image_static = boomImg;
          this.image_flying = boomImg;
          this.alive = false;
          break;
        }
        if (this.acceleration == 0.75) {
          this.acceleration = 0.65;
          spaceshipDamagedImg;
          this.image_static = spaceshipDamagedImg;
          this.image_flying = spaceshipDamagedImg;
          break;
        }
        this.acceleration = 0.75;
        this.image_static = spaceshipDecadeImg;
        this.image_flying = spaceshipDecadeImg;
        break;
      }
    }


    /* BLACKHOLE TELEPORTING */
    for (const blackholePair of listOfBlackhole) {
      const dx1 = (this.position.x + this.size /2 ) - (blackholePair.blackhole1.x + blackholeSize /2);
      const dy1 = (this.position.y + this.size /2 ) - (blackholePair.blackhole1.y + blackholeSize /2);
      const dx2 = (this.position.x + this.size /2 ) - (blackholePair.blackhole2.x + blackholeSize /2);
      const dy2 = (this.position.y + this.size /2 ) - (blackholePair.blackhole2.y + blackholeSize /2);
      const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const range = this.size /2 + blackholeSize / 2;

      if (distance1 <= range/2) {
        // if (dx1 < range && dx1 > 0) {
        //   this.position.x = blackholePair.blackhole2.x -dddda range
        // } else {
        //   this.position.x = blackholePair.blackhole2.x + range
        // }
        // if (dy1 < range && dy1 > 0) {
        //   this.position.y = blackholePair.blackhole2.y - range
        // } else {
        //   this.position.y = blackholePair.blackhole2.y + range
        // }

        this.position.x = blackholePair.blackhole2.x - dx1 * 2;
        this.position.y = blackholePair.blackhole2.y - dy1 * 2;
      } else if (distance2 <= range/2) {
        // if (dx2 < range && dx2 > 0) {
        //   this.position.x = blackholePair.blackhole1.x - range
        // } else  {
        //   this.position.x = blackholePair.blackhole1.x + range
        // }
        // if (dy2 < range && dy2 > 0) {
        //   this.position.y = blackholePair.blackhole1.y - range
        // } else  {
        //   this.position.y = blackholePair.blackhole1.y + range
        // }
        this.position.x = blackholePair.blackhole1.x - dx2 * 2;
        this.position.y = blackholePair.blackhole1.y - dy2 * 2;
      }
    }


    /* UPDATE ROCKET LOCATION IN NEXT FRAME TO MIMIC MOVEMENT */
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
      acceleration: this.acceleration,
    });
  }

  stop() {
    this.velocity.y = 0;
    this.velocity.x = 0;
    this.alive = false;
  }
  changeAcceleration(acceleration: number) {
    this.acceleration = acceleration;
  }
}

class CanvasText {
  private message: string;
  private font: string;
  private color: string;
  private position: Position;
  constructor(message: string, position: Position) {
    this.message = message;
    this.font = '30px Arial';
    this.color = 'yellow';
    this.position = position;
  }

  updateMsg(message: string) {
    this.message = message;
  }

  draw() {
    c.font = this.font;
    c.fillStyle = this.color;
    c.textAlign = 'center';
    c.fillText(this.message, this.position.x, this.position.y);
  }
}

/* CREATE NEW ROCKET */
const availableDirections = ['w', 's', 'd', 'a'];
const userRocket = new Rocket(
  { x: canvas.width / 10, y: canvas.height / 4 },
  { x: 0, y: 0 },
);

/* CREATE BOUNDARIES */
const outerBoundary = new Boundary(trackTopBound, trackRightBound, trackBotBound, trackLeftBound);

/* CREATE NEW STARS */
let listOfStars: Position[] = [];

/* CREATE NEW METEORITE */
const listOfMeteorite: Position[] = [];

/* CREATE NEW PAIRS OF BLACKHOLE */
const listOfBlackhole: BlackholeType[] = [];

/* CANVAS TEXTS */
const statusMsgPosition = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};
const statusMessage = new CanvasText(`W to move, A + D to turn, S to stop`, statusMsgPosition);
const gameInstructions = new CanvasText(`Add stars to start the game`, { x: canvas.width / 2, y: canvas.height * 2 / 3 });

/* RENDER CANVAS */
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  /* CHECK IF ALL STARS COLLECTED */
  if (totalStars === userRocket.collectedStars && gameStarted) {
    statusMessage.updateMsg('Well Done!');
    userRocket.stop();
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
  gameInstructions.draw();

  for (const star of listOfStars) {
    const newStar = new Star(star);
    newStar.draw();
  }

  for (const meteorite of listOfMeteorite) {
    const newMeteorite = new Meteorite(meteorite);
    newMeteorite.draw();
  }

  for (const blackholePair of listOfBlackhole) {
    const blackhole1 = blackholePair.blackhole1;
    const blackhole2 = blackholePair.blackhole2;

    const newBlackhole1 = new Blackhole(blackhole1);
    const newBlackhole2 = new Blackhole(blackhole2);
    newBlackhole1.draw();
    newBlackhole2.draw();
  }

  // userCar.slowDown()

  userRocket.update();
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
      gameInstructions.updateMsg('');
    }
    userRocket.changeDirection(key);
  }
});

addStarBtn.addEventListener('click', () => {
  addStarModeOn = !addStarModeOn;
  if (addStarModeOn) {
    addStarBtn.textContent = 'Done';
  } else {
    addStarBtn.textContent = 'Add Star';
  }
});

resetBtn.addEventListener('click', () => {
  location.reload();
});

canvas.addEventListener('click', (e) => {
  if (!addStarModeOn) return;
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

genMeteorBtn.addEventListener('click', () => {
  // Offset to prevent star appearing at the boundaries
  const offset = 100;
  const maxY = trackBotBound - offset;
  const minY = trackTopBound + offset;
  const maxX = trackRightBound - offset;
  const minX = trackLeftBound + offset;
  const x = Math.floor(Math.random() * (maxX - minX + 1) + minX);
  const y = Math.floor(Math.random() * (maxY - minY + 1) + minY);
  const position = { x, y };
  addAMeteorite(position);
});

genBlackholeBtn.addEventListener('click', () => {
  // Offset to prevent star appearing at the boundaries
  const offset = 100;
  const maxY = trackBotBound - offset;
  const minY = trackTopBound + offset;
  const maxX = trackRightBound - offset;
  const minX = trackLeftBound + offset;
  const x1 = Math.floor(Math.random() * (maxX - minX + 1) + minX);
  const y1 = Math.floor(Math.random() * (maxY - minY + 1) + minY);
  const x2 = Math.floor(Math.random() * (maxX - minX + 1) + minX);
  const y2 = Math.floor(Math.random() * (maxY - minY + 1) + minY);
  const position1 = { x: x1, y: y1 };
  const position2 = { x: x2, y: y2 };
  const blackholePair: BlackholeType = {
    blackhole1: position1,
    blackhole2: position2,
  };
  addABlackholePair(blackholePair);
});
// UPDATE ROCKET SPEED DISPLAY VALUE
rocketSpeed.value = String(userRocket.stats().acceleration);

rocketSpeed.addEventListener('change', () => {
  if (Number(rocketSpeed.value) <= 0) return;
  userRocket.changeAcceleration(Number(rocketSpeed.value));
});

boundaryModeBtn.addEventListener('click', () => {
  if (outerBoundary.getBoundaryMode()) {
    outerBoundary.turnOffBoundary();
    boundaryModeBtn.textContent = 'Turn On Boundary';
  } else {
    outerBoundary.turnOnBoundary();
    boundaryModeBtn.textContent = 'Turn Off Boundary';
  }
});

saveStarsBtn.addEventListener('click', () => {
  const starMap = {
    count: listOfStars.length,
    coordinates: JSON.stringify(listOfStars),
  };
  fetch('/save-stars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      starMap,
    }),
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      console.log(json);
    });
});
/*
----------------------------------------------------------------
FUNCTIONS
----------------------------------------------------------------
*/
function getDOMElement(element: string) {
  const _element = document.querySelector(element);
  if (!_element) throw new Error(`${_element} not found`);
  return _element;
}

function degreeToRadian(degree: number) {
  return degree * Math.PI / 180;
}

function addAStar(position: Position) {
  listOfStars.push(position);
  totalScore.textContent = String(listOfStars.length);
}

function addAMeteorite(position: Position) {
  listOfMeteorite.push(position);
}

function addABlackholePair(blackholePair: BlackholeType) {
  listOfBlackhole.push(blackholePair);
}

