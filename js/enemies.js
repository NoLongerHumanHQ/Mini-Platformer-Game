/**
 * Base Enemy class for the platformer game
 */
class Enemy {
    constructor(x, y, width = 32, height = 32, color = '#e74c3c') {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Velocity
        this.vx = 0;
        this.vy = 0;
        
        // State
        this.health = 1;
        this.damage = 1;
        this.color = color;
        this.onGround = false;
        this.active = true;
        this.facingRight = true;
        
        // Animation
        this.frame = 0;
        this.frameTime = 0;
        this.frameDuration = 150;  // ms per frame
    }
    
    /**
     * Update enemy state
     * @param {Number} deltaTime - Time since last frame in milliseconds
     * @param {Object} player - Player object for AI targeting
     */
    update(deltaTime, player) {
        // Base update logic - to be overridden by specific enemy types
        
        // Update animation frame
        this.frameTime += deltaTime;
        if (this.frameTime >= this.frameDuration) {
            this.frame = (this.frame + 1) % 4; // Assuming 4 frames per animation
            this.frameTime = 0;
        }
    }
    
    /**
     * Draw enemy on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Number} offsetX - Camera X offset
     * @param {Number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        if (!this.active) return;
        
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
        
        // Draw a small indicator for direction
        if (this.facingRight) {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x - offsetX + this.width - 8, this.y - offsetY + 8, 6, 6);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x - offsetX + 2, this.y - offsetY + 8, 6, 6);
        }
        
        ctx.restore();
    }
    
    /**
     * Check for collision with player
     * @param {Object} player - Player object
     * @returns {Boolean} - True if collision detected
     */
    checkPlayerCollision(player) {
        if (!this.active) return false;
        
        return Utils.checkCollision(this, player);
    }
    
    /**
     * Handle enemy taking damage
     * @param {Number} amount - Amount of damage to take
     * @param {Number} knockbackX - Horizontal knockback
     * @param {Number} knockbackY - Vertical knockback
     */
    takeDamage(amount = 1, knockbackX = 0, knockbackY = -3) {
        this.health -= amount;
        
        // Apply knockback
        this.vx += knockbackX * (this.facingRight ? -1 : 1);
        this.vy = knockbackY;
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Handle enemy death
     */
    die() {
        this.active = false;
    }
    
    /**
     * Reset enemy to initial state
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.active = true;
        this.health = 1; // Reset to default health
    }
}

/**
 * PatrolEnemy - Moves back and forth on platforms
 */
class PatrolEnemy extends Enemy {
    constructor(x, y, width = 32, height = 32, patrolDistance = 100) {
        super(x, y, width, height, '#e74c3c');
        
        this.startX = x;
        this.patrolDistance = patrolDistance;
        this.speed = 1.5;
        this.movingRight = true;
    }
    
    update(deltaTime, player) {
        super.update(deltaTime, player);
        
        if (!this.active) return;
        
        // Patrol logic - move back and forth
        if (this.movingRight) {
            this.vx = this.speed;
            if (this.x >= this.startX + this.patrolDistance) {
                this.movingRight = false;
                this.facingRight = false;
            }
        } else {
            this.vx = -this.speed;
            if (this.x <= this.startX) {
                this.movingRight = true;
                this.facingRight = true;
            }
        }
        
        // Turn around if hit a wall or about to fall off
        if (this.collisionSide === 'left' || this.collisionSide === 'right') {
            this.movingRight = !this.movingRight;
            this.facingRight = this.movingRight;
        }
    }
}

/**
 * JumperEnemy - Jumps periodically toward the player
 */
class JumperEnemy extends Enemy {
    constructor(x, y, width = 32, height = 40) {
        super(x, y, width, height, '#9b59b6');
        
        this.jumpForce = -9;
        this.jumpCooldown = 2000;  // ms between jumps
        this.jumpTimer = 0;
        this.detectionRange = 200; // Detection radius for player
    }
    
    update(deltaTime, player) {
        super.update(deltaTime, player);
        
        if (!this.active) return;
        
        // Jump when player is in range and cooldown is over
        this.jumpTimer -= deltaTime;
        
        if (this.onGround && this.jumpTimer <= 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If player is in detection range, jump toward them
            if (distance < this.detectionRange) {
                this.vy = this.jumpForce;
                this.jumpTimer = this.jumpCooldown;
                
                // Set horizontal velocity toward player
                this.vx = dx > 0 ? 3 : -3;
                this.facingRight = dx > 0;
            }
        }
        
        // Slow down horizontal movement when in air
        if (!this.onGround) {
            this.vx *= 0.98;
        }
    }
}

/**
 * Factory function for creating enemies
 */
const createEnemy = (type, x, y, options = {}) => {
    switch (type.toLowerCase()) {
        case 'patrol':
            return new PatrolEnemy(x, y, options.width, options.height, options.patrolDistance);
        case 'jumper':
            return new JumperEnemy(x, y, options.width, options.height);
        default:
            return new PatrolEnemy(x, y); // Default to patrol enemy
    }
}; 