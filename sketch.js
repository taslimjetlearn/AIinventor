// ====== SOUNDQUEST: ECHO REALM ======

let player = {
  x: 100,
  y: 300,
  size: 40,
  vy: 0,
  jumping: false,
  hidden: false
};

let gravity = 0.8;
let platforms = [];
let obstacles = [];
let enemy;

let label = "loading...";
let confidence = 0;

let classifier;

function preload() {
  classifier = ml5.soundClassifier("https://teachablemachine.withgoogle.com/models/qTdqeFGL3//model.json");
}

function setup() {
  createCanvas(800, 450);

  // Platforms
  platforms = [
    { x: 200, y: 300, w: 100 },
    { x: 400, y: 250, w: 120 },
    { x: 600, y: 200, w: 100 }
  ];

  // Obstacles
  obstacles = [
    { x: 350, y: 310, w: 40, h: 40 }
  ];

  // Enemy
  enemy = { x: 650, y: 310, size: 40 };

  classifier.classify(gotResult);
}

function draw() {
  drawBackground();

  // ===== PLAYER PHYSICS =====
  player.vy += gravity;
  player.y += player.vy;

  if (player.y > 300) {
    player.y = 300;
    player.vy = 0;
    player.jumping = false;
  }

  // ===== SOUND LOGIC =====
  if (confidence > 0.8) {
    if (label === "clap") jump();
    if (label === "talking") player.x += 2;
    if (label === "singing") magicalEffect();
    if (label === "silence") player.hidden = true;
    else player.hidden = false;
  }

  // ===== DRAW PLAYER =====
  drawPlayer();

  // ===== DRAW PLATFORMS =====
  drawPlatforms();

  // ===== OBSTACLES =====
  drawObstacles();

  // ===== ENEMY =====
  drawEnemy();

  // ===== UI =====
  drawUI();
}

// ===== BACKGROUND =====
function drawBackground() {
  let c1 = color(20, 20, 50);
  let c2 = color(100, 0, 150);
  let gradient = lerpColor(c1, c2, sin(frameCount * 0.01));

  background(gradient);

  // Floating particles
  for (let i = 0; i < 50; i++) {
    fill(255, 255, 255, 50);
    ellipse(random(width), random(height), 2);
  }
}

// ===== PLAYER =====
function drawPlayer() {
  push();

  if (player.hidden) {
    fill(100, 100, 100, 120);
  } else {
    fill(0, 255, 200);
  }

  // Glow effect
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(0, 255, 200);

  ellipse(player.x, player.y, player.size);

  pop();
}

function jump() {
  if (!player.jumping) {
    player.vy = -12;
    player.jumping = true;
  }
}

// ===== PLATFORMS =====
function drawPlatforms() {
  for (let p of platforms) {
    fill(150, 0, 255);
    rect(p.x, p.y, p.w, 10);
  }
}

// ===== OBSTACLES =====
function drawObstacles() {
  fill(255, 80, 80);

  for (let o of obstacles) {
    rect(o.x, o.y, o.w, o.h);

    // collision
    if (
      player.x > o.x &&
      player.x < o.x + o.w &&
      player.y > o.y
    ) {
      resetGame();
    }
  }
}

// ===== ENEMY =====
function drawEnemy() {
  fill(255, 0, 200);
  ellipse(enemy.x, enemy.y, enemy.size);

  // Detect player if not silent
  if (!player.hidden && dist(player.x, player.y, enemy.x, enemy.y) < 80) {
    resetGame();
  }
}

// ===== MAGIC EFFECT =====
function magicalEffect() {
  for (let i = 0; i < 10; i++) {
    fill(random(255), random(255), random(255));
    ellipse(random(width), random(height), 5);
  }
}

// ===== UI =====
function drawUI() {
  fill(255);
  textSize(18);
  text("Sound: " + label, 20, 30);
  text("Confidence: " + nf(confidence, 1, 2), 20, 55);

  text("👏 Jump | 🎤 Move | 🎶 Magic | 🤫 Hide", 20, height - 20);
}

// ===== RESET =====
function resetGame() {
  player.x = 100;
  player.y = 300;
}

// ===== AI RESULT =====
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  label = results[0].label;
  confidence = results[0].confidence;
}