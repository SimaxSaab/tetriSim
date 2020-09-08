let main = document.querySelector('.main');
const scoreE = document.getElementById('score');
const levelE = document.getElementById('level');
const nextE = document.getElementById('next');
const start = document.getElementById('start');
const pause = document.getElementById('pause');
const left = document.getElementById('left');
const rotation = document.getElementById('rotation');
const right = document.getElementById('right');
const down = document.getElementById('down');

let playfield = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

let mainTimer, fillTimer, timeForAction, borderCount = 0;
let paused = false, stoped = false;
let currentLevel = 1;
let possibleLevels = {
  1: {
    speed: 600,
    scorePerLine: 10,
    nextLevelScore: 500
  },
  2: {
    speed: 550,
    scorePerLine: 15,
    nextLevelScore: 1000
  },
  3: {
    speed: 500,
    scorePerLine: 20,
    nextLevelScore: 1500
  },
  4: {
    speed: 450,
    scorePerLine: 30,
    nextLevelScore: 2000
  },
  5: {
    speed: 400,
    scorePerLine: 50,
    nextLevelScore: Infinity
  }
};
let score = 0;
// let active = {
//   x: 3,
//   y: -1,
//   shape: [
//     [1, 1, 1],
//     [0, 1, 0],
//     [0, 0, 0]
//   ]
// };
let figures = {
  O: [
    [1, 1],
    [1, 1]
  ],
  I: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
}
let active = getNewLetter();
let next = getNewLetter();

function draw() {
  let mainInnerHTML = '';
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        mainInnerHTML += '<div class="cell movingCell"></div>';
      } else if (playfield[y][x] === 2) {
        mainInnerHTML += '<div class="cell fixedCell"></div>';
      } else if (playfield[y][x] === 3) {
        mainInnerHTML += '<div class="cell filledCell"></div>';
      } else {
        mainInnerHTML += '<div class="cell"></div>';
      }
    }
  }
  main.innerHTML = mainInnerHTML;
}

function drawNext() {
  let nextInnerHTML = '';
  for (let y = 0; y < next.shape.length; y++) {
    for (let x = 0; x < next.shape[y].length; x++) {
      if (next.shape[y][x] === 1) {
        nextInnerHTML += '<div class="cell movingCell"></div>';
      } else {
        nextInnerHTML += '<div class="cell"></div>';
      }
    }
    nextInnerHTML += '<br>';
  }
  nextE.innerHTML = nextInnerHTML;
}

function removePrevActive() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 0;
      }
    }
  }
}

function addActive() {
  removePrevActive();
  for (let y = 0; y < active.shape.length; y++) {
    for (let x = 0; x < active.shape[y].length; x++) {
      // debugger;
      if (active.shape[y][x]) {
        playfield[active.y + y][active.x + x] = active.shape[y][x];
      }
    }
  }
}

function moveTetDown() {
  if(!paused){
    active.y += 1;
    if (hasColisions()) {
      active.y -= 1;
      fixTet();
      main.style.borderTop = "10px solid orangered";
      borderCount = 1;
      active = next;
      if(hasColisions()) {
        reset();
      }
      next = getNewLetter();
    }
  }
}

function fallTetDown() {
  for (let y = active.y; y < playfield.length; y++) {
    active.y += 1;
    if (hasColisions()) {
      // alert('');
      active.y -= 1;
      break;
    }    
  }
}

function getNewLetter() {
  const possibleLetters = 'IOLJTSZ';
  const rand = Math.floor(Math.random() * 7);
  const newLetter =  figures[possibleLetters[rand]];

  return {
    x:Math.floor((10 - newLetter[0].length) / 2),
    y:0,
    shape: newLetter
  }
}

function reset() {
  stoped = true;
  pause.disabled = true;
  clearTimeout(mainTimer);
  y = playfield.length - 1;
  x = 9;
  fillField();
}

function fillField() {
  playfield[y][x] = 3;
  draw();
  if(y === 0 && x === 0) {clearTimeout(fillTimer); start.disabled = false;
    start.focus(); return;}
  if(x === 0) {
    x = 10;
    y--;
  } 
  x--;
  fillTimer = setTimeout(fillField, 20);
}

function hasColisions() {
  for (let y = 0; y < active.shape.length; y++) {
    for (let x = 0; x < active.shape[y].length; x++) {
      if (active.shape[y][x] && (playfield[active.y + y] === undefined || playfield[active.y + y][active.x + x] === undefined || playfield[active.y + y][active.x + x] === 2)) {
        return true;
      }
    }
  }
  return false;
}

function rotate() {
  const prevState = active.shape;

  active.shape = active.shape.map((val, index) => active.shape.map((row) => row[index]).reverse());

  if (hasColisions()) {
    active.shape = prevState;
  }
}

function removeLine() {
  let filledLines = 0;
  for (let y = 0; y < playfield.length; y++) {
    let canRemoveLine = true;
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] !== 2) {
        canRemoveLine = false;
        break;
      }
    }
    if (canRemoveLine) {
      playfield.splice(y, 1);
      playfield.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      filledLines += 1;
    }
  }

  switch (filledLines) {
    case 1:
      score += possibleLevels[currentLevel].scorePerLine;
      break;
    case 2:
      score += possibleLevels[currentLevel].scorePerLine * 3;
      break;
    case 3:
      score += possibleLevels[currentLevel].scorePerLine * 6;
      break;
    case 4:
      score += possibleLevels[currentLevel].scorePerLine * 12;
      break;
  }
  scoreE.innerHTML = score;

  if(score >= possibleLevels[currentLevel].nextLevelScore) {
    currentLevel++;
    levelE.innerHTML = currentLevel;
  }
}

function fixTet() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 2;
      }
    }
  }
  removeLine();
}

document.onkeydown = function (e) {
  if(!paused && !stoped) { 
    if (e.keyCode === 37) {  
      actionLeft();
      loopDraw();
    } else if (e.keyCode === 39) {
      actionRight();
      loopDraw();
    } else if (e.keyCode === 40) {
      fall();
    } else if (e.keyCode === 38) {
      rotate();
      loopDraw();
    }    
  }
}

function loopDraw() {
  addActive();
  draw();
  drawNext();
}

// left.addEventListener('click', actionLeft);
rotation.addEventListener('click', rotate);
right.addEventListener('click', actionRight);
down.addEventListener('click', fall);
left.addEventListener('touchstart', () => handleStart(actionLeft));
left.addEventListener('touchend', handleEnd);

function handleStart(action) {
  action();
  timeForAction = setTimeout(function() {handleStart(action)}, 5);
}

function handleEnd() {
  clearTimeout(timeForAction);
}
// rotation.addEventListener('click', rotate);
// right.addEventListener('click', actionRight);
// down.addEventListener('click', fall);

function fall() {
  if(!paused) {
    fallTetDown();
    loopDraw();
  }
}

function actionLeft() {
  active.x -= 1;
  if (hasColisions()) active.x += 1;
}

function actionRight() {
  active.x += 1;
  if (hasColisions()) active.x -= 1;
}

pause.addEventListener('click', (e) => {
  if(e.target.innerHTML === 'P<br>a<br>u<br>s<br>e') {
    e.target.innerHTML = 'P<br>l<br>a<br>y';
    clearTimeout(mainTimer);
  } else {
    e.target.innerHTML = 'P<br>a<br>u<br>s<br>e';
    setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
  paused = !paused;
});

start.addEventListener('click', (e) => {
  e.target.disabled = true;
  pause.disabled = false;
  pause.focus();
  stoped = false;
  playfield = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  // draw();
  setTimeout(startGame, possibleLevels[currentLevel].speed);
})

scoreE.innerHTML = score;
levelE.innerHTML = currentLevel;

draw();
start.focus();
pause.disabled=true;

function startGame() {
  moveTetDown();
  if(!stoped) {
    loopDraw();
    if(borderCount === 2) {
      main.style.borderTop = "10px solid silver";
      borderCount = 0;
    }
    if(borderCount === 1) borderCount++;
    mainTimer = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
}
