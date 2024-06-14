const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const saveDataButton = document.getElementById('saveDataButton')
const shipImg = new Image();
shipImg.src = 'IMG/spaceship.png';
const monsterImgs = [];
for (let i = 0; i < 4; i++) {
    const img = new Image();
    img.src = `IMG/monster${i + 1}.png`;
    monsterImgs.push(img);
}
const powerUpImgs = {
    heart: 'IMG/heart.png',
    powerup: 'IMG/powerup.png',
    ammo: 'IMG/ammo.png'
};
const bossImg = new Image();
bossImg.src = 'IMG/boss.png';
const ship = {
    x: canvas.width / 2 - 40, 
    y: canvas.height - 80, 
    width: 60, 
    height: 60, 
    dx: 0,
    dy: 0,
    speed: 4
};
const bullets = [];
const enemyBullets = [];
const enemies = [];
const powerUps = [];
let score = 0;
let lives = 3;
let shootingInterval = 1500;
let isGameOver = false;
let ammoPowerUpActive = false;
let boss = null;
function drawShip() {
    ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
}
function drawBullets() {
    ctx.fillStyle = 'blue';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}
function drawEnemyBullets() {
    ctx.fillStyle = 'red';
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
        lifeImg.src = 'IMG/heart.png';
        livesElement.appendChild(lifeImg);
    }
}
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        const img = new Image();
        img.src = powerUpImgs[powerUp.type];
        ctx.drawImage(img, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
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
        if (bullet.y < 0) bullets.splice(index,     1);
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
function movePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.dy;
        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
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
    powerUps.forEach((powerUp, index) => {
        if (
            ship.x < powerUp.x + powerUp.width &&
            ship.x + ship.width > powerUp.x &&
            ship.y < powerUp.y + powerUp.height &&
            ship.y + ship.height > powerUp.y
        ) {
            applyPowerUpEffect(powerUp.type);
            powerUps.splice(index, 1);
        }
    });
    if (boss) {
        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y
            ) {
                bullets.splice(bulletIndex, 1);
                boss.hp -= 1;
                if (boss.hp <= 0) {
                    score += 100;
                    scoreElement.innerHTML = `Score: ${score}`;
                    boss = false;
                }
            }
        });
    }
}
const POWER_UP_TYPES = {
    HEART: 'heart',
    SCORE_MULTIPLIER: 'powerup',
    DUBBLE_AMMO: 'ammo'         
};
function applyPowerUpEffect(type) {
    switch (type) {
        case POWER_UP_TYPES.HEART:
            lives++;
            drawLives();
            break;
        case POWER_UP_TYPES.SCORE_MULTIPLIER:
            const originalScore = score;
            score *= 2;
            scoreElement.innerHTML = `Score: ${score}`;
            setTimeout(() => {
                score = originalScore;
                scoreElement.innerHTML = `Score: ${score}`;
            }, 5000);
            break;
        case POWER_UP_TYPES.DUBBLE_AMMO:
            ammoPowerUpActive = true;
            setTimeout(() => {
                ammoPowerUpActive = false;
            }, 10000); 
            break;
        default:
            break;
    }
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
        dy: 2 + score / 1000, 
        type: enemyType,
        canShoot: Math.random() < 0.7
    });
}
function spawnPowerUp() {
    if (powerUps.length < 2) {
        const powerUpWidth = 40;
        const powerUpHeight = 40;
        const randomNum = Math.random();
        let type;
        if (randomNum < 0.33) {
            type = POWER_UP_TYPES.HEART;
        } else if (randomNum < 0.66) {
            type = POWER_UP_TYPES.SCORE_MULTIPLIER;
        } else {
            type = POWER_UP_TYPES.DUBBLE_AMMO;
        }
        const x = Math.random() * (canvas.width - powerUpWidth);
        powerUps.push({
            x,
            y: -powerUpHeight,
            width: powerUpWidth,
            height: powerUpHeight,
            type,
            dy: 2
        });
    }
}
function spawnBoss() {
    const bossWidth = 120;
    const bossHeight = 120;
    const x = Math.random() * (canvas.width - bossWidth);
    boss = {
        x,
        y: -bossHeight,
        width: bossWidth,
        height: bossHeight,
        dy: 1,
        hp: 25,
        lastShot: undefined
    };
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawBullets();
    drawEnemies();
    drawLives();
    drawEnemyBullets();
    drawPowerUps(); 
    moveShip();
    moveBullets();
    moveEnemyBullets();
    moveEnemies();
    movePowerUps();
    checkCollisions();
    if (boss) {
        ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height);
    }
}
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ' ': false,
    W: false,
    A: false,
    S: false,
    D: false

};
document.addEventListener('keydown', event => {
    if (isGameOver) return;
    if (event.key in keys) {
        keys[event.key] = true;
    }
});
document.addEventListener('keyup', event => {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});
let lastShotTime = 0;
const shotDelay = 200;
function update() {
    if (!isGameOver) {
        if (boss) {
            boss.y += boss.dy;
            if (boss.lastShot === undefined || Date.now() - boss.lastShot > shootingInterval) {
                boss.lastShot = Date.now();
                enemyBullets.push({
                    x: boss.x + boss.width / 2 - 2,
                    y: boss.y + boss.height,
                    width: 4,
                    height: 10,
                    dy: 4
                });
            }
        }
        ship.dx = 0;
        ship.dy = 0;
        if (keys.w) ship.dy = -ship.speed;
        if (keys.s) ship.dy = ship.speed;
        if (keys.a) ship.dx = -ship.speed;
        if (keys.d) ship.dx = ship.speed;
        if (keys.W) ship.dy = -ship.speed;
        if (keys.S) ship.dy = ship.speed;
        if (keys.A) ship.dx = -ship.speed;
        if (keys.D) ship.dx = ship.speed;
        if (keys[' '] && Date.now() - lastShotTime > shotDelay) {
            lastShotTime = Date.now();
            const newBullet = {
                x: ship.x + ship.width / 2 - 2,
                y: ship.y,
                width: 4,
                height: 10,
                dy: 5 
            };
            bullets.push(newBullet);
            if (ammoPowerUpActive) {
                const newBullet2 = { ...newBullet, x: newBullet.x + 10 }; 
                bullets.push(newBullet2);
            }
        }

        draw();
        requestAnimationFrame(update);
    }
}
restartButton.addEventListener('click', () => {
    gameOverElement.style.display = 'none';
    score = 0;
    lives = 3;
    bullets.length = 0;
    enemyBullets.length = 0;
    enemies.length = 0;
    powerUps.length = 0;
    drawLives();
    scoreElement.innerHTML = `Score: ${score}`;
    isGameOver = false;
    update();

    var userID = 1; 

    document.getElementById('scoreForm').addEventListener('submit', function(e) {
        document.getElementById('scoreInput').value = score;
        getTotalScore();
    });

    function getTotalScore() {
        fetch('Pages/get_total_score.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'userID=' + userID,
        })
        .then(response => response.text())
        .then(totalScore => {
            document.getElementById('totalScoreValue').innerText = totalScore;
        });
    }
});
setInterval(spawnEnemy, 800); 
setInterval(spawnPowerUp, 5000); 
setInterval(spawnBoss, 10000); // Spawn a boss every 30 seconds
update();