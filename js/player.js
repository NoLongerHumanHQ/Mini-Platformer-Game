/**
 * Player class for the platformer game
 */
class Player {
    constructor(x, y, width = 32, height = 48) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Velocity
        this.vx = 0;
        this.vy = 0;
        
        // Movement properties
        this.speed = 0.4;          // Acceleration rate
        this.maxSpeed = 6;         // Maximum horizontal speed
        this.jumpForce = -12;      // Initial jump velocity
        this.minJumpForce = -6;    // Minimum jump velocity for short press
        this.jumpHoldTime = 200;   // Maximum time to hold jump in ms
        
        // State flags
        this.onGround = false;
        this.jumping = false;
        this.jumpStartTime = 0;
        this.facingRight = true;
        this.health = 3;
        this.maxHealth = 3;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 1500; // ms
        
        // Controls state
        this.keys = {
            left: false,
            right: false,
            jump: false
        };
        
        // Animation state
        this.state = 'idle';       // idle, running, jumping, falling
        this.frame = 0;
        this.frameTime = 0;
        this.frameDuration = 100;  // ms per frame
        this.sprites = null;       // Will hold sprite sheets
        
        // Setup input handlers
        this._setupInputHandlers();
        
        // Create event emitter for player events
        this.events = Utils.createEventEmitter();
    }
    
    /**
     * Load player sprites
     */
    async loadSprites() {
        // For now, use colored rectangles as placeholders
        // In a real game, you would load sprite sheets here
        this.sprites = {
            idle: '#4a90e2',
            running: '#5cb3fd',
            jumping: '#3a7ab8',
            falling: '#2c5d8a',
            hurt: '#e74c3c'
        };
        
        // You would typically do something like:
        // this.sprites = await Utils.loadAssets({
        //     idle: 'assets/images/player/idle.png',
        //     running: 'assets/images/player/running.png',
        //     // etc.
        // });
    }
    
    /**
     * Update player state
     * @param {Number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        // Handle movement based on key presses
        this._handleMovement(deltaTime);
        
        // Handle jumping
        this._handleJumping(deltaTime);
        
        // Update animation state
        this._updateAnimationState(deltaTime);
        
        // Handle invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer -= deltaTime;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    /**
     * Draw player on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Number} offsetX - Camera X offset
     * @param {Number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        ctx.save();
        
        // For simple placeholder graphics, use rectangles with colors
        // In a real game, you would draw sprites based on the current animation frame
        
        if (this.invulnerable && Math.floor(performance.now() / 100) % 2) {
            // Flash when invulnerable
            ctx.globalAlpha = 0.5;
        }
        
        ctx.fillStyle = this.sprites[this.state] || '#4a90e2';
        ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
        
        // Draw a small indicator for direction
        if (this.facingRight) {
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x - offsetX + this.width - 8, this.y - offsetY + 10, 6, 6);
        } else {
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x - offsetX + 2, this.y - offsetY + 10, 6, 6);
        }
        
        ctx.restore();
    }
    
    /**
     * Make player take damage
     * @param {Number} amount - Amount of damage to take
     * @param {Number} knockbackX - Horizontal knockback force
     * @param {Number} knockbackY - Vertical knockback force
     */
    takeDamage(amount = 1, knockbackX = 0, knockbackY = -5) {
        if (this.invulnerable) return;
        
        this.health -= amount;
        this.invulnerable = true;
        this.invulnerableTimer = this.invulnerableDuration;
        
        // Apply knockback
        this.vx = knockbackX * (this.facingRight ? -1 : 1); // Knockback opposite to facing direction
        this.vy = knockbackY;
        
        // Emit damage event
        this.events.emit('damage', { health: this.health });
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Handle player death
     */
    die() {
        this.events.emit('death');
    }
    
    /**
     * Reset player to initial state
     * @param {Number} x - X position to reset to
     * @param {Number} y - Y position to reset to
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.state = 'idle';
    }
    
    /**
     * Handle movement based on key presses
     * @private
     */
    _handleMovement(deltaTime) {
        // Horizontal movement
        if (this.keys.left) {
            this.vx -= this.speed * (deltaTime / 16.67); // Adjust for framerate
            this.facingRight = false;
        }
        
        if (this.keys.right) {
            this.vx += this.speed * (deltaTime / 16.67);
            this.facingRight = true;
        }
        
        // Limit horizontal speed
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
    }
    
    /**
     * Handle jumping mechanics
     * @private
     */
    _handleJumping(deltaTime) {
        // Start jump
        if (this.keys.jump && this.onGround && !this.jumping) {
            this.jumping = true;
            this.jumpStartTime = performance.now();
            this.vy = this.jumpForce;
            this.onGround = false;
            
            // Emit jump event
            this.events.emit('jump');
        }
        
        // Variable jump height based on how long jump key is held
        if (this.jumping && !this.keys.jump) {
            // Early release - shorter jump
            const jumpTime = performance.now() - this.jumpStartTime;
            
            if (jumpTime < this.jumpHoldTime && this.vy < this.minJumpForce) {
                this.vy = this.minJumpForce;
            }
            
            this.jumping = false;
        }
        
        // End jump when reached max hold time
        if (this.jumping && performance.now() - this.jumpStartTime > this.jumpHoldTime) {
            this.jumping = false;
        }
    }
    
    /**
     * Update animation state based on player movement
     * @private
     */
    _updateAnimationState(deltaTime) {
        // Determine animation state
        if (!this.onGround) {
            this.state = this.vy < 0 ? 'jumping' : 'falling';
        } else if (Math.abs(this.vx) > 0.5) {
            this.state = 'running';
        } else {
            this.state = 'idle';
        }
        
        // Update animation frame
        this.frameTime += deltaTime;
        
        if (this.frameTime >= this.frameDuration) {
            this.frame = (this.frame + 1) % 4; // Assuming 4 frames per animation
            this.frameTime = 0;
        }
    }
    
    /**
     * Setup keyboard input handlers
     * @private
     */
    _setupInputHandlers() {
        // Keyboard event listeners
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.keys.right = true;
                    break;
                case 'ArrowUp':
                case 'w':
                case ' ':
                    this.keys.jump = true;
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'w':
                case ' ':
                    this.keys.jump = false;
                    break;
            }
        });
    }
} 