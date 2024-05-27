const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

const shipImg = new Image();
shipImg.src = 'spaceship.png';

const monsterImgs = [];
for (let i = 0; i < 4; i++) {
    const img = new Image();
    img.src = `monster${i + 1}.png`;
    monsterImgs.push(img);
}

const ship = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 40,
    width: 40,
    height: 40,
    dx: 0,
    dy: 0,
    speed: 4
};

const bullets = [];
const enemyBullets = [];
const enemies = [];
let score = 0;
let lives = 3;
let shootingInterval = 1500; // Tijd in milliseconden tussen de schoten van de monsters
let isGameOver = false;

function drawShip() {
    ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
}

function drawBullets() {
    ctx.fillStyle = 'red';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = 'yellow';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(monsterImgs[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawLives() {
    livesElement.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeImg = new Image();
        lifeImg.src = 'spaceship.png';
        lifeImg.style.width = '40px';
        lifeImg.style.height = '40px';
        livesElement.appendChild(lifeImg);
    }
}

function moveShip() {
    ship.x += ship.dx;
    ship.y += ship.dy;

    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
    if (ship.y < 0) ship.y = 0;
    if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.dy;
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

function moveEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.y += bullet.dy;
        if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
    });
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.dy;
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
        if (enemy.canShoot && (enemy.lastShot === undefined || Date.now() - enemy.lastShot > shootingInterval)) {
            enemy.lastShot = Date.now();
            enemyBullets.push({
                x: enemy.x + enemy.width / 2 - 2,
                y: enemy.y + enemy.height,
                width: 4,
                height: 10,
                dy: 4
            });
        }
    });
}

function spawnEnemy() {
    const enemyWidth = 40;
    const enemyHeight = 40;
    const enemyType = Math.floor(Math.random() * 4);
    const x = Math.random() * (canvas.width - enemyWidth);
    enemies.push({ 
        x, 
        y: -enemyHeight, 
        width: enemyWidth, 
        height: enemyHeight, 
        dy: 2, 
        type: enemyType,
        canShoot: Math.random() < 0.7 // 50% kans dat een monster kan schieten
    });
}

function loseLife() {
    lives--;
    drawLives();
    if (lives === 0) {
        gameOver();
    }
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.textContent = `Score: ${score}`;
    gameOverElement.style.display = 'block';
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 20;
                scoreElement.innerHTML = `Score: ${score}`;
            }
        });
    });

    enemyBullets.forEach((bullet, bulletIndex) => {
        if (
            ship.x < bullet.x + bullet.width &&
            ship.x + ship.width > bullet.x &&
            ship.y < bullet.y + bullet.height &&
            ship.y + ship.height > bullet.y
        ) {
            enemyBullets.splice(bulletIndex, 1);
            loseLife();
        }
    });

    enemies.forEach((enemy, enemyIndex) => {
        if (
            ship.x < enemy.x + enemy.width &&
            ship.x + ship.width > enemy.x &&
            ship.y < enemy.y + enemy.height &&
            ship.y + ship.height > enemy.y
        ) {
            enemies.splice(enemyIndex, 1);
            loseLife();
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawBullets();
    drawEnemies();
    drawLives();
    drawEnemyBullets();
    moveShip();
    moveBullets();
    moveEnemyBullets();
    moveEnemies();
    checkCollisions();
}

function update() {
    if (!isGameOver) {
        draw();
        requestAnimationFrame(update);
    }
}

document.addEventListener('keydown', event => {
    if (isGameOver) return;
    switch (event.key) {
        case 'w':
            ship.dy = -ship.speed;
            break;
        case 's':
            ship.dy = ship.speed;
            break;
        case 'a':
            ship.dx = -ship.speed;
            break;
        case 'd':
            ship.dx = ship.speed;
            break;
        case ' ':
            bullets.push({
                x: ship.x + ship.width / 2 - 2,
                y: ship.y,
                width: 4,
                height: 10,
                dy: 6
            });
            break;
    }
});

document.addEventListener('keyup', event => {
    switch (event.key) {
        case 'w':
        case 's':
            ship.dy = 0;
            break;
        case 'a':
        case 'd':
            ship.dx = 0;
            break;
    }
});

restartButton.addEventListener('click', () => {
    gameOverElement.style.display = 'none';
    score = 0;
    lives = 3;
    bullets.length = 0;
    enemyBullets.length = 0;
    enemies.length = 0;
    drawLives();
    scoreElement.innerHTML = `Score: ${score}`;
    isGameOver = false;
    update();
});

setInterval(spawnEnemy, 1000);
update();
