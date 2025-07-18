/**
 * Utility functions for the platformer game
 */
const Utils = {
    /**
     * Random integer between min and max (inclusive)
     */
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Load image from path
     */
    loadImage: (path) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        });
    },
    
    /**
     * Load audio from path
     */
    loadAudio: (path) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
            audio.src = path;
        });
    },
    
    /**
     * Load multiple assets and track progress
     */
    loadAssets: (assets, progressCallback) => {
        const promises = [];
        const results = {};
        let loaded = 0;
        
        Object.entries(assets).forEach(([key, path]) => {
            const isImage = path.match(/\.(png|jpg|jpeg|gif|webp)$/i);
            const promise = isImage ? Utils.loadImage(path) : Utils.loadAudio(path);
            
            promises.push(
                promise.then(asset => {
                    results[key] = asset;
                    loaded++;
                    if (progressCallback) {
                        progressCallback(loaded / promises.length);
                    }
                })
            );
        });
        
        return Promise.all(promises).then(() => results);
    },
    
    /**
     * Check collision between two rectangles (AABB)
     */
    checkCollision: (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    /**
     * Get collision side (top, bottom, left, right)
     */
    getCollisionSide: (obj1, obj2, vx, vy) => {
        const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
        const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
        
        // Check if moving vertically or horizontally
        const absDX = Math.abs(dx);
        const absDY = Math.abs(dy);
        
        // Collision happened on the shortest side
        // but also check velocity direction to confirm
        if (absDX > absDY) {
            if (dx > 0 && vx < 0) {
                return "right";
            } else if (dx < 0 && vx > 0) {
                return "left";
            }
        } else {
            if (dy > 0 && vy < 0) {
                return "bottom";
            } else if (dy < 0 && vy > 0) {
                return "top";
            }
        }
        
        // Default to side with smallest overlap
        if (absDX > absDY) {
            return dy > 0 ? "bottom" : "top";
        } else {
            return dx > 0 ? "right" : "left";
        }
    },
    
    /**
     * Debounce function to limit how often a function is called
     */
    debounce: (fn, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    },
    
    /**
     * Simple event emitter
     */
    createEventEmitter: () => {
        const events = {};
        
        return {
            on: (event, handler) => {
                if (!events[event]) {
                    events[event] = [];
                }
                events[event].push(handler);
            },
            
            off: (event, handler) => {
                if (events[event]) {
                    events[event] = events[event].filter(h => h !== handler);
                }
            },
            
            emit: (event, data) => {
                if (events[event]) {
                    events[event].forEach(handler => handler(data));
                }
            }
        };
    }
}; 