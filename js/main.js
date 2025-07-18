/**
 * Main entry point for the platformer game
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Create and initialize the game
    const game = new Game('gameCanvas');
    await game.init();
    
    // Handle keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'p':
            case 'P':
                // Toggle pause
                if (game.currentState === 'playing') {
                    if (game.paused) {
                        game.resume();
                    } else {
                        game.pause();
                    }
                }
                break;
                
            case 'r':
            case 'R':
                // Quick restart
                if (game.currentState === 'playing' || game.currentState === 'gameOver') {
                    game.startGame();
                }
                break;
                
            case 'Escape':
                // Go to main menu
                if (game.currentState === 'playing') {
                    game._showMainMenu();
                }
                break;
        }
    });
    
    // Handle window focus/blur events
    window.addEventListener('blur', () => {
        // Auto-pause when window loses focus
        if (game.currentState === 'playing' && !game.paused) {
            game.pause();
        }
    });
    
    // Handle mobile touch controls (optional)
    setupTouchControls(game);
    
    // Prevent context menu on right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Handle window resizing
    window.addEventListener('resize', () => {
        // The game class already handles canvas resizing
        // Additional responsive UI adjustments can be added here
    });
    
    console.log('Game setup complete!');
});

/**
 * Set up touch controls for mobile devices
 * @param {Game} game - Game instance
 */
function setupTouchControls(game) {
    // Check if device supports touch events
    if (!('ontouchstart' in window)) return;
    
    // Create touch control elements
    const touchControls = document.createElement('div');
    touchControls.className = 'touch-controls';
    touchControls.innerHTML = `
        <div class="d-pad">
            <button id="left-btn">←</button>
            <button id="right-btn">→</button>
        </div>
        <div class="action-buttons">
            <button id="jump-btn">Jump</button>
        </div>
    `;
    
    // Append touch controls to the game container
    const gameContainer = document.querySelector('.game-container');
    gameContainer.appendChild(touchControls);
    
    // Handle touch controls
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const jumpBtn = document.getElementById('jump-btn');
    
    // Left button
    leftBtn.addEventListener('touchstart', () => {
        game.player.keys.left = true;
    });
    leftBtn.addEventListener('touchend', () => {
        game.player.keys.left = false;
    });
    
    // Right button
    rightBtn.addEventListener('touchstart', () => {
        game.player.keys.right = true;
    });
    rightBtn.addEventListener('touchend', () => {
        game.player.keys.right = false;
    });
    
    // Jump button
    jumpBtn.addEventListener('touchstart', () => {
        game.player.keys.jump = true;
    });
    jumpBtn.addEventListener('touchend', () => {
        game.player.keys.jump = false;
    });
    
    // Add touch control styles
    const style = document.createElement('style');
    style.textContent = `
        .touch-controls {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            pointer-events: none;
            z-index: 100;
        }
        
        .d-pad, .action-buttons {
            display: flex;
            pointer-events: auto;
        }
        
        .d-pad {
            margin-left: 20px;
        }
        
        .action-buttons {
            margin-right: 20px;
        }
        
        .touch-controls button {
            width: 60px;
            height: 60px;
            margin: 0 5px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.5);
            color: white;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        
        #jump-btn {
            width: 80px;
            height: 80px;
            background-color: rgba(92, 179, 253, 0.5);
        }
    `;
    
    document.head.appendChild(style);
} 