/**
 * Platform class for the platformer game
 */
class Platform {
    constructor(x, y, width, height, options = {}) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Platform properties
        this.color = options.color || '#4CAF50';
        this.jumpThrough = options.jumpThrough || false;
        this.moving = options.moving || false;
        this.crumble = options.crumble || false;
        this.invisible = options.invisible || false;
        
        // For moving platforms
        if (this.moving) {
            this.startX = x;
            this.startY = y;
            this.moveX = options.moveX || 0;
            this.moveY = options.moveY || 0;
            this.moveSpeed = options.moveSpeed || 2;
            this.movingForward = true;
            this.vx = 0;
            this.vy = 0;
            this.prevX = x;
            this.prevY = y;
        }
        
        // For crumbling platforms
        if (this.crumble) {
            this.crumbleTime = options.crumbleTime || 500;
            this.crumbleTimer = 0;
            this.crumbling = false;
            this.respawnTime = options.respawnTime || 3000;
            this.respawnTimer = 0;
            this.active = true;
        }
    }
    
    /**
     * Update platform state
     * @param {Number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        // Handle moving platform logic
        if (this.moving) {
            this.prevX = this.x;
            this.prevY = this.y;
            
            if (this.movingForward) {
                if (this.moveX !== 0) {
                    this.x += this.moveSpeed * (deltaTime / 16.67);
                    if (this.x >= this.startX + this.moveX) {
                        this.movingForward = false;
                    }
                }
                if (this.moveY !== 0) {
                    this.y += this.moveSpeed * (deltaTime / 16.67);
                    if (this.y >= this.startY + this.moveY) {
                        this.movingForward = false;
                    }
                }
            } else {
                if (this.moveX !== 0) {
                    this.x -= this.moveSpeed * (deltaTime / 16.67);
                    if (this.x <= this.startX) {
                        this.movingForward = true;
                    }
                }
                if (this.moveY !== 0) {
                    this.y -= this.moveSpeed * (deltaTime / 16.67);
                    if (this.y <= this.startY) {
                        this.movingForward = true;
                    }
                }
            }
            
            // Calculate velocity for transferring to entities
            this.vx = this.x - this.prevX;
            this.vy = this.y - this.prevY;
        }
        
        // Handle crumbling platform logic
        if (this.crumble && this.crumbling) {
            this.crumbleTimer -= deltaTime;
            
            if (this.crumbleTimer <= 0) {
                this.active = false;
                this.crumbling = false;
                this.respawnTimer = this.respawnTime;
            }
        }
        
        // Handle respawning of crumbled platform
        if (this.crumble && !this.active) {
            this.respawnTimer -= deltaTime;
            
            if (this.respawnTimer <= 0) {
                this.active = true;
            }
        }
    }
    
    /**
     * Draw platform on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Number} offsetX - Camera X offset
     * @param {Number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        if (this.crumble && !this.active) return;
        if (this.invisible) return;
        
        ctx.save();
        
        // Different styling based on platform type
        if (this.jumpThrough) {
            ctx.fillStyle = '#8BC34A';
        } else if (this.crumble) {
            if (this.crumbling) {
                const alpha = this.crumbleTimer / this.crumbleTime;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#CDDC39';
            } else {
                ctx.fillStyle = '#FFC107';
            }
        } else if (this.moving) {
            ctx.fillStyle = '#2196F3';
        } else {
            ctx.fillStyle = this.color;
        }
        
        // Draw platform
        ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
        
        // Additional styling for jump-through platforms
        if (this.jumpThrough) {
            ctx.fillStyle = '#689F38';
            ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, 5);
        }
        
        ctx.restore();
    }
    
    /**
     * Start the crumbling process for a crumble platform
     */
    startCrumbling() {
        if (this.crumble && !this.crumbling && this.active) {
            this.crumbling = true;
            this.crumbleTimer = this.crumbleTime;
        }
    }
}

/**
 * Collectible class for items like coins, gems, power-ups
 */
class Collectible {
    constructor(x, y, type = 'coin', value = 10) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
        this.value = value;
        this.active = true;
        
        // Animation properties
        this.frame = 0;
        this.frameTime = 0;
        this.frameDuration = 100; // ms per frame
        this.totalFrames = 6;
        
        // Floating animation
        this.floatOffset = 0;
        this.floatSpeed = 1.5;
        this.startY = y;
    }
    
    /**
     * Update collectible animation
     * @param {Number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Update animation frame
        this.frameTime += deltaTime;
        if (this.frameTime >= this.frameDuration) {
            this.frame = (this.frame + 1) % this.totalFrames;
            this.frameTime = 0;
        }
        
        // Floating animation
        this.floatOffset = Math.sin(performance.now() / 500 * this.floatSpeed) * 3;
        this.y = this.startY + this.floatOffset;
    }
    
    /**
     * Draw collectible on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Number} offsetX - Camera X offset
     * @param {Number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        if (!this.active) return;
        
        ctx.save();
        
        // Different styling based on collectible type
        switch (this.type) {
            case 'coin':
                ctx.fillStyle = '#FFD700'; // Gold
                break;
            case 'gem':
                ctx.fillStyle = '#9C27B0'; // Purple
                break;
            case 'health':
                ctx.fillStyle = '#F44336'; // Red
                break;
            default:
                ctx.fillStyle = '#FFD700';
        }
        
        // Draw collectible (simple circle for now)
        const centerX = this.x - offsetX + this.width / 2;
        const centerY = this.y - offsetY + this.height / 2;
        const radius = this.width / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine effect based on frame
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        
        const shineSize = radius * 0.6;
        const shineOffset = (this.frame / this.totalFrames) * Math.PI * 2;
        
        ctx.arc(
            centerX + Math.cos(shineOffset) * radius / 3,
            centerY + Math.sin(shineOffset) * radius / 3,
            shineSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
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
     * Collect this item
     */
    collect() {
        this.active = false;
    }
}

/**
 * Hazard class for spikes, pits, etc.
 */
class Hazard {
    constructor(x, y, width, height, damage = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.damage = damage;
        this.type = 'spike'; // default type
    }
    
    /**
     * Draw hazard on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Number} offsetX - Camera X offset
     * @param {Number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        ctx.save();
        ctx.fillStyle = '#F44336'; // Red
        
        if (this.type === 'spike') {
            // Draw spikes
            const spikeWidth = 10;
            const numSpikes = Math.floor(this.width / spikeWidth);
            
            for (let i = 0; i < numSpikes; i++) {
                const spikeX = this.x + i * spikeWidth;
                ctx.beginPath();
                ctx.moveTo(spikeX - offsetX, this.y + this.height - offsetY);
                ctx.lineTo(spikeX + spikeWidth / 2 - offsetX, this.y - offsetY);
                ctx.lineTo(spikeX + spikeWidth - offsetX, this.y + this.height - offsetY);
                ctx.fill();
            }
        } else {
            // Default hazard shape
            ctx.fillRect(this.x - offsetX, this.y - offsetY, this.width, this.height);
        }
        
        ctx.restore();
    }
    
    /**
     * Check for collision with player
     * @param {Object} player - Player object
     * @returns {Boolean} - True if collision detected
     */
    checkPlayerCollision(player) {
        return Utils.checkCollision(this, player);
    }
}

/**
 * Checkpoint class
 */
class Checkpoint {
    constructor(x, y, width = 32, height = 64) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = false;
    }
    
    /**
     * Draw checkpoint on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Number} offsetX - Camera X offset
     * @param {Number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        ctx.save();
        
        // Draw checkpoint pole
        ctx.fillStyle = '#9E9E9E';
        ctx.fillRect(this.x - offsetX + this.width / 2 - 2, this.y - offsetY, 4, this.height);
        
        // Draw flag
        ctx.fillStyle = this.active ? '#4CAF50' : '#F44336';
        ctx.beginPath();
        ctx.moveTo(this.x - offsetX + this.width / 2 + 2, this.y - offsetY + 5);
        ctx.lineTo(this.x - offsetX + this.width / 2 + 22, this.y - offsetY + 15);
        ctx.lineTo(this.x - offsetX + this.width / 2 + 2, this.y - offsetY + 25);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Check for collision with player
     * @param {Object} player - Player object
     * @returns {Boolean} - True if collision detected
     */
    checkPlayerCollision(player) {
        return Utils.checkCollision(this, player);
    }
    
    /**
     * Activate the checkpoint
     */
    activate() {
        this.active = true;
    }
}

/**
 * Level class to manage level elements
 */
class Level {
    constructor(levelData) {
        this.width = levelData.width || 3000;
        this.height = levelData.height || 1000;
        this.backgroundColor = levelData.backgroundColor || '#87CEEB';
        this.backgroundLayers = levelData.backgroundLayers || [];
        
        // Level objects
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.hazards = [];
        this.checkpoints = [];
        
        // Level properties
        this.spawnPoint = { x: 100, y: 400 };
        this.exitPoint = { x: this.width - 100, y: 400 };
        this.complete = false;
        
        // Game stats
        this.totalCollectibles = 0;
        this.collectedCount = 0;
        
        // Load level data
        this._loadLevelData(levelData);
    }
    
    /**
     * Load level data from configuration
     * @param {Object} levelData - Level configuration data
     * @private
     */
    _loadLevelData(levelData) {
        // Load spawn and exit points if defined
        if (levelData.spawnPoint) {
            this.spawnPoint = levelData.spawnPoint;
        }
        
        if (levelData.exitPoint) {
            this.exitPoint = levelData.exitPoint;
        }
        
        // Load platforms
        if (levelData.platforms) {
            levelData.platforms.forEach(platformData => {
                this.platforms.push(
                    new Platform(
                        platformData.x, 
                        platformData.y, 
                        platformData.width, 
                        platformData.height, 
                        platformData.options
                    )
                );
            });
        }
        
        // Load collectibles
        if (levelData.collectibles) {
            levelData.collectibles.forEach(collectibleData => {
                this.collectibles.push(
                    new Collectible(
                        collectibleData.x,
                        collectibleData.y,
                        collectibleData.type,
                        collectibleData.value
                    )
                );
                this.totalCollectibles++;
            });
        }
        
        // Load enemies
        if (levelData.enemies) {
            levelData.enemies.forEach(enemyData => {
                this.enemies.push(
                    createEnemy(
                        enemyData.type,
                        enemyData.x,
                        enemyData.y,
                        enemyData.options
                    )
                );
            });
        }
        
        // Load hazards
        if (levelData.hazards) {
            levelData.hazards.forEach(hazardData => {
                this.hazards.push(
                    new Hazard(
                        hazardData.x,
                        hazardData.y,
                        hazardData.width,
                        hazardData.height,
                        hazardData.damage
                    )
                );
            });
        }
        
        // Load checkpoints
        if (levelData.checkpoints) {
            levelData.checkpoints.forEach(checkpointData => {
                this.checkpoints.push(
                    new Checkpoint(
                        checkpointData.x,
                        checkpointData.y
                    )
                );
            });
        }
    }
    
    /**
     * Update level elements
     * @param {Number} deltaTime - Time since last frame in milliseconds
     * @param {Object} player - Player object
     */
    update(deltaTime, player) {
        // Update platforms (for moving/crumbling platforms)
        this.platforms.forEach(platform => {
            platform.update(deltaTime);
        });
        
        // Update collectibles
        this.collectibles.forEach(collectible => {
            collectible.update(deltaTime);
            
            // Check for player collision
            if (collectible.checkPlayerCollision(player)) {
                collectible.collect();
                this.collectedCount++;
                
                // Emit event for score, sound effects, etc.
                player.events.emit('collectItem', { 
                    type: collectible.type, 
                    value: collectible.value 
                });
            }
        });
        
        // Update enemies and check collisions
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, player);
            
            // Apply physics to enemies if they need gravity
            if (this.physics) {
                this.physics.update(enemy, this.platforms, deltaTime);
            }
            
            // Check for collision with player
            if (enemy.checkPlayerCollision(player)) {
                // Check if player is jumping on enemy (from above)
                const playerBottom = player.y + player.height;
                const enemyTop = enemy.y;
                
                if (player.vy > 0 && playerBottom < enemyTop + 20 && player.onGround === false) {
                    // Player is stomping the enemy
                    enemy.takeDamage(1);
                    player.vy = -10; // Bounce up
                    player.events.emit('killEnemy', { enemy });
                } else {
                    // Player takes damage from enemy
                    player.takeDamage(enemy.damage, enemy.x < player.x ? 5 : -5);
                }
            }
        });
        
        // Check hazard collisions
        this.hazards.forEach(hazard => {
            if (hazard.checkPlayerCollision(player)) {
                player.takeDamage(hazard.damage);
            }
        });
        
        // Check checkpoint collisions
        this.checkpoints.forEach(checkpoint => {
            if (!checkpoint.active && checkpoint.checkPlayerCollision(player)) {
                checkpoint.activate();
                this.spawnPoint = { x: checkpoint.x, y: checkpoint.y };
                
                // Emit checkpoint reached event
                player.events.emit('checkpoint');
            }
        });
        
        // Check if player reached exit
        const exitRect = {
            x: this.exitPoint.x - 20,
            y: this.exitPoint.y - 30,
            width: 40,
            height: 60
        };
        
        if (Utils.checkCollision(player, exitRect)) {
            this.complete = true;
            player.events.emit('levelComplete', { 
                collectibles: this.collectedCount,
                total: this.totalCollectibles
            });
        }
        
        // Check if player is out of bounds (fell off the level)
        if (player.y > this.height + 200) {
            player.takeDamage(1, 0, 0);
            player.reset(this.spawnPoint.x, this.spawnPoint.y);
        }
    }
    
    /**
     * Draw level elements
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Number} offsetX - Camera X offset
     * @param {Number} offsetY - Camera Y offset
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        // Draw background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw background layers (parallax scrolling)
        this._drawBackgroundLayers(ctx, offsetX, offsetY);
        
        // Draw exit point marker
        ctx.fillStyle = '#FFC107';
        ctx.fillRect(
            this.exitPoint.x - 20 - offsetX, 
            this.exitPoint.y - 30 - offsetY, 
            40, 
            60
        );
        
        // Draw collectibles
        this.collectibles.forEach(collectible => {
            collectible.draw(ctx, offsetX, offsetY);
        });
        
        // Draw platforms
        this.platforms.forEach(platform => {
            platform.draw(ctx, offsetX, offsetY);
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            enemy.draw(ctx, offsetX, offsetY);
        });
        
        // Draw hazards
        this.hazards.forEach(hazard => {
            hazard.draw(ctx, offsetX, offsetY);
        });
        
        // Draw checkpoints
        this.checkpoints.forEach(checkpoint => {
            checkpoint.draw(ctx, offsetX, offsetY);
        });
    }
    
    /**
     * Draw background layers with parallax effect
     * @private
     */
    _drawBackgroundLayers(ctx, offsetX, offsetY) {
        // Placeholder implementation
        // In a real game, you'd load and draw actual background images
        
        // Draw distant mountains with slow parallax
        ctx.fillStyle = '#7986CB';
        
        for (let i = 0; i < 5; i++) {
            const mountainWidth = 300;
            const mountainX = ((i * 400) - (offsetX * 0.1)) % (ctx.canvas.width + 400) - 200;
            
            ctx.beginPath();
            ctx.moveTo(mountainX, ctx.canvas.height);
            ctx.lineTo(mountainX + mountainWidth / 2, 200);
            ctx.lineTo(mountainX + mountainWidth, ctx.canvas.height);
            ctx.fill();
        }
        
        // Draw closer hills with medium parallax
        ctx.fillStyle = '#5C6BC0';
        
        for (let i = 0; i < 7; i++) {
            const hillWidth = 200;
            const hillX = ((i * 250) - (offsetX * 0.3)) % (ctx.canvas.width + 250) - 150;
            
            ctx.beginPath();
            ctx.moveTo(hillX, ctx.canvas.height);
            ctx.lineTo(hillX + hillWidth / 2, 300);
            ctx.lineTo(hillX + hillWidth, ctx.canvas.height);
            ctx.fill();
        }
    }
    
    /**
     * Get spawn position
     * @returns {Object} - {x, y} coordinates for player spawn
     */
    getSpawnPosition() {
        return { x: this.spawnPoint.x, y: this.spawnPoint.y };
    }
    
    /**
     * Set physics system for the level
     * @param {Physics} physics - Physics system instance
     */
    setPhysics(physics) {
        this.physics = physics;
    }
    
    /**
     * Reset the level to initial state
     */
    reset() {
        this.complete = false;
        this.collectedCount = 0;
        
        // Reset collectibles
        this.collectibles.forEach(collectible => {
            collectible.active = true;
        });
        
        // Reset enemies
        this.enemies.forEach((enemy, index) => {
            const enemyData = this.levelData.enemies[index];
            enemy.reset(enemyData.x, enemyData.y);
        });
        
        // Reset checkpoints
        this.checkpoints.forEach(checkpoint => {
            checkpoint.active = false;
        });
    }
}

/**
 * Create a sample level
 * @returns {Level} - A sample level for testing
 */
function createSampleLevel() {
    const levelData = {
        width: 3000,
        height: 600,
        backgroundColor: '#87CEEB',
        spawnPoint: { x: 100, y: 400 },
        exitPoint: { x: 2900, y: 400 },
        platforms: [
            // Ground platforms
            { x: 0, y: 500, width: 800, height: 100 },
            { x: 900, y: 500, width: 400, height: 100 },
            { x: 1400, y: 500, width: 600, height: 100 },
            { x: 2100, y: 500, width: 900, height: 100 },
            
            // Floating platforms
            { x: 400, y: 350, width: 100, height: 20, options: { jumpThrough: true } },
            { x: 600, y: 250, width: 100, height: 20, options: { jumpThrough: true } },
            { x: 800, y: 350, width: 100, height: 20, options: { jumpThrough: true } },
            
            // Moving platform
            { x: 1100, y: 400, width: 100, height: 20, options: { moving: true, moveY: 100, moveSpeed: 1 } },
            
            // Crumbling platform
            { x: 1500, y: 350, width: 100, height: 20, options: { crumble: true } },
            { x: 1700, y: 300, width: 100, height: 20, options: { crumble: true } },
            { x: 1900, y: 250, width: 100, height: 20, options: { jumpThrough: true } },
            
            // Obstacle course
            { x: 2200, y: 400, width: 50, height: 20, options: { jumpThrough: true } },
            { x: 2300, y: 350, width: 50, height: 20, options: { jumpThrough: true } },
            { x: 2400, y: 300, width: 50, height: 20, options: { jumpThrough: true } },
            { x: 2500, y: 350, width: 50, height: 20, options: { jumpThrough: true } },
            { x: 2600, y: 400, width: 50, height: 20, options: { jumpThrough: true } }
        ],
        collectibles: [
            // Coins
            { x: 300, y: 450, type: 'coin', value: 10 },
            { x: 350, y: 450, type: 'coin', value: 10 },
            { x: 400, y: 450, type: 'coin', value: 10 },
            { x: 450, y: 300, type: 'coin', value: 10 },
            { x: 600, y: 200, type: 'coin', value: 10 },
            { x: 800, y: 300, type: 'coin', value: 10 },
            { x: 1100, y: 350, type: 'coin', value: 10 },
            { x: 1500, y: 300, type: 'coin', value: 10 },
            { x: 1700, y: 250, type: 'coin', value: 10 },
            { x: 1900, y: 200, type: 'coin', value: 10 },
            { x: 2200, y: 350, type: 'coin', value: 10 },
            { x: 2300, y: 300, type: 'coin', value: 10 },
            { x: 2400, y: 250, type: 'coin', value: 10 },
            { x: 2500, y: 300, type: 'coin', value: 10 },
            { x: 2600, y: 350, type: 'coin', value: 10 },
            
            // Gems
            { x: 600, y: 400, type: 'gem', value: 50 },
            { x: 1300, y: 300, type: 'gem', value: 50 },
            { x: 2000, y: 350, type: 'gem', value: 50 },
            { x: 2700, y: 400, type: 'gem', value: 50 }
        ],
        enemies: [
            // Patrol enemies
            { type: 'patrol', x: 500, y: 468, options: { patrolDistance: 200 } },
            { type: 'patrol', x: 1000, y: 468, options: { patrolDistance: 200 } },
            { type: 'patrol', x: 1600, y: 468, options: { patrolDistance: 200 } },
            { type: 'patrol', x: 2300, y: 468, options: { patrolDistance: 200 } },
            
            // Jumper enemies
            { type: 'jumper', x: 1200, y: 468 },
            { type: 'jumper', x: 2500, y: 468 }
        ],
        hazards: [
            // Spikes
            { x: 850, y: 480, width: 50, height: 20, damage: 1 },
            { x: 1350, y: 480, width: 50, height: 20, damage: 1 },
            { x: 2050, y: 480, width: 50, height: 20, damage: 1 }
        ],
        checkpoints: [
            { x: 800, y: 440 },
            { x: 1600, y: 440 },
            { x: 2400, y: 440 }
        ]
    };
    
    return new Level(levelData);
} 