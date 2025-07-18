# HTML5 Canvas Platformer Game

A modern 2D platformer game built with HTML5 Canvas and JavaScript. This project demonstrates solid programming fundamentals, clean code architecture, and engaging gameplay mechanics.

## Play the Game

You can play the game by opening `index.html` in a modern web browser or by visiting the [GitHub Pages deployment](https://yourusername.github.io/platformer-game/).

## Features

### Core Gameplay
- Smooth player movement with acceleration/deceleration physics
- Variable jump height based on key press duration
- Collision detection system using AABB (Axis-Aligned Bounding Box)
- Camera system that smoothly follows the player
- Multiple level types with increasing difficulty

### Level Elements
- Various platform types (static, moving, disappearing, and jump-through)
- Collectible items (coins and gems)
- Enemies with different movement patterns
- Hazards and checkpoint systems
- Level progression with completion mechanics

### Technical Implementation
- Modular object-oriented architecture
- Efficient game loop with delta time
- Event-based communication between game components
- Responsive design that works on different screen sizes
- Touch controls for mobile devices

## Controls

### Keyboard
- **Move Left:** Left Arrow or A
- **Move Right:** Right Arrow or D
- **Jump:** Space, Up Arrow, or W
- **Pause Game:** P
- **Restart:** R
- **Menu:** Escape

### Touch Controls (Mobile)
- **Left/Right:** Virtual D-pad on the left side
- **Jump:** Jump button on the right side

## Architecture

The game is built with a modular architecture, separating concerns into distinct classes:

- **Game:** Main game controller that manages game states and the game loop
- **Player:** Handles player input, movement, and states
- **Level:** Manages level elements, collisions, and progression
- **Physics:** Implements gravity, friction, and collision responses
- **Enemies:** Different enemy types and behaviors
- **Platforms:** Various platform types with different properties
- **Collectibles:** Items that can be collected for points
- **Utils:** Utility functions for common operations

## Future Enhancements

- Additional levels with unique themes
- More enemy types and behaviors
- Power-ups with special abilities
- Boss battles at the end of each world
- Local storage for saving progress and high scores
- Level editor for creating custom levels

## Development

### Prerequisites
- Any modern web browser
- Basic knowledge of HTML, CSS, and JavaScript

### Running Locally
1. Clone the repository: `git clone https://github.com/yourusername/platformer-game.git`
2. Open `index.html` in your browser
3. No build step or server required!

### Project Structure
```
platformer-game/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js       # Entry point
│   ├── game.js       # Game controller
│   ├── player.js     # Player class
│   ├── level.js      # Level management
│   ├── enemies.js    # Enemy classes
│   ├── physics.js    # Physics system
│   └── utils.js      # Utility functions
├── assets/
│   ├── images/       # Sprites and visual assets
│   ├── sounds/       # Audio assets
│   └── levels/       # Level data
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by classic platformer games like Super Mario Bros, Sonic the Hedgehog, and Celeste
- Built as a portfolio project to demonstrate JavaScript game development skills 