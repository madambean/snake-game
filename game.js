window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const restartBtn = document.getElementById('restartBtn');
    const speedSelect = document.getElementById('speedSelect');
    const rankingDiv = document.getElementById('ranking');

    // Game settings
    const box = 20;
    const canvasSize = 400;
    let snake = [{ x: 9 * box, y: 10 * box }];
    let direction = 'RIGHT';
    let food = spawnFood();
    let score = 0;
    let gameInterval;
    let gameOver = false;
    let pendingDirection = null;
    let started = false;
    let speed = parseInt(speedSelect.value);

    function spawnFood() {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * (canvasSize / box)) * box,
                y: Math.floor(Math.random() * (canvasSize / box)) * box
            };
            // 음식이 뱀 몸통과 겹치지 않게
            if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) break;
        }
        return newFood;
    }

    document.addEventListener('keydown', changeDirection);

    function changeDirection(event) {
        if (gameOver) return;
        if (!started && ['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(event.key)) {
            started = true;
        }
        if (event.key === 'ArrowLeft' && direction !== 'RIGHT') pendingDirection = 'LEFT';
        else if (event.key === 'ArrowUp' && direction !== 'DOWN') pendingDirection = 'UP';
        else if (event.key === 'ArrowRight' && direction !== 'LEFT') pendingDirection = 'RIGHT';
        else if (event.key === 'ArrowDown' && direction !== 'UP') pendingDirection = 'DOWN';
    }

    function collision(head, array) {
        for (let i = 0; i < array.length; i++) {
            if (head.x === array[i].x && head.y === array[i].y) {
                return true;
            }
        }
        return false;
    }

    function draw() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? '#0f0' : '#fff';
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
        }

        // Draw food
        ctx.fillStyle = '#f00';
        ctx.fillRect(food.x, food.y, box, box);

        // Draw score
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, 10, 25);
    }

    function update() {
        if (gameOver) return;
        if (!started) {
            draw();
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText('Press Arrow Key to Start', 60, 200);
            return;
        }
        if (pendingDirection) {
            direction = pendingDirection;
            pendingDirection = null;
        }
        let head = { x: snake[0].x, y: snake[0].y };

        if (direction === 'LEFT') head.x -= box;
        if (direction === 'UP') head.y -= box;
        if (direction === 'RIGHT') head.x += box;
        if (direction === 'DOWN') head.y += box;

        // Wall collision
        if (
            head.x < 0 || head.x >= canvasSize ||
            head.y < 0 || head.y >= canvasSize ||
            collision(head, snake)
        ) {
            gameOver = true;
            clearInterval(gameInterval);
            saveRanking(score);
            draw();
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '40px Arial';
            ctx.fillText('Game Over', 90, 200);
            ctx.font = '20px Arial';
            ctx.fillText('Score: ' + score, 150, 240);
            ctx.fillText('Restart 버튼을 누르세요', 90, 280);
            updateRanking();
            return;
        }

        // Food eaten
        if (head.x === food.x && head.y === food.y) {
            score++;
            food = spawnFood();
        } else {
            snake.pop();
        }

        snake.unshift(head);
        draw();
    }

    function restartGame() {
        snake = [{ x: 9 * box, y: 10 * box }];
        direction = 'RIGHT';
        pendingDirection = null;
        food = spawnFood();
        score = 0;
        gameOver = false;
        started = false;
        clearInterval(gameInterval);
        draw();
        gameInterval = setInterval(update, speed);
    }

    function saveRanking(newScore) {
        let ranking = JSON.parse(localStorage.getItem('snakeRanking') || '[]');
        ranking.push(newScore);
        ranking = ranking.sort((a, b) => b - a).slice(0, 3);
        localStorage.setItem('snakeRanking', JSON.stringify(ranking));
    }

    function updateRanking() {
        let ranking = JSON.parse(localStorage.getItem('snakeRanking') || '[]');
        rankingDiv.innerHTML = '<h2>Top 3 Scores</h2>' + ranking.map((s, i) => `<div>${i+1}. ${s}</div>`).join('');
    }

    restartBtn.onclick = restartGame;
    speedSelect.onchange = function() {
        speed = parseInt(speedSelect.value);
        if (!gameOver) {
            clearInterval(gameInterval);
            gameInterval = setInterval(update, speed);
        }
    };

    updateRanking();
    draw();
    gameInterval = setInterval(update, speed);
};
