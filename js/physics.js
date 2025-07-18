/**
 * Physics system for the platformer game
 */
class Physics {
    constructor(gravity = 0.5, friction = 0.8, airResistance = 0.95) {
        this.gravity = gravity;
        this.friction = friction; // Ground friction
        this.airResistance = airResistance; // Air resistance
    }

    /**
     * Apply physics to an entity (player, enemy, etc.)
     * @param {Object} entity - The entity to update
     * @param {Array} platforms - List of platforms to check for collisions
     * @param {Number} deltaTime - Time since last frame in milliseconds
     */
    update(entity, platforms, deltaTime) {
        const timeScale = deltaTime / (1000 / 60); // Scale physics to 60 FPS

        // Apply gravity
        entity.vy += this.gravity * timeScale;

        // Apply air resistance
        if (!entity.onGround) {
            entity.vx *= this.airResistance;
        }

        // Store previous position for collision detection
        const prevX = entity.x;
        const prevY = entity.y;

        // Update position based on velocity
        entity.x += entity.vx * timeScale;
        entity.y += entity.vy * timeScale;

        // Reset ground state
        entity.onGround = false;

        // Check for collisions with platforms
        this._handlePlatformCollisions(entity, platforms, prevX, prevY);

        // Apply ground friction
        if (entity.onGround) {
            entity.vx *= this.friction;

            // Stop if almost at rest
            if (Math.abs(entity.vx) < 0.05) {
                entity.vx = 0;
            }
        }

        // Terminal velocity
        const terminalVelocity = 12;
        if (entity.vy > terminalVelocity) {
            entity.vy = terminalVelocity;
        }
    }

    /**
     * Handle collisions between entity and platforms
     * @private
     */
    _handlePlatformCollisions(entity, platforms, prevX, prevY) {
        let onPlatform = false;

        for (const platform of platforms) {
            // Skip if platform is a jump-through and entity is moving upward or is below platform
            if (
                platform.jumpThrough && 
                (entity.vy < 0 || entity.y >= platform.y + platform.height)
            ) {
                continue;
            }

            // Check collision
            if (Utils.checkCollision(entity, platform)) {
                const collisionSide = Utils.getCollisionSide(entity, platform, entity.vx, entity.vy);

                switch (collisionSide) {
                    case "top":
                        entity.y = platform.y - entity.height;
                        entity.vy = 0;
                        entity.onGround = true;
                        onPlatform = true;
                        
                        // Handle moving platforms - transfer momentum
                        if (platform.vx !== undefined) {
                            entity.x += platform.vx;
                        }
                        
                        // Handle disappearing platforms
                        if (platform.crumble) {
                            platform.startCrumbling();
                        }
                        break;
                        
                    case "bottom":
                        entity.y = platform.y + platform.height;
                        entity.vy = 0;
                        break;
                        
                    case "left":
                        entity.x = platform.x - entity.width;
                        entity.vx = 0;
                        break;
                        
                    case "right":
                        entity.x = platform.x + platform.width;
                        entity.vx = 0;
                        break;
                }
            }
        }
    }
} 