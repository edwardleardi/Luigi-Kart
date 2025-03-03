# Luigi Kart

I vibe coded this so the code is probably really bad, blame sonnet 3.7. Also please don't sue me nintendo! Simple browser-based racing game where you control Luigi's car and avoid obstacles and enemy cars.

Play here: [https://luigi-kart.vercel.app](https://luigi-kart.vercel.app/)

## How to Play

1. Open `index.html` in your web browser
2. Click the "Start Game" button
3. Use the arrow keys or WASD to control Luigi's car:
   - Left Arrow or A: Move left
   - Right Arrow or D: Move right
4. In early levels (1-4), avoid red obstacles and tire strips
5. From level 5 onwards, blue enemy cars will also appear
6. From level 10 onwards, large yellow buses will appear (worth 3 points each!)
7. From level 15 onwards, red snake cars will appear that move in a snake-like pattern (worth 2 points each!)
8. Collect gold coins for bonus points (+5 points each)
9. Collect hearts to gain extra lives and bonus points (+15 points each)
10. Hearts appear every 3 levels (levels 3, 6, 9, etc.) - catch them before they disappear!
11. Watch out for tire strips that will make your car spin out temporarily
12. You have 3 lives - be careful!
13. Light scrapes against obstacles won't cost you a life - only direct hits
14. Your score increases for each enemy car you successfully avoid
15. Every 25 points advances you to the next level with faster gameplay
16. Every 10 levels (10, 20, 30, etc.), all points double and level requirements double!
17. The game gets progressively harder as your level increases
18. Try to beat your high score!

## Controls

- **Arrow Keys** or **WASD**: Move your car
- **Spacebar**: Pause/resume game
- **Enter** or **Spacebar**: Start/restart game
- **Ctrl+Shift+D**: Toggle debug mode (shows collision hitboxes and spawns all enemy types)
- **Volume Slider**: Adjust background music volume

## Features

- Simple and intuitive controls
- Tiered enemy system - new enemy types appear as you reach higher levels:
  - Levels 1-4: Red obstacles and tire strips
  - Levels 5-9: Blue enemy cars are added
  - Level 10-14: Yellow buses are added (longer and worth more points)
  - Level 15+: Red snake cars are added (move in a snake-like pattern)
- Lives system with temporary invincibility after being hit
- Heart power-ups that provide extra lives (up to a maximum of 5) every 3 levels
- Forgiving collision detection with reduced hitboxes
- Scraping mechanics that allow for minor collisions without penalty
- Level progression system that increases speed and difficulty
- High score tracking using local storage
- Responsive design that works on different screen sizes
- Colorful SVG car graphics
- Collectible coins for bonus points
- Tire strip hazards that cause your car to spin out temporarily
- Pause functionality (press Spacebar)
- Start/restart with Enter key or Spacebar
- Debug mode for visualizing collision hitboxes and testing all enemy types
- Background music with adjustable volume
- Sound effects for coin collection

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- SVG for graphics
- Local Storage API for saving high scores
- CSS Animations for visual effects
- Web Audio API for background music and sound effects

## Development

This game is built with vanilla JavaScript without any external libraries or frameworks. The game uses requestAnimationFrame for smooth animations and collision detection for gameplay mechanics.

Feel free to modify and extend the game with new features! 
