document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const gameArea = document.getElementById('gameArea');
    const road = document.getElementById('road');
    const player = document.getElementById('player');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const finalScoreElement = document.getElementById('finalScore');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    
    // Create background music element
    const backgroundMusic = new Audio('theme-song.mp3');
    backgroundMusic.loop = true; // Loop the music
    backgroundMusic.volume = 0.5; // Set volume to 50%
    
    // Create sound effects
    const coinSound = new Audio('coin.mp3');
    coinSound.volume = 0.05; // Set volume to 5%
    const gameStartSound = new Audio('game-start.mp3');
    gameStartSound.volume = 0.3; // Set volume to 30%
    const gameOverSound = new Audio('game-over.mp3');
    gameOverSound.volume = 0.4; // Set volume to 40%
    const dyingSound = new Audio('dying.mp3');
    dyingSound.volume = 0.15; // Set volume to 15%
    const spikeStripSound = new Audio('spike-strip.mp3');
    spikeStripSound.volume = 0.15; // Set volume to 15%
    const newLevelSound = new Audio('new-level.mp3');
    newLevelSound.volume = 0.3; // Set volume to 30%
    
    // Create heart collection sound
    const heartSound = new Audio('heart-sound.mp3'); // Using dedicated heart sound
    heartSound.volume = 0.2; // Set volume to 20%
    
    // Volume control
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', function() {
        backgroundMusic.volume = this.value;
        // Also adjust sound effects volume proportionally
        coinSound.volume = this.value * 0.05; // 5% of music volume (lower than before)
        gameStartSound.volume = this.value * 0.6; // 60% of music volume
        gameOverSound.volume = this.value * 0.8; // 80% of music volume
        dyingSound.volume = this.value * 0.7; // 70% of music volume
        spikeStripSound.volume = this.value * 0.5; // 50% of music volume
        newLevelSound.volume = this.value * 0.6; // 60% of music volume
        heartSound.volume = this.value * 0.4; // 40% of music volume
    });
    
    // Create pause screen
    const pauseScreen = document.createElement('div');
    pauseScreen.id = 'pauseScreen';
    pauseScreen.className = 'pause-screen hidden';
    pauseScreen.style.display = 'none'; // Ensure it's hidden by default
    pauseScreen.innerHTML = '<h1>Luigi Kart Paused</h1><p>Press SPACE to resume</p>';
    document.querySelector('.game-container').appendChild(pauseScreen);
    
    // Game variables
    let gameActive = false;
    let gamePaused = false;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let animationId;
    let enemySpeed = 4; // Reduced from 5
    let obstacleSpeed = 5; // Reduced from 6
    let playerSpeed = 8;
    let playerX = 275;
    let enemies = [];
    let obstacles = [];
    let coins = []; // Array to track coins
    let bananas = []; // Array to track tire strips
    let hearts = []; // Array to track hearts
    let lastEnemyTime = 0;
    let lastObstacleTime = 0;
    let lastCoinTime = 0; // Track when the last coin was created
    let lastBananaTime = 0; // Track when the last tire strip was created
    let lastBusTime = 0; // Track when the last bus was created
    let lastSnakeCarTime = 0; // Track when the last snake car was created
    let heartSpeed = 7; // Hearts move faster than other elements
    let enemyInterval = 1800; // Increased from 1500
    let obstacleInterval = 3000; // Increased from 2500
    let coinInterval = 2500; // Increased from 2000
    let bananaInterval = 3500; // Increased from 3000
    let busInterval = 5000; // Buses are less frequent
    let snakeCarInterval = 4000; // Snake cars appear less frequently than regular cars
    let gameTime = 0;
    let difficultyIncreaseInterval = 5000;
    let coinValue = 5; // Score value for each coin collected
    let playerSpinning = false; // Track if player is currently spinning
    let spinEndTime = 0; // Track when the spin animation should end
    let level = 1; // Current game level
    let scoreForNextLevel = 25; // Changed from 10 to 25
    let levelMultiplier = 1; // Changed from 1.5 to 1 (fixed 25 points per level)
    let pointMultiplier = 1; // Multiplier for all points (doubles every 10 levels)
    let basePointsPerLevel = 25; // Base points needed for level advancement
    let lives = 3; // Player starts with 3 lives
    let maxLives = 5; // Maximum number of lives a player can have
    let heartSpawned = false; // Track if a heart has been spawned for the current level
    let invincible = false; // Player invincibility after being hit
    let invincibleEndTime = 0; // When invincibility ends
    let invincibleDuration = 2000; // 2 seconds of invincibility after being hit
    let debugMode = false; // Debug mode for visualizing hitboxes
    
    // Enemy tier levels - when each enemy type starts appearing
    const enemyTiers = {
        obstacles: 1,    // Red obstacles appear from level 1
        bananas: 1,      // Tire strips appear from level 1
        enemies: 5,      // Blue enemy cars appear from level 5
        buses: 10,       // Yellow buses appear from level 10
        snakeCars: 15    // Red snake cars appear from level 15
    };
    
    // Function to check if an enemy type should spawn based on current level
    function shouldSpawnEnemyType(enemyType) {
        // In debug mode, spawn all enemy types regardless of level
        if (debugMode) {
            return true;
        }
        return level >= enemyTiers[enemyType];
    }
    
    // Create level indicator
    const levelIndicator = document.createElement('div');
    levelIndicator.className = 'level-indicator';
    levelIndicator.innerHTML = '<span>Level: <span id="currentLevel">1</span></span>';
    document.querySelector('.score-container').appendChild(levelIndicator);
    
    // Create lives indicator
    const livesContainer = document.createElement('div');
    livesContainer.className = 'lives-container';
    document.querySelector('.score-container').appendChild(livesContainer);
    
    // Function to update lives display
    function updateLivesDisplay() {
        livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.innerHTML = '❤️';
            livesContainer.appendChild(heart);
        }
    }
    
    // Control state
    let moveLeftPressed = false;
    let moveRightPressed = false;
    
    // Game boundaries
    const gameWidth = 600;
    const gameHeight = 800;
    const playerWidth = 50;
    const playerBoundaryLeft = 10;
    const playerBoundaryRight = gameWidth - playerWidth - 10;
    
    // Update high score display
    highScoreElement.textContent = highScore;
    
    // Event listeners for buttons
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    // Keyboard controls
    window.addEventListener('keydown', function(e) {
        // Allow spacebar or Enter to toggle pause/start game
        if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
            if (gameActive && startScreen.classList.contains('hidden') && gameOverScreen.classList.contains('hidden')) {
                // Only spacebar should pause during gameplay
                if (e.key === ' ' || e.key === 'Spacebar') {
                    togglePause();
                    e.preventDefault();
                }
            } else if (!gameActive) {
                // Both spacebar and Enter can start the game from start or game over screens
                if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) {
                    startGame();
                    e.preventDefault();
                }
            }
        }
        
        // Toggle debug mode with 'D' key
        if (e.key === 'd' || e.key === 'D') {
            if (e.ctrlKey && e.shiftKey) { // Require Ctrl+Shift+D to avoid accidental activation
                toggleDebugMode();
                e.preventDefault();
            }
        }
        
        // Movement controls only work when game is active and not paused and player is not spinning
        if (gameActive && !gamePaused && !playerSpinning) {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                moveLeftPressed = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                moveRightPressed = true;
                e.preventDefault();
            }
        }
    });
    
    window.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            moveLeftPressed = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            moveRightPressed = false;
        }
    });
    
    // Player movement function - now called in game loop
    function movePlayer() {
        // Only move if not spinning
        if (!playerSpinning) {
            // Move left
            if (moveLeftPressed && playerX > playerBoundaryLeft) {
                playerX -= playerSpeed;
            }
            
            // Move right
            if (moveRightPressed && playerX < playerBoundaryRight) {
                playerX += playerSpeed;
            }
            
            // Update player position
            player.style.left = playerX + 'px';
        } else {
            // Check if spin animation should end
            if (gameTime >= spinEndTime) {
                endPlayerSpin();
            }
        }
    }
    
    // Start player spin animation
    function startPlayerSpin() {
        playerSpinning = true;
        player.classList.add('player-spinning');
        
        // Set the time when the spin should end (1 second duration)
        spinEndTime = gameTime + 1000;
        
        // Listen for animation end to remove the class
        player.addEventListener('animationend', function spinListener() {
            player.removeEventListener('animationend', spinListener);
            endPlayerSpin();
        });
    }
    
    // End player spin animation
    function endPlayerSpin() {
        playerSpinning = false;
        player.classList.remove('player-spinning');
    }
    
    // Toggle pause state
    function togglePause() {
        // Only toggle pause if game is actually active
        if (!gameActive) return;
        
        gamePaused = !gamePaused;
        
        if (gamePaused) {
            // Show pause screen
            pauseScreen.classList.remove('hidden');
            pauseScreen.style.display = 'flex';
            // Pause road animation
            road.style.animationPlayState = 'paused';
            cancelAnimationFrame(animationId);
            
            // Pause background music
            backgroundMusic.pause();
        } else {
            // Hide pause screen and resume game
            pauseScreen.classList.add('hidden');
            pauseScreen.style.display = 'none';
            // Resume road animation
            road.style.animationPlayState = 'running';
            gameLoop(performance.now());
            
            // Resume background music
            backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    // Toggle debug mode
    function toggleDebugMode() {
        debugMode = !debugMode;
        console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
        
        // If turning on debug mode, update the level indicator to show it's active
        if (debugMode) {
            document.getElementById('currentLevel').innerHTML = level + ' <span style="color: #ff4757;">[DEBUG]</span>';
            
            // Clear any existing hitbox visualizations
            const existingHitboxes = document.querySelectorAll('[class^="debug-hitbox-"]');
            existingHitboxes.forEach(box => box.remove());
        } else {
            document.getElementById('currentLevel').textContent = level;
        }
    }
    
    // Start the game
    function startGame() {
        // Reset game state
        gameActive = true;
        gamePaused = false;
        score = 0;
        level = 1;
        lives = 3; // Reset lives
        invincible = false;
        heartSpawned = true; // Set to true initially since level 1 is not divisible by 3
        pointMultiplier = 1; // Reset point multiplier
        basePointsPerLevel = 25; // Reset base points per level
        scoreForNextLevel = basePointsPerLevel; // Reset score for next level
        scoreElement.textContent = score;
        document.getElementById('currentLevel').textContent = level;
        
        // If debug mode is active, update level indicator
        if (debugMode) {
            document.getElementById('currentLevel').innerHTML = level + ' <span style="color: #ff4757;">[DEBUG]</span>';
        }
        
        updateLivesDisplay(); // Update lives display
        
        // Make sure pause screen is hidden
        pauseScreen.classList.add('hidden');
        pauseScreen.style.display = 'none';
        
        // Ensure road animation is running
        road.style.animationPlayState = 'running';
        road.style.animationDuration = '0.7s'; // Slowed from 0.5s to 0.7s
        
        // Clear existing enemies and obstacles
        clearEnemiesAndObstacles();
        
        // Reset variables
        enemySpeed = 4; // Reduced from 5
        obstacleSpeed = 5; // Reduced from 6
        heartSpeed = 7; // Hearts move faster than other elements
        gameTime = 0;
        lastEnemyTime = 0;
        lastObstacleTime = 0;
        lastCoinTime = 0;
        lastBananaTime = 0;
        lastBusTime = 0;
        lastSnakeCarTime = 0; // Reset snake car timer
        enemyInterval = 1800; // Increased from 1500
        obstacleInterval = 3000; // Increased from 2500
        coinInterval = 2500; // Increased from 2000
        bananaInterval = 3500; // Increased from 3000
        busInterval = 5000; // Reset bus interval
        snakeCarInterval = 4000; // Reset snake car interval
        playerX = 275;
        moveLeftPressed = false;
        moveRightPressed = false;
        playerSpinning = false;
        
        // Update UI
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        pauseScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        
        // Reset player position
        player.style.left = playerX + 'px';
        
        // Play game start sound
        gameStartSound.currentTime = 0; // Reset to beginning
        gameStartSound.play().catch(e => console.log("Game start sound play failed:", e));
        
        // Play background music after a short delay to allow start sound to be heard
        setTimeout(() => {
            backgroundMusic.currentTime = 0; // Reset to beginning
            backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
        }, 1000); // 1 second delay
        
        // Start game loop
        cancelAnimationFrame(animationId);
        gameLoop(0);
    }
    
    // Game over
    function gameOver() {
        gameActive = false;
        gamePaused = false;
        cancelAnimationFrame(animationId);
        
        // Pause background music
        backgroundMusic.pause();
        
        // Play game over sound
        gameOverSound.currentTime = 0; // Reset to beginning
        gameOverSound.play().catch(e => console.log("Game over sound play failed:", e));
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        // Show game over screen
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }
    
    // Create tire strip (formerly banana peel)
    function createBanana() {
        const tireStrip = document.createElement('div');
        
        // Set the tire strip styles
        tireStrip.style.position = 'absolute';
        tireStrip.style.width = '80px';
        tireStrip.style.height = '20px';
        tireStrip.style.zIndex = '5';
        
        // Create tire strip SVG
        tireStrip.innerHTML = `
            <svg viewBox="0 0 80 20" xmlns="http://www.w3.org/2000/svg">
                <!-- Base strip -->
                <rect x="0" y="7" width="80" height="6" fill="#333333" rx="1" />
                
                <!-- Spikes -->
                <polygon points="5,7 8,0 11,7" fill="#777777" stroke="#333333" stroke-width="1" />
                <polygon points="15,7 18,0 21,7" fill="#777777" stroke="#333333" stroke-width="1" />
                <polygon points="25,7 28,0 31,7" fill="#777777" stroke="#333333" stroke-width="1" />
                <polygon points="35,7 38,0 41,7" fill="#777777" stroke="#333333" stroke-width="1" />
                <polygon points="45,7 48,0 51,7" fill="#777777" stroke="#333333" stroke-width="1" />
                <polygon points="55,7 58,0 61,7" fill="#777777" stroke="#333333" stroke-width="1" />
                <polygon points="65,7 68,0 71,7" fill="#777777" stroke="#333333" stroke-width="1" />
                
                <!-- Reflective strips -->
                <rect x="5" y="10" width="10" height="1" fill="#FFCC00" />
                <rect x="25" y="10" width="10" height="1" fill="#FFCC00" />
                <rect x="45" y="10" width="10" height="1" fill="#FFCC00" />
                <rect x="65" y="10" width="10" height="1" fill="#FFCC00" />
            </svg>
        `;
        
        // Random position on the road (3 lanes with slight variation)
        const lanes = [100, 275, 450];
        const randomLane = Math.floor(Math.random() * 3);
        const randomOffset = Math.floor(Math.random() * 30) - 15; // Small random offset for variety
        
        // Set initial position above the visible area
        const left = lanes[randomLane] + randomOffset - 15; // Adjust for wider width
        tireStrip.style.left = left + 'px';
        tireStrip.style.top = '-20px';
        
        // Add to the DOM
        road.appendChild(tireStrip);
        
        // Add to our tracking array (still using bananas array for consistency)
        bananas.push({
            element: tireStrip,
            top: -20,
            left: left
        });
        
        // Force a reflow
        tireStrip.getBoundingClientRect();
    }
    
    // Update tire strips (formerly bananas)
    function updateBananas() {
        for (let i = bananas.length - 1; i >= 0; i--) {
            const stripObj = bananas[i];
            const strip = stripObj.element;
            
            // Update position in our tracking object
            stripObj.top += obstacleSpeed; // Use same speed as obstacles
            
            // Apply the new position
            strip.style.top = stripObj.top + 'px';
            
            // Check if strip has passed the screen
            if (stripObj.top > gameHeight) {
                // Strip passed, remove it
                strip.remove();
                bananas.splice(i, 1);
            } else {
                // Check collision with player (strip hit)
                if (!playerSpinning && isColliding(player, strip)) {
                    // Play spike strip sound
                    spikeStripSound.currentTime = 0; // Reset sound to beginning
                    spikeStripSound.play().catch(e => console.log("Spike strip sound play failed:", e));
                    
                    // Player hit strip, start spin animation
                    startPlayerSpin();
                    
                    // Remove the strip
                    strip.remove();
                    bananas.splice(i, 1);
                }
            }
        }
    }
    
    // Create coin
    function createCoin() {
        // Create a container for both visual coin and hitbox
        const coinContainer = document.createElement('div');
        coinContainer.style.position = 'absolute';
        coinContainer.style.width = '40px'; // Slightly larger than visual coin
        coinContainer.style.height = '40px';
        coinContainer.style.zIndex = '5';
        
        // Create the visual coin element
        const visualCoin = document.createElement('div');
        visualCoin.style.position = 'absolute';
        visualCoin.style.width = '30px';
        visualCoin.style.height = '30px';
        visualCoin.style.borderRadius = '50%';
        visualCoin.style.backgroundColor = '#FFD700'; // Gold color
        visualCoin.style.boxShadow = '0 0 10px #FFD700';
        visualCoin.style.left = '5px'; // Center in container
        visualCoin.style.top = '5px'; // Center in container
        
        // Add a shiny effect with a pseudo-element
        visualCoin.innerHTML = '<div style="position: absolute; top: 5px; left: 5px; width: 10px; height: 10px; background-color: #FFFFFF; opacity: 0.7; border-radius: 50%;"></div>';
        
        // Add spinning animation to visual coin only
        visualCoin.style.animation = 'spin 1s linear infinite';
        
        // Add visual coin to container
        coinContainer.appendChild(visualCoin);
        
        // Create invisible hitbox element (for debug mode)
        if (debugMode) {
            const hitboxVisualizer = document.createElement('div');
            hitboxVisualizer.style.position = 'absolute';
            hitboxVisualizer.style.width = '100%';
            hitboxVisualizer.style.height = '100%';
            hitboxVisualizer.style.border = '2px solid blue';
            hitboxVisualizer.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
            hitboxVisualizer.style.zIndex = '1';
            coinContainer.appendChild(hitboxVisualizer);
        }
        
        // Random position on the road (3 lanes with slight variation)
        const lanes = [100, 275, 450];
        const randomLane = Math.floor(Math.random() * 3);
        const randomOffset = Math.floor(Math.random() * 30) - 15; // Small random offset for variety
        
        // Set initial position above the visible area
        const left = lanes[randomLane] + randomOffset;
        coinContainer.style.left = left + 'px';
        coinContainer.style.top = '-40px';
        
        // Add to the DOM
        road.appendChild(coinContainer);
        
        // Add to our tracking array
        coins.push({
            element: coinContainer, // Use container for collision detection
            top: -40,
            left: left
        });
        
        // Force a reflow
        coinContainer.getBoundingClientRect();
    }
    
    // Update coins
    function updateCoins() {
        for (let i = coins.length - 1; i >= 0; i--) {
            const coinObj = coins[i];
            const coin = coinObj.element;
            
            // Update position in our tracking object
            coinObj.top += obstacleSpeed; // Use same speed as obstacles
            
            // Apply the new position
            coin.style.top = coinObj.top + 'px';
            
            // Check if coin has passed the screen
            if (coinObj.top > gameHeight) {
                // Coin passed, remove it
                coin.remove();
                coins.splice(i, 1);
            } else {
                // Check collision with player (coin collection)
                if (isColliding(player, coin)) {
                    // Coin collected, increase score
                    const pointsEarned = coinValue * pointMultiplier;
                    score += pointsEarned;
                    scoreElement.textContent = score;
                    
                    // Play coin sound without affecting background music
                    coinSound.currentTime = 0; // Reset sound to beginning
                    coinSound.play().catch(e => console.log("Coin sound play failed:", e));
                    
                    // Show a score popup
                    showScorePopup(coinObj.left, coinObj.top, "+" + pointsEarned);
                    
                    // Remove the coin
                    coin.remove();
                    coins.splice(i, 1);
                }
            }
        }
    }
    
    // Show score popup when collecting coins
    function showScorePopup(x, y, text) {
        const popup = document.createElement('div');
        popup.textContent = text;
        popup.style.position = 'absolute';
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        popup.style.color = '#FFD700';
        popup.style.fontWeight = 'bold';
        popup.style.fontSize = '20px';
        popup.style.textShadow = '0 0 5px black';
        popup.style.zIndex = '10';
        popup.style.pointerEvents = 'none'; // Don't interfere with game interaction
        
        road.appendChild(popup);
        
        // Animate the popup
        let opacity = 1;
        let posY = y;
        
        const animatePopup = () => {
            opacity -= 0.02;
            posY -= 1;
            popup.style.opacity = opacity;
            popup.style.top = posY + 'px';
            
            if (opacity > 0) {
                requestAnimationFrame(animatePopup);
            } else {
                popup.remove();
            }
        };
        
        requestAnimationFrame(animatePopup);
    }
    
    // Clear all enemies, obstacles, and coins
    function clearEnemiesAndObstacles() {
        // Remove all enemy elements
        enemies.forEach(function(enemy) {
            enemy.element.remove();
        });
        enemies = [];
        
        // Remove all obstacle elements
        obstacles.forEach(function(obstacle) {
            obstacle.element.remove();
        });
        obstacles = [];
        
        // Remove all coin elements
        coins.forEach(function(coin) {
            coin.element.remove();
        });
        coins = [];
        
        // Remove all tire strip elements
        bananas.forEach(function(banana) {
            banana.element.remove();
        });
        bananas = [];
        
        // Remove all heart elements
        hearts.forEach(function(heart) {
            heart.element.remove();
        });
        hearts = [];
    }
    
    // Create enemy car with direct DOM manipulation
    function createEnemy() {
        // Create the enemy car element
        const enemy = document.createElement('div');
        
        // Set the initial position with inline styles before adding to DOM
        enemy.style.position = 'absolute';
        enemy.style.width = '50px';
        enemy.style.height = '80px';
        enemy.style.backgroundSize = 'contain';
        enemy.style.backgroundRepeat = 'no-repeat';
        enemy.style.backgroundPosition = 'center';
        enemy.style.zIndex = '5';
        
        // Set the enemy car image
        enemy.style.backgroundImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 80\"><rect x=\"10\" y=\"5\" width=\"30\" height=\"70\" rx=\"5\" fill=\"%234bcffa\"/><rect x=\"15\" y=\"15\" width=\"20\" height=\"15\" rx=\"2\" fill=\"%23333\"/><rect x=\"15\" y=\"50\" width=\"20\" height=\"15\" rx=\"2\" fill=\"%23333\"/><rect x=\"5\" y=\"20\" width=\"5\" height=\"10\" fill=\"%23333\"/><rect x=\"5\" y=\"50\" width=\"5\" height=\"10\" fill=\"%23333\"/><rect x=\"40\" y=\"20\" width=\"5\" height=\"10\" fill=\"%23333\"/><rect x=\"40\" y=\"50\" width=\"5\" height=\"10\" fill=\"%23333\"/></svg>')";
        
        // Random position on the road (3 lanes)
        const lanes = [100, 275, 450];
        const randomLane = Math.floor(Math.random() * 3);
        
        // Set initial position above the visible area
        enemy.style.left = lanes[randomLane] + 'px';
        enemy.style.top = '-120px'; // Start even further above
        
        // Add to the DOM
        road.appendChild(enemy);
        
        // Add to our tracking array
        enemies.push({
            element: enemy,
            top: -120,
            left: lanes[randomLane],
            type: 'car'
        });
        
        // Force a reflow
        enemy.getBoundingClientRect();
    }
    
    // Create bus enemy (longer than regular cars)
    function createBus() {
        // Create the bus element
        const bus = document.createElement('div');
        
        // Random length (4-6 times longer than regular cars)
        const lengthMultiplier = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6
        const busHeight = 80 * lengthMultiplier;
        
        // Set the initial position with inline styles
        bus.style.position = 'absolute';
        bus.style.width = '50px';
        bus.style.height = busHeight + 'px';
        bus.style.backgroundSize = 'contain';
        bus.style.backgroundRepeat = 'no-repeat';
        bus.style.backgroundPosition = 'center';
        bus.style.zIndex = '5';
        
        // Create SVG for the bus - using a simpler approach with direct styling
        bus.style.backgroundColor = '#FFCC00'; // Yellow color for bus
        bus.style.borderRadius = '5px';
        bus.style.border = '2px solid #333';
        bus.style.boxShadow = '0 0 10px rgba(255, 204, 0, 0.7)'; // Add glow effect
        
        // Add a "BUS" label to make it more visible
        const busLabel = document.createElement('div');
        busLabel.textContent = 'BUS';
        busLabel.style.position = 'absolute';
        busLabel.style.width = '100%';
        busLabel.style.textAlign = 'center';
        busLabel.style.top = '50%';
        busLabel.style.transform = 'translateY(-50%)';
        busLabel.style.color = '#333';
        busLabel.style.fontWeight = 'bold';
        busLabel.style.fontSize = '14px';
        busLabel.style.textShadow = '0 0 2px #FFCC00';
        bus.appendChild(busLabel);
        
        // Add windows as child elements instead of SVG
        addBusWindows(bus, lengthMultiplier, busHeight);
        
        // Add wheels as child elements
        addBusWheels(bus, lengthMultiplier, busHeight);
        
        // Random position on the road (3 lanes)
        const lanes = [100, 275, 450];
        const randomLane = Math.floor(Math.random() * 3);
        
        // Set initial position above the visible area (higher for longer buses)
        bus.style.left = lanes[randomLane] + 'px';
        bus.style.top = `-${busHeight + 40}px`; // Start further above based on bus length
        
        // Add to the DOM
        road.appendChild(bus);
        
        // Add to our tracking array (using the enemies array for consistency)
        enemies.push({
            element: bus,
            top: -(busHeight + 40),
            left: lanes[randomLane],
            type: 'bus',
            height: busHeight
        });
    }
    
    // Helper function to add windows to the bus using DOM elements
    function addBusWindows(bus, lengthMultiplier, busHeight) {
        const windowCount = lengthMultiplier * 2; // 2 windows per car length
        const totalHeight = busHeight - 20; // Leave space at top and bottom
        const windowSpacing = totalHeight / windowCount;
        
        for (let i = 0; i < windowCount; i++) {
            const window = document.createElement('div');
            window.style.position = 'absolute';
            window.style.width = '20px';
            window.style.height = '15px';
            window.style.backgroundColor = '#333';
            window.style.borderRadius = '2px';
            window.style.left = '15px';
            window.style.top = (15 + (i * windowSpacing)) + 'px';
            bus.appendChild(window);
        }
    }
    
    // Helper function to add wheels to the bus using DOM elements
    function addBusWheels(bus, lengthMultiplier, busHeight) {
        // Front wheels
        const frontLeftWheel = createWheel();
        frontLeftWheel.style.left = '5px';
        frontLeftWheel.style.top = '20px';
        bus.appendChild(frontLeftWheel);
        
        const frontRightWheel = createWheel();
        frontRightWheel.style.left = '40px';
        frontRightWheel.style.top = '20px';
        bus.appendChild(frontRightWheel);
        
        // Back wheels
        const backLeftWheel = createWheel();
        backLeftWheel.style.left = '5px';
        backLeftWheel.style.top = (busHeight - 30) + 'px';
        bus.appendChild(backLeftWheel);
        
        const backRightWheel = createWheel();
        backRightWheel.style.left = '40px';
        backRightWheel.style.top = (busHeight - 30) + 'px';
        bus.appendChild(backRightWheel);
        
        // Middle wheels for longer buses
        if (lengthMultiplier > 4) {
            const midLeftWheel = createWheel();
            midLeftWheel.style.left = '5px';
            midLeftWheel.style.top = (Math.floor(busHeight/2) - 5) + 'px';
            bus.appendChild(midLeftWheel);
            
            const midRightWheel = createWheel();
            midRightWheel.style.left = '40px';
            midRightWheel.style.top = (Math.floor(busHeight/2) - 5) + 'px';
            bus.appendChild(midRightWheel);
        }
    }
    
    // Helper function to create a wheel element
    function createWheel() {
        const wheel = document.createElement('div');
        wheel.style.position = 'absolute';
        wheel.style.width = '5px';
        wheel.style.height = '10px';
        wheel.style.backgroundColor = '#333';
        return wheel;
    }
    
    // Create obstacle
    function createObstacle() {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        
        // Random size and position
        const width = Math.floor(Math.random() * 50) + 20;
        const height = Math.floor(Math.random() * 20) + 20;
        const left = Math.floor(Math.random() * (gameWidth - width - 20)) + 10;
        
        obstacle.style.width = width + 'px';
        obstacle.style.height = height + 'px';
        obstacle.style.left = left + 'px';
        obstacle.style.top = '-50px'; // Start further above
        
        road.appendChild(obstacle);
        
        // Add to our tracking array with position data
        obstacles.push({
            element: obstacle,
            top: -50,
            left: left,
            width: width,
            height: height
        });
        
        // Force a reflow
        obstacle.getBoundingClientRect();
    }
    
    // Player hit function (when colliding with enemy or obstacle)
    function playerHit() {
        // If player is already invincible, do nothing
        if (invincible) return;
        
        // Reduce lives
        lives--;
        updateLivesDisplay();
        
        // Play dying sound when player loses a heart
        dyingSound.currentTime = 0; // Reset sound to beginning
        dyingSound.play().catch(e => console.log("Dying sound play failed:", e));
        
        // Check if game over
        if (lives <= 0) {
            gameOver();
            return;
        }
        
        // Make player invincible temporarily
        invincible = true;
        invincibleEndTime = gameTime + invincibleDuration;
        
        // Visual feedback for being hit
        player.classList.add('player-hit');
        
        // Flash player to indicate invincibility
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            player.style.opacity = player.style.opacity === '0.5' ? '1' : '0.5';
            flashCount++;
            if (flashCount >= 10) { // Flash 5 times (10 toggles)
                clearInterval(flashInterval);
                player.style.opacity = '1';
                player.classList.remove('player-hit');
            }
        }, 200);
    }
    
    // Check if invincibility should end
    function checkInvincibility() {
        if (invincible && gameTime >= invincibleEndTime) {
            invincible = false;
            player.style.opacity = '1';
        }
    }
    
    // Check for scraping collision (less severe than direct hit)
    function isScrapingCollision(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        // Calculate overlap percentages
        const overlapWidth = Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left);
        const overlapHeight = Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top);
        
        // Only consider valid overlaps (positive values)
        if (overlapWidth <= 0 || overlapHeight <= 0) return false;
        
        // Calculate the smaller of the two elements' dimensions
        const minWidth = Math.min(rect1.width, rect2.width);
        const minHeight = Math.min(rect1.height, rect2.height);
        
        // Calculate overlap percentages relative to the smaller element
        const widthOverlapPercentage = overlapWidth / minWidth;
        const heightOverlapPercentage = overlapHeight / minHeight;
        
        // Check if element2 is a bus by checking its children (windows and wheels)
        const isBus = element2.children && element2.children.length > 0 && 
                      element2.style.backgroundColor === '#FFCC00'; // Yellow bus
        
        // For buses, we need to be more lenient with the height overlap percentage
        // since they are much taller than the player
        if (isBus) {
            // For buses, consider it a scrape if the width overlap is small
            // or if the height overlap is very small relative to the bus height
            return (widthOverlapPercentage < 0.4) || 
                   (overlapHeight < 30); // Fixed height threshold for buses
        } else {
            // For regular obstacles and cars, use the original logic
            // If overlap is small in either dimension, it's a scrape
            // Consider it a scrape if overlap is less than 40% in either dimension
            return (widthOverlapPercentage < 0.4 || heightOverlapPercentage < 0.4) && 
                   (widthOverlapPercentage > 0 && heightOverlapPercentage > 0);
        }
    }
    
    // Update enemies with direct position tracking
    function updateEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemyObj = enemies[i];
            const enemy = enemyObj.element;
            
            // Update position in our tracking object
            enemyObj.top += enemySpeed;
            
            // Special movement for snake cars
            if (enemyObj.type === 'snakeCar') {
                // Calculate horizontal position using sine wave
                const progress = enemyObj.top / gameHeight; // Normalized progress down the screen
                const sineValue = Math.sin(progress * Math.PI * 10 * enemyObj.frequency);
                enemyObj.left = enemyObj.initialX + sineValue * enemyObj.amplitude * enemyObj.direction;
                
                // Keep the car within the road boundaries
                if (enemyObj.left < 50) enemyObj.left = 50;
                if (enemyObj.left > gameWidth - 100) enemyObj.left = gameWidth - 100;
                
                // Update horizontal position
                enemy.style.left = enemyObj.left + 'px';
            }
            
            // Apply the new position
            enemy.style.top = enemyObj.top + 'px';
            
            // Check if enemy has passed the screen
            if (enemyObj.top > gameHeight) {
                // Enemy passed, remove it and increase score
                enemy.remove();
                enemies.splice(i, 1);
                
                // Give different points based on enemy type
                let pointsEarned = 0;
                if (enemyObj.type === 'bus') {
                    pointsEarned = 3 * pointMultiplier; // 3 points for buses
                } else if (enemyObj.type === 'snakeCar') {
                    pointsEarned = 2 * pointMultiplier; // 2 points for snake cars
                } else {
                    pointsEarned = 1 * pointMultiplier; // 1 point for regular cars
                }
                
                score += pointsEarned;
                scoreElement.textContent = score;
            } else {
                // Check for direct collision
                if (!invincible && isColliding(player, enemy)) {
                    // Check if it's just a scrape
                    if (isScrapingCollision(player, enemy)) {
                        // Visual feedback for scraping
                        player.classList.add('player-scrape');
                        setTimeout(() => {
                            player.classList.remove('player-scrape');
                        }, 300);
                    } else {
                        // It's a direct hit
                        playerHit();
                        
                        // Remove the enemy
                        enemy.remove();
                        enemies.splice(i, 1);
                    }
                }
            }
        }
    }
    
    // Update obstacles
    function updateObstacles() {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacleObj = obstacles[i];
            const obstacle = obstacleObj.element;
            
            // Update position in our tracking object
            obstacleObj.top += obstacleSpeed;
            
            // Apply the new position
            obstacle.style.top = obstacleObj.top + 'px';
            
            // Check if obstacle has passed the screen
            if (obstacleObj.top > gameHeight) {
                // Obstacle passed, remove it
                obstacle.remove();
                obstacles.splice(i, 1);
            } else {
                // Check for direct collision
                if (!invincible && isColliding(player, obstacle)) {
                    // Check if it's just a scrape
                    if (isScrapingCollision(player, obstacle)) {
                        // Visual feedback for scraping
                        player.classList.add('player-scrape');
                        setTimeout(() => {
                            player.classList.remove('player-scrape');
                        }, 300);
                    } else {
                        // It's a direct hit
                        playerHit();
                        
                        // Remove the obstacle
                        obstacle.remove();
                        obstacles.splice(i, 1);
                    }
                }
            }
        }
    }
    
    // Check collision between two elements
    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        // Reduce hitbox size by creating an inner rectangle
        // For player car and enemy cars, reduce the hitbox by 10px on each side
        let adjustedRect1 = {
            left: rect1.left,
            right: rect1.right,
            top: rect1.top,
            bottom: rect1.bottom
        };
        
        let adjustedRect2 = {
            left: rect2.left,
            right: rect2.right,
            top: rect2.top,
            bottom: rect2.bottom
        };
        
        // If element1 is the player car, reduce its hitbox
        if (element1.id === 'player') {
            adjustedRect1.left += 10;
            adjustedRect1.right -= 10;
            adjustedRect1.top += 10;
            adjustedRect1.bottom -= 10;
        }
        
        // Check if element2 is a bus by checking its children (windows and wheels)
        const isBus = element2.children && element2.children.length > 0 && 
                      element2.style.backgroundColor === '#FFCC00'; // Yellow bus
        
        // Check if element2 is a coin container
        const isCoinContainer = element2.children && 
                               element2.children.length > 0 && 
                               element2.children[0].style.backgroundColor === '#FFD700';
        
        // If element2 is a car or bus, reduce its hitbox
        if (element2.style.backgroundImage && element2.style.backgroundImage.includes('svg')) {
            // For regular cars with SVG background
            adjustedRect2.left += 10;
            adjustedRect2.right -= 10;
            adjustedRect2.top += 10;
            adjustedRect2.bottom -= 10;
        } else if (isBus) {
            // For buses (which now use DOM elements instead of SVG)
            adjustedRect2.left += 10;
            adjustedRect2.right -= 10;
            adjustedRect2.top += 15; // More forgiving at the top
            adjustedRect2.bottom -= 15; // More forgiving at the bottom
        }
        // For coin containers, we use the container's hitbox directly
        // No adjustment needed as we've already sized the container appropriately
        
        // Debug visualization
        if (debugMode) {
            visualizeHitbox(adjustedRect1, 'red');
            visualizeHitbox(adjustedRect2, 'blue');
        }
        
        return !(
            adjustedRect1.right < adjustedRect2.left ||
            adjustedRect1.left > adjustedRect2.right ||
            adjustedRect1.bottom < adjustedRect2.top ||
            adjustedRect1.top > adjustedRect2.bottom
        );
    }
    
    // Helper function to visualize hitboxes for debugging
    function visualizeHitbox(rect, color) {
        // Remove any existing hitbox visualization with the same color
        const existingHitboxes = document.querySelectorAll(`.debug-hitbox-${color}`);
        existingHitboxes.forEach(box => box.remove());
        
        const hitbox = document.createElement('div');
        hitbox.style.position = 'absolute';
        hitbox.style.left = rect.left + 'px';
        hitbox.style.top = rect.top + 'px';
        hitbox.style.width = (rect.right - rect.left) + 'px';
        hitbox.style.height = (rect.bottom - rect.top) + 'px';
        hitbox.style.border = `2px solid ${color}`;
        hitbox.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        hitbox.style.zIndex = '100';
        hitbox.style.pointerEvents = 'none';
        hitbox.className = `debug-hitbox-${color}`; // Add class for easy removal
        document.body.appendChild(hitbox);
        
        // Remove after a short delay
        setTimeout(() => {
            hitbox.remove();
        }, 100); // Shorter delay to avoid trail effect
    }
    
    // Increase difficulty over time
    function increaseDifficulty() {
        if (gameTime % difficultyIncreaseInterval === 0 && gameTime > 0) {
            enemySpeed += 0.5;
            obstacleSpeed += 0.5;
            
            // Decrease spawn intervals
            if (enemyInterval > 800) {
                enemyInterval -= 100;
            }
            
            if (obstacleInterval > 1500) {
                obstacleInterval -= 200;
            }
        }
    }
    
    // Check for level advancement
    function checkLevelAdvancement() {
        if (score >= scoreForNextLevel) {
            // Advance to next level
            level++;
            document.getElementById('currentLevel').textContent = level;
            
            // Reset heart spawned flag for the new level, but only if it's a level divisible by 3
            if (level % 3 === 0) {
                heartSpawned = false;
            }
            
            // Check if we need to double points (every 10 levels)
            if (level % 10 === 0) {
                pointMultiplier *= 2;
                basePointsPerLevel *= 2;
            }
            
            // Calculate score needed for next level
            scoreForNextLevel = level * basePointsPerLevel;
            
            // Increase speeds
            enemySpeed += 0.8; // Reduced from 1
            obstacleSpeed += 0.8; // Reduced from 1
            heartSpeed += 0.5; // Increase heart speed as well
            
            // Decrease spawn intervals
            enemyInterval = Math.max(1000, enemyInterval - 100);
            obstacleInterval = Math.max(1800, obstacleInterval - 150);
            coinInterval = Math.max(1800, coinInterval - 100);
            bananaInterval = Math.max(2200, bananaInterval - 150);
            
            // Adjust bus interval if buses are active
            if (level >= enemyTiers.buses) {
                busInterval = Math.max(3000, busInterval - 200);
            }
            
            // Adjust snake car interval if snake cars are active
            if (level >= enemyTiers.snakeCars) {
                snakeCarInterval = Math.max(2500, snakeCarInterval - 150);
            }
            
            // Speed up road animation
            const currentDuration = parseFloat(getComputedStyle(road).animationDuration);
            const newDuration = Math.max(0.25, currentDuration - 0.05);
            road.style.animationDuration = newDuration + 's';
            
            // Show level up notification
            showLevelUpNotification();
        }
    }
    
    // Show level up notification
    function showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'level-notification';
        
        // Basic level up message
        let message = 'LEVEL ' + level + '!';
        
        // Special messages for tier unlocks
        let isNewEnemyLevel = false;
        let isPointsDoubledLevel = false;
        
        if (level === enemyTiers.enemies) {
            message += '<br><span class="unlock-message">BLUE ENEMY CARS UNLOCKED!</span>';
            isNewEnemyLevel = true;
        } else if (level === enemyTiers.buses) {
            message += '<br><span class="unlock-message bus-unlock">YELLOW BUSES UNLOCKED!</span>';
            isNewEnemyLevel = true;
        } else if (level === enemyTiers.snakeCars) {
            message += '<br><span class="unlock-message snake-unlock">RED SNAKE CARS UNLOCKED!</span>';
            isNewEnemyLevel = true;
        }
        
        // Add message for point doubling levels (10, 20, 30, etc.)
        if (level % 10 === 0) {
            message += '<br><span class="unlock-message points-doubled">POINTS DOUBLED!</span>';
            message += '<br><span class="unlock-message points-doubled">LEVEL REQUIREMENTS DOUBLED!</span>';
            isPointsDoubledLevel = true;
        }
        
        // Play new level sound when a new enemy type is introduced or points are doubled
        if (isNewEnemyLevel || isPointsDoubledLevel) {
            // Store the original music volume
            const originalVolume = backgroundMusic.volume;
            
            // Reduce background music volume temporarily (to 30% of its current value)
            backgroundMusic.volume = originalVolume * 0.3;
            
            // Play the new level sound
            newLevelSound.currentTime = 0; // Reset to beginning
            newLevelSound.play().catch(e => console.log("New level sound play failed:", e));
            
            // Restore original volume after the sound finishes (approximately 2 seconds)
            setTimeout(() => {
                // Gradually restore volume for a smoother transition
                const fadeIn = setInterval(() => {
                    if (backgroundMusic.volume < originalVolume) {
                        backgroundMusic.volume = Math.min(originalVolume, backgroundMusic.volume + 0.05);
                    } else {
                        clearInterval(fadeIn);
                    }
                }, 100);
            }, 2000);
        }
        
        notification.innerHTML = message;
        notification.style.position = 'absolute';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.color = '#FFCC00';
        notification.style.fontSize = '36px';
        notification.style.fontWeight = 'bold';
        notification.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.7)';
        notification.style.zIndex = '50';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-in-out';
        notification.style.textAlign = 'center';
        
        road.appendChild(notification);
        
        // Animate the notification
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // For special tier unlocks or point doubling, show the notification longer
        const displayTime = (isNewEnemyLevel || isPointsDoubledLevel) ? 2500 : 1500;
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, displayTime);
    }
    
    // Create green snake car that moves side to side
    function createSnakeCar() {
        // Create the snake car element
        const snakeCar = document.createElement('div');
        
        // Set the initial position with inline styles before adding to DOM
        snakeCar.style.position = 'absolute';
        snakeCar.style.width = '50px';
        snakeCar.style.height = '80px';
        snakeCar.style.backgroundSize = 'contain';
        snakeCar.style.backgroundRepeat = 'no-repeat';
        snakeCar.style.backgroundPosition = 'center';
        snakeCar.style.zIndex = '5';
        
        // Set the snake car image - similar to enemy car but red
        snakeCar.style.backgroundImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 80\"><rect x=\"10\" y=\"5\" width=\"30\" height=\"70\" rx=\"5\" fill=\"%23ff4757\"/><rect x=\"15\" y=\"15\" width=\"20\" height=\"15\" rx=\"2\" fill=\"%23333\"/><rect x=\"15\" y=\"50\" width=\"20\" height=\"15\" rx=\"2\" fill=\"%23333\"/><rect x=\"5\" y=\"20\" width=\"5\" height=\"10\" fill=\"%23333\"/><rect x=\"5\" y=\"50\" width=\"5\" height=\"10\" fill=\"%23333\"/><rect x=\"40\" y=\"20\" width=\"5\" height=\"10\" fill=\"%23333\"/><rect x=\"40\" y=\"50\" width=\"5\" height=\"10\" fill=\"%23333\"/></svg>')";
        
        // Random starting lane
        const lanes = [100, 275, 450];
        const randomLane = Math.floor(Math.random() * 3);
        
        // Set initial position above the visible area
        snakeCar.style.left = lanes[randomLane] + 'px';
        snakeCar.style.top = '-120px';
        
        // Add to the DOM
        road.appendChild(snakeCar);
        
        // Add to our tracking array with additional properties for snake movement
        enemies.push({
            element: snakeCar,
            top: -120,
            left: lanes[randomLane],
            type: 'snakeCar',
            // Snake movement properties
            direction: Math.random() < 0.5 ? -1 : 1, // Random initial direction (left or right)
            amplitude: Math.floor(Math.random() * 50) + 50, // Random amplitude between 50-100px
            frequency: Math.random() * 0.02 + 0.01, // Random frequency
            initialX: lanes[randomLane] // Store initial X position for sine wave calculation
        });
        
        // Force a reflow
        snakeCar.getBoundingClientRect();
    }
    
    // Create heart power-up
    function createHeart() {
        // Create a container for the heart
        const heartContainer = document.createElement('div');
        heartContainer.style.position = 'absolute';
        heartContainer.style.width = '40px';
        heartContainer.style.height = '40px';
        heartContainer.style.zIndex = '5';
        heartContainer.className = 'heart-container'; // Add class for swaying animation
        
        // Create the visual heart element
        const visualHeart = document.createElement('div');
        visualHeart.style.position = 'absolute';
        visualHeart.style.width = '30px';
        visualHeart.style.height = '30px';
        visualHeart.style.left = '5px';
        visualHeart.style.top = '5px';
        visualHeart.innerHTML = '❤️';
        visualHeart.style.fontSize = '30px';
        visualHeart.style.animation = 'heartbeat 1s infinite alternate';
        
        // Add visual heart to container
        heartContainer.appendChild(visualHeart);
        
        // Create invisible hitbox element (for debug mode)
        if (debugMode) {
            const hitboxVisualizer = document.createElement('div');
            hitboxVisualizer.style.position = 'absolute';
            hitboxVisualizer.style.width = '100%';
            hitboxVisualizer.style.height = '100%';
            hitboxVisualizer.style.border = '2px solid pink';
            hitboxVisualizer.style.backgroundColor = 'rgba(255, 192, 203, 0.2)';
            hitboxVisualizer.style.zIndex = '1';
            heartContainer.appendChild(hitboxVisualizer);
        }
        
        // Random position on the road (3 lanes with slight variation)
        const lanes = [100, 275, 450];
        const randomLane = Math.floor(Math.random() * 3);
        const randomOffset = Math.floor(Math.random() * 30) - 15; // Small random offset for variety
        
        // Set initial position above the visible area
        const left = lanes[randomLane] + randomOffset;
        heartContainer.style.left = left + 'px';
        heartContainer.style.top = '-40px';
        
        // Add to the DOM
        road.appendChild(heartContainer);
        
        // Add to our tracking array
        hearts.push({
            element: heartContainer,
            top: -40,
            left: left
        });
        
        // Reset heart spawned flag
        heartSpawned = true;
        
        // Force a reflow
        heartContainer.getBoundingClientRect();
    }
    
    // Update hearts
    function updateHearts() {
        for (let i = hearts.length - 1; i >= 0; i--) {
            const heartObj = hearts[i];
            const heart = heartObj.element;
            
            // Update position in our tracking object
            heartObj.top += heartSpeed; // Hearts move faster than other elements
            
            // Apply the new position
            heart.style.top = heartObj.top + 'px';
            
            // Check if heart has passed the screen
            if (heartObj.top > gameHeight) {
                // Heart passed, remove it
                heart.remove();
                hearts.splice(i, 1);
            } else {
                // Check collision with player (heart collection)
                if (isColliding(player, heart)) {
                    // Heart collected, increase lives if below max
                    if (lives < maxLives) {
                        lives++;
                        updateLivesDisplay();
                        
                        // Play heart collection sound
                        heartSound.currentTime = 0; // Reset sound to beginning
                        heartSound.play().catch(e => console.log("Heart sound play failed:", e));
                        
                        // Show a heart popup
                        showHeartPopup(heartObj.left, heartObj.top, "+1 ❤️");
                    } else {
                        // Already at max lives, show max lives message
                        showHeartPopup(heartObj.left, heartObj.top, "MAX ❤️");
                    }
                    
                    // Award 15 points for collecting a heart
                    const pointsEarned = 15 * pointMultiplier;
                    score += pointsEarned;
                    scoreElement.textContent = score;
                    
                    // Show score popup
                    showScorePopup(heartObj.left, heartObj.top + 30, "+" + pointsEarned);
                    
                    // Remove the heart
                    heart.remove();
                    hearts.splice(i, 1);
                }
            }
        }
    }
    
    // Show heart popup when collecting hearts
    function showHeartPopup(x, y, text) {
        const popup = document.createElement('div');
        popup.innerHTML = text;
        popup.style.position = 'absolute';
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        popup.style.color = '#ff4757';
        popup.style.fontWeight = 'bold';
        popup.style.fontSize = '20px';
        popup.style.textShadow = '0 0 5px black';
        popup.style.zIndex = '10';
        popup.style.pointerEvents = 'none'; // Don't interfere with game interaction
        
        road.appendChild(popup);
        
        // Animate the popup
        let opacity = 1;
        let posY = y;
        
        const animatePopup = () => {
            opacity -= 0.02;
            posY -= 1;
            popup.style.opacity = opacity;
            popup.style.top = posY + 'px';
            
            if (opacity > 0) {
                requestAnimationFrame(animatePopup);
            } else {
                popup.remove();
            }
        };
        
        requestAnimationFrame(animatePopup);
    }
    
    // Main game loop
    function gameLoop(timestamp) {
        if (!gameActive || gamePaused) return;
        
        // Calculate time difference
        const deltaTime = timestamp - gameTime;
        gameTime = timestamp;
        
        // Check if invincibility should end
        checkInvincibility();
        
        // Spawn enemies at intervals - only if we've reached the appropriate level
        if (timestamp - lastEnemyTime > enemyInterval && shouldSpawnEnemyType('enemies')) {
            createEnemy();
            lastEnemyTime = timestamp;
        }
        
        // Spawn buses at intervals - only if we've reached level 10
        if (timestamp - lastBusTime > busInterval && shouldSpawnEnemyType('buses')) {
            createBus();
            lastBusTime = timestamp;
        }
        
        // Spawn snake cars at intervals - only if we've reached level 15
        if (timestamp - lastSnakeCarTime > snakeCarInterval && shouldSpawnEnemyType('snakeCars')) {
            createSnakeCar();
            lastSnakeCarTime = timestamp;
        }
        
        // Spawn obstacles at intervals - always available from level 1
        if (timestamp - lastObstacleTime > obstacleInterval && shouldSpawnEnemyType('obstacles')) {
            createObstacle();
            lastObstacleTime = timestamp;
        }
        
        // Spawn coins at intervals - always available
        if (timestamp - lastCoinTime > coinInterval) {
            createCoin();
            lastCoinTime = timestamp;
        }
        
        // Spawn tire strips at intervals - only if we've reached the appropriate level
        if (timestamp - lastBananaTime > bananaInterval && shouldSpawnEnemyType('bananas')) {
            createBanana();
            lastBananaTime = timestamp;
        }
        
        // Spawn a heart only on levels divisible by 3 (3, 6, 9, etc.) if not already spawned
        if (!heartSpawned && level % 3 === 0) {
            createHeart();
        }
        
        // Update game elements
        movePlayer(); // Now called in game loop for continuous movement
        updateEnemies();
        updateObstacles();
        updateCoins(); // Update coins
        updateBananas(); // Update tire strips
        updateHearts(); // Update hearts
        
        // Check for level advancement
        checkLevelAdvancement();
        
        // Continue game loop
        animationId = requestAnimationFrame(gameLoop);
    }
}); 