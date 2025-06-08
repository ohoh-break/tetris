class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // 캔버스 크기 설정
        this.canvas.width = 300;
        this.canvas.height = 600;
        this.nextCanvas.width = 100;
        this.nextCanvas.height = 100;
        
        // 블록 크기 설정
        this.blockSize = 30;
        
        // 게임 보드 초기화
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        
        // 테트로미노 모양 정의 (보석 형태로)
        this.shapes = {
            I: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            J: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            L: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            O: [
                [1, 1],
                [1, 1]
            ],
            S: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            T: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            Z: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]
        };

        // 보석 색상 정의
        this.colors = {
            I: '#C0C0C0', // 실버
            J: '#8B4513', // 세들 브라운
            L: '#D4AF37', // 골드
            O: '#B8860B', // 다크 골드
            S: '#708090', // 슬레이트 그레이
            T: '#2F4F4F', // 다크 슬레이트 그레이
            Z: '#800020'  // 버건디
        };

        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.highScore = this.loadHighScore();
        this.totalLinesCleared = 0;
        this.gamesPlayed = this.loadGamesPlayed();

        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 게임 시작
        this.init();
    }

    init() {
        this.generateNewPiece();
        this.updateScore();
        this.updateLevel();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    }

    startGame() {
        if (this.gameOver) {
            this.reset();
        }
        this.isPaused = false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    reset() {
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.totalLinesCleared = 0;
        this.updateScore();
        this.updateLevel();
        this.showGameStats();
    }

    generateNewPiece() {
        const pieces = Object.keys(this.shapes);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        
        if (!this.currentPiece) {
            this.currentPiece = {
                shape: this.shapes[randomPiece],
                color: this.colors[randomPiece],
                x: 3,
                y: 0
            };
        } else {
            this.currentPiece = this.nextPiece;
        }

        this.nextPiece = {
            shape: this.shapes[pieces[Math.floor(Math.random() * pieces.length)]],
            color: this.colors[pieces[Math.floor(Math.random() * pieces.length)]],
            x: 3,
            y: 0
        };

        this.drawNextPiece();
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;

        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawGem(
                        this.nextCtx,
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        this.nextPiece.color
                    );
                }
            });
        });
    }

    drawGem(ctx, x, y, size, color) {
        // 보석 형태 그리기
        ctx.save();
        
        // 보석 본체
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x + size, y + size/4);
        ctx.lineTo(x + size, y + size*3/4);
        ctx.lineTo(x + size/2, y + size);
        ctx.lineTo(x, y + size*3/4);
        ctx.lineTo(x, y + size/4);
        ctx.closePath();
        
        // 그라데이션 효과
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, this.lightenColor(color, 40));
        gradient.addColorStop(1, color);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 하이라이트 효과
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size/4);
        ctx.lineTo(x + size*3/4, y + size/2);
        ctx.lineTo(x + size/2, y + size*3/4);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // 보석 광채 효과
        ctx.beginPath();
        ctx.arc(x + size/4, y + size/4, size/8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // 보석 테두리
        ctx.strokeStyle = this.lightenColor(color, 20);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 보드 그리기
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawGem(
                        this.ctx,
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize,
                        value
                    );
                }
            });
        });

        // 현재 조각 그리기
        if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawGem(
                            this.ctx,
                            (this.currentPiece.x + x) * this.blockSize,
                            (this.currentPiece.y + y) * this.blockSize,
                            this.blockSize,
                            this.currentPiece.color
                        );
                    }
                });
            });
        }
    }

    moveDown() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.freeze();
            this.clearLines();
            this.generateNewPiece();
            if (this.checkCollision()) {
                this.gameOver = true;
            }
        }
    }

    moveLeft() {
        this.currentPiece.x--;
        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
    }

    moveRight() {
        this.currentPiece.x++;
        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
    }

    rotate() {
        const originalShape = this.currentPiece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = originalShape[y][x];
            }
        }
        
        this.currentPiece.shape = rotated;
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        } else {
            // 회전 애니메이션 효과
            const gem = document.createElement('div');
            gem.className = 'rotating';
            gem.style.position = 'absolute';
            gem.style.width = '100%';
            gem.style.height = '100%';
            this.canvas.parentElement.appendChild(gem);

            setTimeout(() => {
                gem.remove();
            }, 300);
        }
    }

    checkCollision() {
        return this.currentPiece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                const newX = this.currentPiece.x + x;
                const newY = this.currentPiece.y + y;
                return (
                    newX < 0 ||
                    newX >= 10 ||
                    newY >= 20 ||
                    (newY >= 0 && this.board[newY][newX])
                );
            });
        });
    }

    freeze() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        let clearedLines = [];
        
        for (let y = this.board.length - 1; y >= 0; y--) {
            if (this.board[y].every(value => value !== 0)) {
                clearedLines.push(y);
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            // 라인 클리어 애니메이션
            clearedLines.forEach(y => {
                const line = document.createElement('div');
                line.className = 'line-clearing';
                line.style.position = 'absolute';
                line.style.left = '0';
                line.style.top = `${y * this.blockSize}px`;
                line.style.width = '100%';
                line.style.height = `${this.blockSize}px`;
                line.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                this.canvas.parentElement.appendChild(line);

                setTimeout(() => {
                    line.remove();
                }, 500);
            });

            // 특별 메시지 표시
            if (linesCleared === 4) {
                this.showSpecialMessage('AMAZING!');
            } else if (linesCleared === 3) {
                this.showSpecialMessage('GREAT!');
            }

            // 점수 계산 및 보드 업데이트
            this.score += linesCleared * 100 * this.level;
            this.totalLinesCleared += linesCleared;
            this.updateScore();
            
            if (this.score >= this.level * 1000) {
                this.level++;
                this.updateLevel();
            }

            // 보드 업데이트
            clearedLines.forEach(y => {
                this.board.splice(y, 1);
                this.board.unshift(Array(10).fill(0));
            });

            // 통계 업데이트
            this.showGameStats();
        }
    }

    showSpecialMessage(text) {
        const message = document.createElement('div');
        message.className = 'special-message';
        message.textContent = text;
        this.canvas.parentElement.appendChild(message);

        // 애니메이션 시작
        requestAnimationFrame(() => {
            message.classList.add('show');
        });

        // 메시지 제거
        setTimeout(() => {
            message.remove();
        }, 1500);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateLevel() {
        document.getElementById('level').textContent = this.level;
    }

    handleKeyPress(event) {
        if (this.gameOver || this.isPaused) return;

        switch (event.keyCode) {
            case 37: // 왼쪽 화살표
                this.moveLeft();
                break;
            case 39: // 오른쪽 화살표
                this.moveRight();
                break;
            case 40: // 아래쪽 화살표
                this.moveDown();
                break;
            case 38: // 위쪽 화살표
                this.rotate();
                break;
            case 32: // 스페이스바
                while (!this.checkCollision()) {
                    this.currentPiece.y++;
                }
                this.currentPiece.y--;
                this.freeze();
                this.clearLines();
                this.generateNewPiece();
                break;
        }
        this.draw();
    }

    gameLoop() {
        if (!this.gameOver && !this.isPaused) {
            this.moveDown();
            this.draw();
        }
        setTimeout(() => this.gameLoop(), 1000 / this.level);
    }

    loadHighScore() {
        const savedScore = localStorage.getItem('tetrisHighScore');
        return savedScore ? parseInt(savedScore) : 0;
    }

    loadGamesPlayed() {
        const savedGames = localStorage.getItem('tetrisGamesPlayed');
        return savedGames ? parseInt(savedGames) : 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.highScore.toString());
            this.showSpecialMessage('NEW HIGH SCORE!');
        }
    }

    saveGameStats() {
        this.gamesPlayed++;
        localStorage.setItem('tetrisGamesPlayed', this.gamesPlayed.toString());
        
        // 게임 통계 저장
        const stats = {
            date: new Date().toISOString(),
            score: this.score,
            level: this.level,
            linesCleared: this.totalLinesCleared
        };

        let gameHistory = JSON.parse(localStorage.getItem('tetrisGameHistory') || '[]');
        gameHistory.push(stats);
        
        // 최근 10게임만 저장
        if (gameHistory.length > 10) {
            gameHistory = gameHistory.slice(-10);
        }
        
        localStorage.setItem('tetrisGameHistory', JSON.stringify(gameHistory));
    }

    showGameStats() {
        const gameHistory = JSON.parse(localStorage.getItem('tetrisGameHistory') || '[]');
        const statsDiv = document.createElement('div');
        statsDiv.className = 'game-stats';
        statsDiv.innerHTML = `
            <h3>게임 통계</h3>
            <p>최고 점수: ${this.highScore}</p>
            <p>총 게임 수: ${this.gamesPlayed}</p>
            <p>현재 점수: ${this.score}</p>
            <p>현재 레벨: ${this.level}</p>
            <p>총 제거한 줄: ${this.totalLinesCleared}</p>
            <h4>최근 게임 기록</h4>
            <div class="game-history">
                ${gameHistory.map(game => `
                    <div class="history-item">
                        <p>날짜: ${new Date(game.date).toLocaleDateString()}</p>
                        <p>점수: ${game.score}</p>
                        <p>레벨: ${game.level}</p>
                        <p>제거한 줄: ${game.linesCleared}</p>
                    </div>
                `).join('')}
            </div>
        `;

        // 기존 통계가 있다면 제거
        const existingStats = document.querySelector('.game-stats');
        if (existingStats) {
            existingStats.remove();
        }

        document.querySelector('.game-info').appendChild(statsDiv);
    }

    checkGameOver() {
        if (this.checkCollision()) {
            this.gameOver = true;
            this.saveHighScore();
            this.saveGameStats();
            this.showSpecialMessage('GAME OVER');
            return true;
        }
        return false;
    }
}

// 게임 인스턴스 생성
const game = new Tetris(); 