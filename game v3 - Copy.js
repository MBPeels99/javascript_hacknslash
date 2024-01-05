// ------------------------- START MENU -----------------------------------

document.getElementById('startButton').addEventListener('click', () => {
    // Hide the start menu
    document.getElementById('startMenu').style.display = 'none';

    // Show the loading screen
    document.getElementById('loadingScreen').style.display = 'block';

    // Simulate loading
    let loadingBarElement = document.getElementById('loadingBar');
    let loadingProgress = 0;

    let loadingInterval = setInterval(() => {
        loadingProgress += 5; // adjust as needed
        loadingBarElement.style.width = loadingProgress + '%';

        if (loadingProgress >= 100) {
            clearInterval(loadingInterval);
            // Hide the loading screen
            document.getElementById('loadingScreen').style.display = 'none';

            // Show the game screen
            document.getElementById('gameScreen').style.display = 'block';

            // Initialize the game (call the function to start your game)
            initGame();
        }
    }, 100); // adjust the interval as needed
});

// -------------------------- GAME START ----------------------------------

function initGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const CAMERA_MARGIN = 100;  // Distance from the edge of the canvas at which the camera will start moving.

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const GRAVITY = 0.5;  // Moved outside of the class to be a constant.

    let items;
    let player = null;

    // ----------------------- INITIAL SETUP ------------------------------

    /*
    const initialLevelText = `
    0000000000000000000000000000000000000000000000000000
    0000000000000000000000000000000000000000000000000000
    0000000000000000000000x000000000x0000000000000000000
    00000000000000000000-----000000---000000000000000000
    0000000000000x0000000000000000000000000x00000000000
    000000000000---0000000000000000000000-----000000000
    000000000000000000000000000000000000000000000000000
    000000x0000000000000000000000000000000000000x00000
    0000-----000000000000000000000000000000000000-00000
    000000-000000000000x000000000x0000000000000000000
    000000-00000000000------------0000000000000000000
    0000000000000000000000000000000000000000000000000000
    0000000000000000000000000000000000000000000000000000
    `;
    */

    const initialLevelText = `
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000x0000000000000000000000000000000000x0000000000000000x0000000000000000x0000000000000000x000000000000000000000000000000000000000
0000------------------000000000000000000000000000000-----0000000000000000---0000000000000000---0000000000000000------------------000000000000000000000
0000000000000000000000000000000000000000x00000000000x00000000000000000x00000000000000000x00000000000000000000000000000000000000000000000000
0000000000000x0000000000000000000000--------00000000-----00000000000000000-----00000000000000000-----0000000000000000x0000000000000000000000000000000000
000000000000---0000000000000000000000000000000000000000000000000000000000000000000000000000000000000---000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000x0000000000000000000000000000000000000000000000x00000x0000000000000000x0000000000000000x0000000000000000x00000000000000000000000000000000000
0000-----0000000000000000000000000000000000000000000---00000---0000000000000000---0000000000000000---0000000000000000-----0000000000000000000000000000000000
000000-000000000000x000000000x0000000000000000000000000000x0000000000000000x0000000000000000x0000000000000000x0000000000000000-0000000000000000000000000000000000
000000-00000000000------------0000000000000000000000000000---0000000000000000---0000000000000000---0000000000000000---0000000000000000-0000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000---000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000-----0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000s0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
-------------------------------------------------------------------------------------------------------------------------------------
`;



    fetch('items.json')
        .then(response => response.json())
        .then(data => {
            items = data;
            createPlayer();
            loadLevel(initialLevelText);
            gameLoop();
        })
        .catch((error) => console.error('Error:', error));


    const background = new Image();
    background.src = "./images/City-Background.png";

    let backgroundX = 0;  // Starting x-position of the background
    const backgroundSpeed = 2;  // Speed at which the background moves

    // ----------------------- RENDERING ------------------------------

    function drawBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Directly use backgroundX to position the background.
        //ctx.drawImage(background, backgroundX, 0, background.width, background.height);
        ctx.drawImage(background, -100, -150, window.innerWidth+200, window.innerHeight+350);
    }

    function drawPlatform(platform) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    function drawGround() {
        ctx.fillStyle = ground.color;
        ctx.fillRect(0, ground.y, canvas.width, ground.height);
    }

    function drawEntity(entity) {
        if (!entity) return; // If entity is null, exit the function

        ctx.fillStyle = entity.color;
        ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    }

    function drawAttackBox(entity) {
        ctx.fillStyle = entity === player ? '#FF0000' : '#FF5733';
        const direction = entity.direction instanceof Function ? entity.direction() : entity.direction;
        const offset = direction === 'right' ? entity.width + entity.attackBox.offset : -entity.attackBox.width - entity.attackBox.offset;
        ctx.fillRect(entity.x + offset, entity.y + (entity.height / 2) - (entity.attackBox.height / 2), entity.attackBox.width, entity.attackBox.height);
    }

    /*
    function draw() {
    if (!player) return; // Exit the function if player is null

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawEntity(player);
    platforms.forEach(drawPlatform);
    if (player.attacking) drawAttackBox(player);
    // Assuming enemies is an array:
    enemies.forEach(enemy => {
        drawEntity(enemy);
        if (enemy.attacking) drawAttackBox(enemy);
    });
    }
    */
    function draw() {
        if (!player) return; // Exit the function if player is null
    
        let zoomFactor = 2; // Set the zoom level, adjust this value to your preference
    
        // Calculate the desired center of the zoom (player's position)
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
    
        // Save the current state of the context
        ctx.save();
    
        // Translate to the desired center of the zoom
        ctx.translate(canvas.width / 2, canvas.height / 2);
    
        // Scale by the zoom factor
        ctx.scale(zoomFactor, zoomFactor);
    
        // Translate back by the desired center of the zoom, adjusted for scaling
        ctx.translate(-centerX, -centerY);
    
        // Draw the background, entities, platforms, and other game elements as before
        ctx.clearRect(0, 0, canvas.width / zoomFactor, canvas.height / zoomFactor); // Clear the canvas, considering the zoom factor
        drawBackground();
        drawEntity(player);
        platforms.forEach(drawPlatform);
        if (player.attacking) drawAttackBox(player);
        // Assuming enemies is an array:
        enemies.forEach(enemy => {
            drawEntity(enemy);
            if (enemy.attacking) drawAttackBox(enemy);
        });
    
        // Restore the context state to revert the transformation
        ctx.restore();
    }
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // You may need to adjust other elements or calculations based on the new canvas size
    });

    // ----------------------- GAME OBJECTS ------------------------------

    const ground = {
        y: canvas.height - 50,  // Assuming the ground is 50px tall.
        height: 50,
        color: '#4CAF50'
    };

    function loadPlayerJson(callback) {
        fetch('player.json')
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => console.error('Error loading player JSON:', error));
    }

    function createPlayer() {
        loadPlayerJson(data => {    
            // Assign the JSON data to player
            player = data;
    
            // Add the methods separately
            player.onPlatform = function() {
                let nextY = this.y + this.height + this.vy; // player's y position after applying gravity
        
                for (let platform of platforms) {
                    if (this.x < platform.x + platform.width && 
                        this.x + this.width > platform.x && 
                        nextY >= platform.y && 
                        this.y + this.height <= platform.y) // check if player is not currently above the platform
                    {
                        return platform;
                    }
                }
        
                return null;
            };
            player.onGround = function() {
                let onTheGround = this.y + this.height === ground.y;

                let platform = this.onPlatform();

                if (platform) {
                    onTheGround = true;
                }

                return onTheGround;
            };
    
            // Set player's weapon and armor
            player.weapon = items.weapons[0];
            player.armor = items.armor[1];
        });
    }

    class Enemy {
        constructor(x, y, platforms, player, data) {
            this.x = x;
            this.y = y;
            this.vy = 0;
            this.width = data.width;
            this.height = data.height;
            this.color = data.color;
            this.speed = data.speed;
            this.maxHealth = data.maxHealth;
            this.health = data.health;
            this.dead = false;
            this.originalX = x;
            this.inAggroMode = false;
            this.updatesUntilTurn = data.updatesUntilTurn;
            this.currentUpdate = 0;
            this.aggroRange = data.aggroRange;
            this.attacking = false;
            this.attackRange = data.attackRange;
            this.attackBox = data.attackBox;
            this.weapon = items.weapons[0]; // Assuming items is defined elsewhere
            this.armor = items.armor[0];     // Assuming items is defined elsewhere
            this.lastAttackTime = 0;
            this.attackCooldown = data.attackCooldown;
            this.platforms = platforms;
            this.player = player;
            this.invulnerability = 0; // duration of invulnerability after being hit
            this.originalColor = this.color; // storing the original color to revert back to it later
            this.pacingPhase = 0; // The phase of the pacing
            this.pacingAmplitude = data.pacingAmplitude || 50; // The distance the enemy paces back and forth
            this.pacingFrequency = data.pacingFrequency || 0.05; // How fast the enemy paces4this.waiting = false; // Tells if the enemy is currently waiting at the edge before pacing again.
            this.waitTime = data.waitTime || 1000; // Time in milliseconds that the enemy waits at the edge.
            
        }

        isPlayerInView() {
            if (!this.player) return false;

            let horizontalDistance = Math.abs(this.x - this.player.x);
            let verticalDistance = Math.abs(this.y - this.player.y);
            // Adding a vertical aggro range
            let verticalAggroRange = 25;  // You can adjust this value.
            
            if (horizontalDistance < this.aggroRange && verticalDistance < verticalAggroRange) {
                if ((this.direction() === 'right' && this.player.x > this.x) ||
                    (this.direction() === 'left' && this.player.x < this.x)) {
                    return true;
                }
            }
            return false;
        }

        direction() {
            return this.x < player.x ? 'right' : 'left';
        }

        move() {
            // Check if the enemy is within the camera's view
            if (this.isWithinCameraView()) {
                if (this.isPlayerInView()) {
                    this.chasePlayer();
                } else if (this.inAggroMode) {
                    this.returnToOriginalPosition();
                } else {
                    this.pace();
                }
            }
        }

        applyGravity() {
            this.vy += GRAVITY;  // Using the GRAVITY constant.
            this.y += this.vy;
        }

        onGroundOrPlatform() {
            for (let platform of this.platforms) {
                if (this.x + this.width > platform.x && this.x < platform.x + platform.width &&
                    Math.abs(this.y + this.height - platform.y) < 2) {
                    return true;
                }
            }
            return this.y + this.height >= ground.y;  // Assuming ground is a global object.
        }
        
        atPlatformEdge(newX) {
            for (let platform of this.platforms) {
                // Check for right edge
                if (this.direction() === 'right' && 
                    newX + this.width + this.speed >= platform.x + platform.width && 
                    newX + this.width <= platform.x + platform.width) {
                    return true;
                }
                // Check for left edge
                if (this.direction() === 'left' && 
                    newX - this.speed <= platform.x && 
                    newX >= platform.x) {
                    return true;
                }
            }
            return false;
        }       

        chasePlayer() {
            // Calculate the distance between the enemy's original position and the player
            const distanceToPlayer = Math.abs(this.player.x - this.x);
            
            // Determine if the player is within the allowable chase range
            if (distanceToPlayer < this.aggroRange) {
                this.inAggroMode = true;
                // Move towards the player if they are within the aggro range and not beyond the allowable chase range
                if (this.direction() === 'right') {
                    this.x += Math.min(this.speed, this.player.x - this.x); // Move right towards the player
                } else {
                    this.x -= Math.min(this.speed, this.x - this.player.x); // Move left towards the player
                }
            } else {
                this.inAggroMode = false;
                // If the player is out of the aggro range or beyond the allowable chase range, return to original position
                this.returnToOriginalPosition();
            }
        
            // Reset the current update count
            this.currentUpdate = 0;
        }

        // Check if the enemy is within the camera's view (assuming the camera view spans the entire canvas)
        isWithinCameraView() {
            // Check if the enemy is within the horizontal range of the camera
            return this.x + this.width > camera.x && this.x < camera.x + canvas.width;
        }

        returnToOriginalPosition() {
            if (this.x < this.originalX) {
                this.x += this.speed;
            } else if (this.x > this.originalX) {
                this.x -= this.speed;
            } else {
                this.inAggroMode = false;
            }
        }

        pace() {
            if (this.isPlayerInView()) {
                // Interrupt pacing if the player is in view
                this.pacingPhase = 0;
                return;
            }
        
            if (this.waiting) return;  // If the enemy is waiting, don't move it.
        
            // Determine direction based on pacing phase.
            const moveDirection = this.pacingPhase === 0 ? 'right' : 'left';
            const potentialNewX = moveDirection === 'right' ? this.x + this.speed : this.x - this.speed;
        
            // If enemy is not at the edge of its pacing amplitude or platform, move it.
            if (!this.atPacingEdge(potentialNewX) && !this.atPlatformEdge(potentialNewX)) {
                this.x = potentialNewX;
            } else {
                // If the enemy is at the edge, make it wait for a while before changing direction.
                this.waiting = true;
                setTimeout(() => {
                    this.waiting = false;
                    this.pacingPhase = this.pacingPhase === 0 ? 1 : 0;  // Switch pacing phase
                }, this.waitTime);
            }
        }
        
        atPacingEdge(newX) {
            return (newX < this.originalX - this.pacingAmplitude || newX > this.originalX + this.pacingAmplitude);
        }
        
        changeDirection() {
            if (this.direction() === 'right') {
                this.x -= this.speed;  // Move left
            } else {
                this.x += this.speed;  // Move right
            }
        }

        attackPlayer() {
            if (!this.attacking) {
                this.attacking = true;
                setTimeout(() => {
                    this.attacking = false;
                }, 200);
            }
        }

        flash(times, callback) {
            if (times > 0) {
                this.color = '#FFFFFF'; // Change to white
                setTimeout(() => {
                    this.color = this.originalColor; // Change back to original color
                    setTimeout(() => {
                        this.flash(times - 1, callback); // Recursively flash
                    }, 100);
                }, 100);
            } else {
                if (callback) callback(); // Call the callback when flashing is done
            }
        }
    }

    // ----------------------- CAMERA --------------------------------

    function lerp(start, end, amt) {
        return start + (end - start) * amt;
    }

    const camera = {
        x: 0,
        prevPlayerX: 0, // Add this line to keep track of the player's previous x position
        smoothness: 0.05  // Adjust this value to control the smoothing
    };
    
    // ----------------------- CONTROLS ------------------------------
    //Note if cap is on the key binding won't work
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'a':
                moveLeft();
                break;
            case 'd':
                moveRight();
                break;
            case 'w':
                jump();
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (['a', 'd'].includes(event.key)) {
            player.vx = 0;
        }
    });

    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0 && !player.attacking) { 
            initiatePlayerAttack();
        }
    });


    function moveLeft() {
        player.vx = -player.speed;
        player.direction = 'left';
    }

    function moveRight() {
        player.vx = player.speed;
        player.direction = 'right';
    }

    function jump() {
        if (!player.jumping) {
            player.jumping = true;
            player.vy = player.jumpStrength;
        }
    }

    // ----------------------- GAME PHYSICS ------------------------------

    function applyGravityTo(entity) {
        entity.vy += player.gravity;
        entity.y += entity.vy;
    }

    function calculateDamage(attacker, defender) {
        let baseDamage = attacker.weapon ? attacker.weapon.damage : 0;
        let defense = defender.armor ? defender.armor.defense : 0;

        let damage = baseDamage - defense;
        if (damage < 0) damage = 0; // prevent negative damage

        return damage;
    }

    function checkAttacksBetween(entity1, entity2) {
        const attackBox1 = {
            x: (entity1.direction instanceof Function ? entity1.direction() : entity1.direction) === 'right' ? entity1.x + entity1.width + entity1.attackBox.offset : entity1.x - entity1.attackBox.width - entity1.attackBox.offset,
            y: entity1.y + (entity1.height / 2) - (entity1.attackBox.height / 2),
            width: entity1.attackBox.width,
            height: entity1.attackBox.height
        };

        let currentTime = Date.now();

        if (entity1.attacking && currentTime - entity1.lastAttackTime >= entity1.attackCooldown && rectanglesCollide(attackBox1, entity2)) {
            // Calculate the damage
            let damage = calculateDamage(entity1, entity2);

            // Subtract the damage from the defender's health
            entity2.health -= damage;

            // Print the player's health after each hit
            if (entity2 === player) {
                console.log("Player's Health: ", entity2.health);
            }

            // Update the lastAttackTime
            entity1.lastAttackTime = currentTime;

            // start invulnerability period
            entity2.invulnerability = 20; // adjust duration as needed
            entity2.color = '#FFFFFF'; // turn white
        }
    }

    function checkGroundCollisionFor(entity) {
        if (entity.y + entity.height > ground.y) {
            entity.y = ground.y - entity.height;
            entity.jumping = false;
            entity.vy = 0;
        }
    }
    
    function initiatePlayerAttack() {
        player.attacking = true;
        setTimeout(() => {
            player.attacking = false;
        }, 200); 
    }

    function rectanglesCollide(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    function handleEntityCollision(entity1, entity2) {
        if (entity1 === player && rectanglesCollide(entity1, entity2)) {
            let minimalDamage;
        
            if (isPlayerStomping(player)) {
                minimalDamage = Math.max(1, player.stompPower - entity2.armor.stompResistance);
            } else {
                minimalDamage = 5; // Regular damage when not stomping
            }
        
            entity2.health -= minimalDamage;
        }
    }
    
    function isPlayerStomping(player) {
        return player.attacking && player.inAir; // Assuming inAir is a property that's true when the player is in the air
    }
    
    
    //------------------UPDATE-----------------
       
    function update() {
        if (!player) return; // If player is not initialized, exit the function

        // Link Camera to Player
        const playerScreenX = canvas.width / 2; // Fixed x position of the player on the screen
        const worldShift = playerScreenX - player.x; // Calculate how much the world needs to move to keep the player in the fixed screen position
        backgroundX += worldShift; // Update background x position
        
        // Update player's x position in the game world
        player.x += player.vx;      
    
        // Check if the player reaches the border of the canvas
        if (player.x > canvas.width - CAMERA_MARGIN) {
            let cameraShift = backgroundSpeed;
            if (backgroundX <= canvas.width - background.width) {
                cameraShift = 0;
            }
            backgroundX -= cameraShift;
        } else if (player.x < CAMERA_MARGIN) {
            let cameraShift = backgroundSpeed;
            if (backgroundX >= 0) {
                cameraShift = 0;
            }
            backgroundX += cameraShift;
        }

        // Constrain background within bounds
        if (backgroundX > 0) backgroundX = 0;
        if (backgroundX < canvas.width - background.width) backgroundX = canvas.width - background.width;

        if (player.jumping || !player.onGround()) {
            applyGravityTo(player);
            let platform = player.onPlatform();
            if (platform) {
                player.y = platform.y - player.height; // position player on the platform
                player.jumping = false;
                player.vy = 0;
            } else {
                checkGroundCollisionFor(player);
            }
        } else {
            player.vy = 0;
        }
    
        // update player invulnerability
        if (player.invulnerability > 0) {
            player.invulnerability--;
            if (player.invulnerability === 0) {
                player.color = player.originalColor; // turn back to original color
            }
        }
    
        // Update health bar
        let healthBarElement = document.getElementById('healthBar');
        let healthPercentage = (player.health / player.maxHealth) * 100;
        healthBarElement.style.width = healthPercentage + '%';
    
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const horizontalDistance = Math.abs(dx);
            const verticalDistance = Math.abs(dy);
            const totalDistance = Math.sqrt(dx * dx + dy * dy);

            // Check if the enemy's health is 0 or lower
            if (enemy.health <= 0 && !enemy.dead) {
                enemy.dead = true; // Set the enemy as dead
                enemy.flash(3, () => {
                    enemies.splice(index, 1); // Remove enemy from array after flashing
                });
            }

            // Skip the rest of the logic if the enemy is dead
            if (enemy.dead) return;

        
            if (totalDistance < enemy.attackRange && verticalDistance < 10) {  // Using 10 as a threshold for "very close" in vertical distance.
                if (typeof enemy.attackPlayer === 'function') {
                    if(!enemy.attacking){
                        enemy.chasePlayer();
                        console.log("We got here");
                    }
                    enemy.attackPlayer();
                }            
            }

            if (!enemy.onGroundOrPlatform()) {
                enemy.applyGravity();
            } else {
                enemy.vy = 0;  // Reset the vertical velocity once on the ground.
            }

            // update enemy invulnerability
            if (enemy.invulnerability > 0) {
                enemy.invulnerability--;
                if (enemy.invulnerability === 0) {
                    enemy.color = enemy.originalColor; // turn back to original color
                }
            }

            enemy.move();
            handleEntityCollision(player, enemy);
            checkAttacksBetween(player, enemy);
            checkAttacksBetween(enemy, player);
        });
    }
    
    // ----------------------- LEVEL DESIGN ---------------------------

    //const platforms = [];  // To store platforms
    const enemies = [];    // To store enemies
    let TILE_SIZE = 50;

    let platforms = [];  // To store platforms globally

    function loadLevel(levelText) {
        platforms = [];  // To reset platforms for each new level
        const spawnPromises = []; // Array to store spawn promises
        
        const rows = levelText.trim().split('\n');
        for (let y = 0; y < rows.length; y++) {
            for (let x = 0; x < rows[y].length; x++) {
                const tile = rows[y][x];
                switch (tile) {
                    case '0':
                        break;
                    case '-':
                        platforms.push(createPlatform(x, y));
                        break;
                    case 'x':
                        spawnPromises.push(spawnEnemy(x, y)); // Push the spawn promise
                        break;
                    case 's': // Start tile for player
                        // Set the player's start position here
                        if (player) {
                            player.x = x*50; // Assume TILE_SIZE is the width of a tile
                            player.y = y*50; // Assume TILE_SIZE is the height of a tile
                        }
                        break;
                }
            }
        }
    
        drawGround();
    
        // Wait for all enemies to spawn
        Promise.all(spawnPromises)
            .then(spawnedEnemies => {
                enemies.push(...spawnedEnemies); // Add all spawned enemies
                // You can now safely start the game loop or any other logic
            })
            .catch(error => {
                console.error('An error occurred while spawning enemies:', error);
            });
    }

    function createPlatform(x, y) {
        // Assuming each tile is 50x50
        const platform = {
            x: x * 50,
            y: y * 50,
            width: 50,
            height: 50,
            color: '#4CAF50'
        };
        return platform;
    }

    function spawnEnemy(x, y) {
        // Return a promise that resolves with the new enemy
        return new Promise((resolve, reject) => {
            fetch('enemy.json')
                .then(response => response.json())
                .then(data => {
                    // Construct a new enemy with the fetched data
                    const newEnemy = new Enemy(x * 50, y * 50, platforms, player, data);
                    resolve(newEnemy); // Resolve the promise with the new enemy
                })
                .catch(reject); // Reject the promise if there's an error
        });
    }
    
    
    const lastPlatform = platforms[platforms.length - 1];
    if (lastPlatform && lastPlatform.y !== ground.y) {
        console.warn("The last platform does not match the ground floor.");
        // If you'd like to adjust it:
        lastPlatform.y = ground.y;
    }

    // ----------------------- GAME LOOP ------------------------------

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}
