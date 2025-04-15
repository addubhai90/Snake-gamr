var Snake = (function () {
    const INITIAL_TAIL = 4;
    let intervalID;

    let tileCount = 20;
    let gridSize = 300 / tileCount; // Match canvas size

    const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };

    let velocity = { x: 0, y: 0 };
    let player = { ...INITIAL_PLAYER };
    let fruit = { x: 1, y: 1 };
    let trail = [];
    let tail = INITIAL_TAIL;

    let points = 0, pointsMax = localStorage.getItem('snakeHighScore') || 0;
    let walls = true;
    let gameStarted = false;
    let gamePaused = false;

    let lastAction = null;
    let canvas, ctx;
    let scoreDisplay, highScoreDisplay, startButton, pauseButton, gameOverScreen, finalScore, restartButton, controls;

    function setup() {
        console.log("Setting up game...");
        canvas = document.getElementById('gc');
        ctx = canvas.getContext('2d');
        scoreDisplay = document.getElementById('score');
        highScoreDisplay = document.getElementById('high-score');
        startButton = document.getElementById('start-button');
        pauseButton = document.getElementById('pause-button');
        gameOverScreen = document.getElementById('game-over');
        finalScore = document.getElementById('final-score');
        restartButton = document.getElementById('restart-button');
        controls = document.getElementById('controls');

        // Set canvas size explicitly
        canvas.width = 300;
        canvas.height = 300;
        gridSize = canvas.width / tileCount;

        console.log("Canvas size:", canvas.width, canvas.height);
        console.log("Grid size:", gridSize);

        highScoreDisplay.textContent = `High Score: ${pointsMax}`;
        game.reset();

        startButton.addEventListener('click', startGame);
        pauseButton.addEventListener('click', togglePause);
        restartButton.addEventListener('click', restartGame);
        setupTouchControls();
    }

    const game = {
        reset() {
            console.log("Resetting game...");
            player = { ...INITIAL_PLAYER };
            velocity = { x: 0, y: 0 };
            trail = [{ ...player }];
            tail = INITIAL_TAIL;
            points = 0;
            lastAction = null;
            scoreDisplay.textContent = `Score: ${points}`;
            game.RandomFruit();
            gameOverScreen.style.display = 'none';
            pauseButton.style.display = gameStarted ? 'inline-block' : 'none';
        },

        RandomFruit() {
            fruit.x = Math.floor(Math.random() * tileCount);
            fruit.y = Math.floor(Math.random() * tileCount);
            if (trail.some(segment => segment.x === fruit.x && segment.y === fruit.y)) {
                game.RandomFruit();
            }
            console.log("Fruit spawned at:", fruit.x, fruit.y);
        },

        loop() {
            if (!gameStarted || gamePaused) {
                console.log("Game not running:", { gameStarted, gamePaused });
                return;
            }

            console.log("Game loop - Player:", player.x, player.y);

            player.x += velocity.x;
            player.y += velocity.y;

            if (walls) {
                if (player.x < 0 || player.x >= tileCount || player.y < 0 || player.y >= tileCount) {
                    console.log("Wall collision!");
                    gameOver();
                    return;
                }
            } else {
                if (player.x < 0) player.x = tileCount - 1;
                if (player.x >= tileCount) player.x = 0;
                if (player.y < 0) player.y = tileCount - 1;
                if (player.y >= tileCount) player.y = 0;
            }

            trail.push({ ...player });
            while (trail.length > tail) trail.shift();

            // Drawing
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.log("Canvas cleared");

            // Fruit
            ctx.beginPath();
            ctx.arc(
                fruit.x * gridSize + gridSize / 2,
                fruit.y * gridSize + gridSize / 2,
                gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = '#ff5252';
            ctx.fill();
            ctx.closePath();
            console.log("Fruit drawn");

            // Snake
            trail.forEach((segment, i) => {
                ctx.beginPath();
                ctx.fillStyle = i === trail.length - 1 ? '#4caf50' : '#66bb6a';
                ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
                ctx.closePath();
                console.log("Drawing segment:", segment.x, segment.y, "Index:", i);
            });

            if (player.x === fruit.x && player.y === fruit.y) {
                tail++;
                points += 10;
                scoreDisplay.textContent = `Score: ${points}`;
                game.RandomFruit();
                console.log("Fruit eaten, score:", points);
            }

            for (let i = 0; i < trail.length - 1; i++) {
                if (trail[i].x === player.x && trail[i].y === player.y) {
                    console.log("Self collision!");
                    gameOver();
                    return;
                }
            }
        },

        action: {
            up() {
                if (lastAction !== 'down') {
                    velocity = { x: 0, y: -1 };
                    lastAction = 'up';
                    console.log("Moving up");
                }
            },
            down() {
                if (lastAction !== 'up') {
                    velocity = { x: 0, y: 1 };
                    lastAction = 'down';
                    console.log("Moving down");
                }
            },
            left() {
                if (lastAction !== 'right') {
                    velocity = { x: -1, y: 0 };
                    lastAction = 'left';
                    console.log("Moving left");
                }
            },
            right() {
                if (lastAction !== 'left') {
                    velocity = { x: 1, y: 0 };
                    lastAction = 'right';
                    console.log("Moving right");
                }
            }
        }
    };

    function startGame() {
        if (gameStarted && !gamePaused) return;
        console.log("Starting game...");
        gameStarted = true;
        gamePaused = false;
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        pauseButton.textContent = 'Pause';
        game.reset();
        if (!intervalID) {
            intervalID = setInterval(game.loop, 1000 / 10); // 10 FPS for mobile
        }
    }

    function togglePause() {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
        if (gamePaused) {
            velocity = { x: 0, y: 0 };
        }
        console.log("Pause toggled:", gamePaused);
    }

    function gameOver() {
        console.log("Game over!");
        gameStarted = false;
        clearInterval(intervalID);
        intervalID = null;
        if (points > pointsMax) {
            pointsMax = points;
            localStorage.setItem('snakeHighScore', pointsMax);
            highScoreDisplay.textContent = `High Score: ${pointsMax}`;
        }
        finalScore.textContent = `Score: ${points}`;
        gameOverScreen.style.display = 'block';
        startButton.style.display = 'none';
        pauseButton.style<|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|control704|><|c
