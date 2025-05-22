const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreSpan = document.getElementById('score');
const powerupSpan = document.getElementById('powerup');

// ゲーム設定
const GROUND_Y = 250;
const PLAYER_SIZE = 32;
const GRAVITY = 0.9;
const JUMP_POWER = -14;
const OBSTACLE_WIDTH = 24;
const OBSTACLE_HEIGHT = 40;
const OBSTACLE_GAP = 240; // 間隔を広げる
const OBSTACLE_SPEED = 4; // スピードを少し遅く
const POWERUP_SIZE = 24;
const MAX_JUMP = 2; // 2段ジャンプ

let player, obstacles, powerups, score, isRunning, jumpCount, powerupActive, powerupTimer, jumpRemain, gameOver;

function resetGame() {
  player = { x: 60, y: GROUND_Y, vy: 0 };
  obstacles = [];
  powerups = [];
  score = 0;
  jumpCount = 0;
  jumpRemain = MAX_JUMP;
  powerupActive = false;
  powerupTimer = 0;
  isRunning = false;
  gameOver = false;
  scoreSpan.textContent = 'スコア: 0';
  powerupSpan.classList.add('hidden');
  startBtn.textContent = 'スタート';
  startBtn.classList.remove('hidden');
}

function spawnObstacle() {
  const height = OBSTACLE_HEIGHT + Math.random() * 30;
  obstacles.push({ x: canvas.width, y: GROUND_Y + PLAYER_SIZE - height, w: OBSTACLE_WIDTH, h: height });
}

function spawnPowerup() {
  powerups.push({ x: canvas.width, y: GROUND_Y - 40, size: POWERUP_SIZE });
}

function update() {
  // プレイヤーの物理
  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y > GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    jumpRemain = MAX_JUMP;
  }

  // 障害物の移動
  for (let obs of obstacles) {
    obs.x -= powerupActive ? OBSTACLE_SPEED + 3 : OBSTACLE_SPEED;
  }
  if (obstacles.length === 0 || obstacles[obstacles.length-1].x < canvas.width - OBSTACLE_GAP) {
    spawnObstacle();
    if (Math.random() < 0.25) spawnPowerup();
  }
  obstacles = obstacles.filter(obs => obs.x + obs.w > 0);

  // パワーアップの移動
  for (let p of powerups) {
    p.x -= powerupActive ? OBSTACLE_SPEED + 3 : OBSTACLE_SPEED;
  }
  powerups = powerups.filter(p => p.x + p.size > 0);

  // 衝突判定（当たり判定を少し緩和）
  for (let obs of obstacles) {
    if (
      player.x + 6 < obs.x + obs.w &&
      player.x + PLAYER_SIZE - 6 > obs.x &&
      player.y + PLAYER_SIZE - 6 > obs.y &&
      player.y + 6 < obs.y + obs.h
    ) {
      isRunning = false;
      gameOver = true;
      startBtn.textContent = 'リトライ';
      startBtn.classList.remove('hidden');
    }
  }
  for (let i = 0; i < powerups.length; i++) {
    const p = powerups[i];
    if (
      player.x < p.x + p.size &&
      player.x + PLAYER_SIZE > p.x &&
      player.y + PLAYER_SIZE > p.y &&
      player.y < p.y + p.size
    ) {
      powerupActive = true;
      powerupTimer = 180;
      powerupSpan.classList.remove('hidden');
      powerups.splice(i, 1);
      break;
    }
  }
  if (powerupActive) {
    powerupTimer--;
    if (powerupTimer <= 0) {
      powerupActive = false;
      powerupSpan.classList.add('hidden');
    }
  }

  // スコア加算
  score++;
  scoreSpan.textContent = `スコア: ${score}`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 地面
  ctx.fillStyle = '#bcdff1';
  ctx.fillRect(0, GROUND_Y + PLAYER_SIZE, canvas.width, 8);
  // プレイヤー
  ctx.save();
  ctx.fillStyle = powerupActive ? '#ff9800' : '#4f8cff';
  ctx.shadowColor = '#2563eb';
  ctx.shadowBlur = 8;
  ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
  ctx.restore();
  // 障害物
  ctx.fillStyle = '#6c757d';
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
  }
  // パワーアップ
  ctx.fillStyle = '#ffeb3b';
  for (let p of powerups) {
    ctx.beginPath();
    ctx.arc(p.x + p.size/2, p.y + p.size/2, p.size/2, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#ffa000';
    ctx.stroke();
  }
  // ゲームオーバー表示
  if (gameOver) {
    ctx.save();
    ctx.font = 'bold 32px Segoe UI, Meiryo, sans-serif';
    ctx.fillStyle = '#ff5252';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '20px Segoe UI, Meiryo, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('リトライボタンで再挑戦', canvas.width/2, canvas.height/2 + 20);
    ctx.restore();
  }
}

function gameLoop() {
  if (!isRunning) return;
  update();
  draw();
  if (isRunning) requestAnimationFrame(gameLoop);
}

function jump() {
  if (jumpRemain > 0 && !gameOver) {
    player.vy = JUMP_POWER;
    jumpRemain--;
    jumpCount++;
  }
}

startBtn.onclick = () => {
  resetGame();
  isRunning = true;
  gameOver = false;
  startBtn.classList.add('hidden');
  gameLoop();
};
document.addEventListener('keydown', e => {
  if ((e.code === 'Space' || e.key === 'z') && !gameOver) {
    jump();
  }
});
canvas.addEventListener('mousedown', () => {
  if (!gameOver) jump();
});

// 初期化
resetGame();
draw();
