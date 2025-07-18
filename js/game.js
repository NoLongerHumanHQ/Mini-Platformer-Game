/**
 * Main Game class for the platformer game
 */
class Game {
    constructor(canvasId) {
        // Initialize canvas and context
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas to fit container
        this._resizeCanvas();
        
        // Game state
        this.currentState = 'mainMenu'; // mainMenu, playing, gameOver, levelComplete
        this.paused = false;
        this.score = 0;
        this.currentLevelIndex = 0;
        this.levels = [];
        
        // Initialize game systems
        this.physics = new Physics();
        this.player = new Player(100, 400);
        this.camera = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };
        
        // Game loop variables
        this.lastFrameTime = 0;
        this.running = false;
        this.fpsCounter = {
            lastTime: 0,
            frames: 0,
            fps: 0
        };
        
        // Audio
        this.audio = {
            jump: null,
            collect: null,
            hurt: null,
            levelComplete: null,
            bgMusic: null
        };
        
        // Load game assets and setup event handlers
        this._setupEventHandlers();
        this._createLevels();
        
        // Create event emitter for game events
        this.events = Utils.createEventEmitter();
    }
    
    /**
     * Initialize and start the game
     */
    async init() {
        try {
            // Load assets
            await this._loadAssets();
            
            // Initialize player
            await this.player.loadSprites();
            
            // Setup player event handlers
            this._setupPlayerEvents();
            
            // Show initial screen
            this._showMainMenu();
            
            // Everything is ready
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastFrameTime = performance.now();
        
        // Start background music
        if (this.audio.bgMusic) {
            this.audio.bgMusic.loop = true;
            this.audio.bgMusic.volume = 0.5;
            this.audio.bgMusic.play().catch(error => console.log('Audio playback prevented:', error));
        }
        
        requestAnimationFrame(this._gameLoop.bind(this));
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.paused = true;
        
        // Pause background music
        if (this.audio.bgMusic) {
            this.audio.bgMusic.pause();
        }
    }
    
    /**
     * Resume the game
     */
    resume() {
        this.paused = false;
        
        // Resume background music
        if (this.audio.bgMusic) {
            this.audio.bgMusic.play().catch(error => console.log('Audio playback prevented:', error));
        }
    }
    
    /**
     * Reset the game to initial state
     */
    reset() {
        this.score = 0;
        this.currentLevelIndex = 0;
        
        // Reset levels
        this.levels.forEach(level => level.reset());
        
        // Load first level
        this._loadLevel(0);
        
        // Update UI
        this._updateUI();
    }
    
    /**
     * Start a new game
     */
    startGame() {
        this.currentState = 'playing';
        this.reset();
        this.start();
        
        // Hide menu, show game UI
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('controls-menu').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
    }
    
    /**
     * End current game
     */
    endGame() {
        this.currentState = 'gameOver';
        
        // Show game over screen
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;
    }
    
    /**
     * Complete current level
     */
    completeLevel() {
        this.currentState = 'levelComplete';
        
        // Show level complete screen
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('level-complete').classList.remove('hidden');
        document.getElementById('level-score').textContent = this.score;
        
        // Play completion sound
        if (this.audio.levelComplete) {
            this.audio.levelComplete.play().catch(error => console.log('Audio playback prevented:', error));
        }
    }
    
    /**
     * Load the next level
     */
    nextLevel() {
        this.currentLevelIndex++;
        
        if (this.currentLevelIndex >= this.levels.length) {
            // All levels complete, end game
            this.endGame();
            return;
        }
        
        // Load next level
        this._loadLevel(this.currentLevelIndex);
        
        // Return to game
        this.currentState = 'playing';
        document.getElementById('level-complete').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
    }
    
    /**
     * Main game loop
     * @param {Number} timestamp - Current time in milliseconds
     * @private
     */
    _gameLoop(timestamp) {
        if (!this.running) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Update FPS counter
        this._updateFPS(deltaTime);
        
        // If game is paused, only redraw the current frame
        if (!this.paused) {
            this._update(deltaTime);
        }
        
        this._render();
        
        // Schedule next frame
        requestAnimationFrame(this._gameLoop.bind(this));
    }
    
    /**
     * Update game logic
     * @param {Number} deltaTime - Time since last frame in milliseconds
     * @private
     */
    _update(deltaTime) {
        // Limit delta time to avoid large jumps
        const cappedDeltaTime = Math.min(deltaTime, 32);
        
        if (this.currentState === 'playing') {
            // Update player
            this.player.update(cappedDeltaTime);
            
            // Apply physics to player
            this.physics.update(this.player, this.levels[this.currentLevelIndex].platforms, cappedDeltaTime);
            
            // Update current level
            this.levels[this.currentLevelIndex].update(cappedDeltaTime, this.player);
            
            // Update camera position
            this._updateCamera();
            
            // Check for level completion
            if (this.levels[this.currentLevelIndex].complete) {
                this.completeLevel();
            }
        }
    }
    
    /**
     * Render the game
     * @private
     */
    _render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw current level
        this.levels[this.currentLevelIndex].draw(this.ctx, this.camera.x, this.camera.y);
        
        // Draw player
        this.player.draw(this.ctx, this.camera.x, this.camera.y);
        
        // Draw FPS counter (for debugging)
        this._drawFPS();
    }
    
    /**
     * Update camera position to follow player
     * @private
     */
    _updateCamera() {
        // Target position: center camera on player
        const targetX = this.player.x - this.canvas.width / 2 + this.player.width / 2;
        const targetY = this.player.y - this.canvas.height / 2 + this.player.height / 2;
        
        // Smooth camera movement with lerp
        const lerp = 0.1;
        this.camera.x += (targetX - this.camera.x) * lerp;
        this.camera.y += (targetY - this.camera.y) * lerp;
        
        // Constrain camera within level boundaries
        const currentLevel = this.levels[this.currentLevelIndex];
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, currentLevel.width - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, currentLevel.height - this.canvas.height));
    }
    
    /**
     * Resize canvas to fit container
     * @private
     */
    _resizeCanvas() {
        const container = this.canvas.parentElement;
        
        // Adjust canvas size to fit container while maintaining aspect ratio
        const aspectRatio = 16 / 9;
        const maxWidth = container.clientWidth;
        const maxHeight = container.clientHeight;
        
        let newWidth = maxWidth;
        let newHeight = maxWidth / aspectRatio;
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = maxHeight * aspectRatio;
        }
        
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
    }
    
    /**
     * Create level objects
     * @private
     */
    _createLevels() {
        // Create sample level for now
        const sampleLevel = createSampleLevel();
        sampleLevel.setPhysics(this.physics);
        this.levels.push(sampleLevel);
        
        // In a real game, you would load multiple levels
    }
    
    /**
     * Load a specific level
     * @param {Number} levelIndex - Index of the level to load
     * @private
     */
    _loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) return;
        
        // Reset player position to level spawn point
        const spawnPos = this.levels[levelIndex].getSpawnPosition();
        this.player.reset(spawnPos.x, spawnPos.y);
        
        // Reset camera position
        this.camera.x = Math.max(0, spawnPos.x - this.canvas.width / 2);
        this.camera.y = Math.max(0, spawnPos.y - this.canvas.height / 2);
        
        // Update UI
        document.getElementById('level').querySelector('span').textContent = levelIndex + 1;
    }
    
    /**
     * Load game assets
     * @private
     */
    async _loadAssets() {
        // In a real game, you would load actual assets
        console.log('Loading game assets...');
        
        // Simulate loading audio
        this.audio = {
            jump: new Audio(),
            collect: new Audio(),
            hurt: new Audio(),
            levelComplete: new Audio(),
            bgMusic: new Audio()
        };
        
        // Placeholder for actual asset loading
        return new Promise(resolve => {
            setTimeout(resolve, 500);
        });
    }
    
    /**
     * Setup event handlers
     * @private
     */
    _setupEventHandlers() {
        // Window resize event
        window.addEventListener('resize', this._resizeCanvas.bind(this));
        
        // Button click handlers
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('controls-button').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('controls-menu').classList.remove('hidden');
        });
        
        document.getElementById('back-button').addEventListener('click', () => {
            document.getElementById('controls-menu').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });
        
        document.getElementById('next-level-button').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            this.startGame();
        });
        
        document.getElementById('menu-button').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            this._showMainMenu();
        });
    }
    
    /**
     * Setup player event handlers
     * @private
     */
    _setupPlayerEvents() {
        this.player.events.on('jump', () => {
            if (this.audio.jump) {
                this.audio.jump.currentTime = 0;
                this.audio.jump.play().catch(error => console.log('Audio playback prevented:', error));
            }
        });
        
        this.player.events.on('damage', (data) => {
            // Update health display
            document.getElementById('health').querySelector('span').textContent = data.health;
            
            if (this.audio.hurt) {
                this.audio.hurt.currentTime = 0;
                this.audio.hurt.play().catch(error => console.log('Audio playback prevented:', error));
            }
        });
        
        this.player.events.on('death', () => {
            this.endGame();
        });
        
        this.player.events.on('collectItem', (data) => {
            // Update score
            this.score += data.value;
            document.getElementById('score').querySelector('span').textContent = this.score;
            
            if (this.audio.collect) {
                this.audio.collect.currentTime = 0;
                this.audio.collect.play().catch(error => console.log('Audio playback prevented:', error));
            }
        });
        
        this.player.events.on('levelComplete', (data) => {
            // Update statistics
            const collectiblesPercentage = Math.round((data.collectibles / data.total) * 100);
            console.log(`Level complete! Collected: ${data.collectibles}/${data.total} (${collectiblesPercentage}%)`);
        });
    }
    
    /**
     * Show main menu
     * @private
     */
    _showMainMenu() {
        this.currentState = 'mainMenu';
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('controls-menu').classList.add('hidden');
        document.getElementById('level-complete').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
    }
    
    /**
     * Update UI elements
     * @private
     */
    _updateUI() {
        document.getElementById('health').querySelector('span').textContent = this.player.health;
        document.getElementById('score').querySelector('span').textContent = this.score;
        document.getElementById('level').querySelector('span').textContent = this.currentLevelIndex + 1;
    }
    
    /**
     * Update FPS counter
     * @param {Number} deltaTime - Time since last frame in milliseconds
     * @private
     */
    _updateFPS(deltaTime) {
        this.fpsCounter.frames++;
        
        // Update FPS every second
        if (performance.now() - this.fpsCounter.lastTime >= 1000) {
            this.fpsCounter.fps = this.fpsCounter.frames;
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = performance.now();
        }
    }
    
    /**
     * Draw FPS counter
     * @private
     */
    _drawFPS() {
        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`FPS: ${this.fpsCounter.fps}`, 10, 20);
        this.ctx.restore();
    }
} 