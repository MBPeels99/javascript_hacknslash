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
    const gameWindow = document.getElementById("gameWindow");
    const ctx = gameWindow.getContext("2d");
    const CAMERA_MARGIN = 100;  // Distance from the edge of the canvas at which the camera will start moving.

    gameWindow.width = window.innerWidth;
    gameWindow.height = window.innerHeight;

    const GRAVITY = 0.5;  // Moved outside of the class to be a constant.

    let items;
    let player = null;
    let widthLevel = 0;
    let heightLevel = 0;
    

    // ----------------------- INITIAL SETUP ------------------------------

    const initialLevelText = `
w00000x000000000000000000000000000000000000000000000000000x0000000000000000x0000000000000000x000000000000000000000000000000000000000000000000000000000000000000000000000w
w000------------------000000000000000000000000000000-----0000000000000000---0000000000000000---0000000000000000------------------000000000000000000000000000000000000000w
w000000000000000000000000000000000000000x00000000000x00000000000000000x00000000000000000x0000000000000000000000000000000000000000000000000000000000000000000000000000000w
w000000000000x0000000000000000000000--------00000000-----00000000000000000-----00000000000000000-----0000000000000000x00000000000000000000000000000000000000000000000000w
w000000000000---0000000000000000000000000000000000000000000000000000000000000000000000000000000000000---0000000000000000000000000000000000000000000000000000000000000000w
w00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000w
w00000x0000000000000000000000000000000000000000000000x00000x0000000000000000x0000000000000000x0000000000000000x000000000000000000000000000000000000000000000000000000000w
w000-----0000000000000000000000000000000000000000000---00000---0000000000000000---0000000000000000---0000000000000000-----0000000000000000000000000000000000000000000000w
w00000-000000000000000000000000000000000000000000000000000x0000000000000000x0000000000000000x0000000000000000x0000000000000000-00000000000000000000000000000000000000000w
w00000-000000000000000000000x0000000000000000000x00000000---0000000000000000---000000000000-------0000000000000000---0000000000000000-0000000000000000000000000000000000w
w00000000000000000-----------------00000000---------------00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000w
w000000000000x0000000000000000000000000000000000000000000000000000000000000000000000---000000000000000000000000000000000000000000000000000000000000000000000000000000000w
w00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000w
w0000000000000000000000000000000000s000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000w
w00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000w
`;
    const background = new Image();
    background.src = "./images/City-Background.png";
    
    let backgroundX = 0;  // Starting x-position of the background
    const backgroundSpeed = 2;  // Speed at which the background moves
    let backgroundWidth = gameWindow.width;

    /*
     * This code first fetches the items and then uses the loadPlayerJson function to fetch the player data. Once both are available, it constructs a new Player object using the data. 
     */
    fetch('items.json')
    .then(response => response.json())
    .then(itemsData => {
        items = new Item(itemsData);
        loadPlayerJson()
            .then(playerData => {
                player = new Player(playerData, items);
                loadLevel(initialLevelText);
                gameLoop();
            })
            .catch((error) => console.error('Error:', error));
    })
    .catch((error) => console.error('Error:', error));

    // ----------------------- RENDERING ------------------------------

    function setWindowSize(width, height) {
        window.resizeTo(width, height);
    }

    function drawBackground() {
        ctx.clearRect(0, 0, gameWindow.width, gameWindow.height);
        
        //FIX ME
        ctx.fillStyle = "#000000"; 
        ctx.fillRect(0, 0, gameWindow.width, gameWindow.height);        

        // Calculate the y position to align the background with the ground
        const bgHeight = gameWindow.height - ground.height;
        
        // Draw the background image
        ctx.drawImage(background, 0, 0, background.width, background.height, 0, 0, widthLevel, heightLevel);

        // Draw the ground
        ctx.fillStyle = ground.color;
        ctx.fillRect(0, ground.y, widthLevel, ground.height);
    }

    function drawPlatform(platform) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    function drawWall(wall){
        ctx.fillStyle = wall.color;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    }

    function drawEntity(entity) {

        if (!entity) return; // If entity is null, exit the function

        if(entity != player){
            var x = entity.x+20;
            var y = entity.y;
            var headRadius = entity.width / 4; // Head size relative to the entity width
            var bodyHeight = entity.height / 2;
            var armLength = entity.width / 4;
            var legLength = entity.height / 4;
    
            // Calculate walking angles
            var legAngle = Math.sin(entity.frameCounter / 10) * (Math.PI / 8);
            var armAngle = -Math.sin(entity.frameCounter / 10) * (Math.PI / 8);
            if (entity.direction === 'left') {
                legAngle = -legAngle;
                armAngle = -armAngle;
            }
        
            // Draw head (as a circle)
            ctx.beginPath();
            ctx.arc(x, y, headRadius, 0, Math.PI * 2, true);
            ctx.fillStyle = entity.color;
            ctx.fill();
        
            // Draw body
            ctx.beginPath();
            ctx.moveTo(x, y + headRadius);
            ctx.lineTo(x, y + headRadius + bodyHeight);
            ctx.strokeStyle = entity.color;
            ctx.lineWidth = 2;
            ctx.stroke();        
    
            if (entity.isWalking) {
                drawWalkingEntity(entity, x, y, headRadius, bodyHeight, armLength, legLength, legAngle, armAngle);
            } else {
                drawStandingEntity(entity, x, y, headRadius, bodyHeight, armLength, legLength);
            } 
        }

        if(entity === player){
            entity.draw(ctx);
        }
    
        
    }
    
    function drawWalkingEntity(entity, x, y, headRadius, bodyHeight, armLength, legLength, legAngle, armAngle) {
        var shoulderOffset = armLength / 3;
        var upperArmLength = armLength / 2;
        var forearmLength = armLength / 2;
        var upperArmAngle = Math.PI / 12; // Slight outward angle
        var forearmAngle = -Math.PI / 12; // Slight inward angle
        var swayAngle = armAngle; // Swaying angle for arms based on the walking animation
    
        // Draw arms with sway (Left and right sides are mirror images)
        [1, -1].forEach(side => {
            // Draw shoulder
            ctx.beginPath();
            ctx.moveTo(x, y + headRadius);
            ctx.lineTo(x + side * shoulderOffset, y + headRadius);
            ctx.strokeStyle = entity.color;
            ctx.lineWidth = 2;
            ctx.stroke();
    
            // Draw upper arm with sway
            ctx.beginPath();
            ctx.moveTo(x + side * shoulderOffset, y + headRadius);
            ctx.lineTo(x + side * shoulderOffset + side * upperArmLength * Math.sin(upperArmAngle + swayAngle), y + headRadius + upperArmLength * Math.cos(upperArmAngle + swayAngle));
            ctx.strokeStyle = entity.color;
            ctx.lineWidth = 2;
            ctx.stroke();
    
            // Draw forearm with sway
            ctx.beginPath();
            ctx.moveTo(x + side * shoulderOffset + side * upperArmLength * Math.sin(upperArmAngle + swayAngle), y + headRadius + upperArmLength * Math.cos(upperArmAngle + swayAngle));
            ctx.lineTo(x + side * shoulderOffset + side * upperArmLength * Math.sin(upperArmAngle + swayAngle) + side * forearmLength * Math.sin(forearmAngle + swayAngle), y + headRadius + upperArmLength * Math.cos(upperArmAngle + swayAngle) + forearmLength * Math.cos(forearmAngle + swayAngle));
            ctx.strokeStyle = 'red'; // Color for the forearm
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    
        // Draw legs with walking animation
        ctx.beginPath();
        ctx.moveTo(x, y + headRadius + bodyHeight);
        ctx.lineTo(x + legLength * Math.sin(legAngle), y + headRadius + bodyHeight + legLength * Math.cos(legAngle));
        ctx.moveTo(x, y + headRadius + bodyHeight);
        ctx.lineTo(x - legLength * Math.sin(legAngle), y + headRadius + bodyHeight + legLength * Math.cos(legAngle));
        ctx.strokeStyle = entity.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    function drawStandingEntity(entity, x, y, headRadius, bodyHeight, armLength, legLength) {
        var shoulderOffset = armLength / 3;
        var upperArmLength = armLength / 2;
        var forearmLength = armLength / 2;
        var upperArmAngle = Math.PI / 12; // Slight outward angle
        var forearmAngle = -Math.PI / 12; // Slight inward angle

        // (Left and right sides are mirror images, so we can use a loop to reduce code duplication)
        [1, -1].forEach(side => {
            // Draw shoulder
            ctx.beginPath();
            ctx.moveTo(x, y + headRadius);
            ctx.lineTo(x + side * shoulderOffset, y + headRadius);
            ctx.strokeStyle = entity.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw upper arm
            ctx.beginPath();
            ctx.moveTo(x + side * shoulderOffset, y + headRadius);
            ctx.lineTo(x + side * shoulderOffset + side * upperArmLength * Math.sin(upperArmAngle), y + headRadius + upperArmLength * Math.cos(upperArmAngle));
            ctx.strokeStyle = entity.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw forearm
            ctx.beginPath();
            ctx.moveTo(x + side * shoulderOffset + side * upperArmLength * Math.sin(upperArmAngle), y + headRadius + upperArmLength * Math.cos(upperArmAngle));
            ctx.lineTo(x + side * shoulderOffset + side * upperArmLength * Math.sin(upperArmAngle) + side * forearmLength * Math.sin(forearmAngle), y + headRadius + upperArmLength * Math.cos(upperArmAngle) + forearmLength * Math.cos(forearmAngle));
            ctx.strokeStyle = 'red'; // Color for the forearm
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw legs
        ctx.beginPath();
        ctx.moveTo(x, y + headRadius + bodyHeight);
        ctx.lineTo(x - legLength, y + headRadius + bodyHeight + legLength);
        ctx.moveTo(x, y + headRadius + bodyHeight);
        ctx.lineTo(x + legLength, y + headRadius + bodyHeight + legLength);
        ctx.strokeStyle = entity.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    function drawAttackBox(entity) {
        ctx.fillStyle = entity === player ? '#FF0000' : '#FF5733';
        const direction = entity.direction instanceof Function ? entity.direction() : entity.direction;
        const offset = direction === 'right' ? entity.width + entity.attackBox.offset : -entity.attackBox.width - entity.attackBox.offset;
        ctx.fillRect(entity.x + offset, entity.y + (entity.height / 2) - (entity.attackBox.height / 2), entity.attackBox.width, entity.attackBox.height);
    }  

    function drawCanvasOutline() {
        const outlineColor = "#FF0000";  
        const outlineWidth = 5;         
    
        ctx.strokeStyle = outlineColor; 
        ctx.lineWidth = outlineWidth;
    
        // Draw the outline rectangle
        ctx.strokeRect(0 + (outlineWidth / 2), 0 + (outlineWidth / 2), gameWindow.width - outlineWidth, gameWindow.height - outlineWidth);
    }
    
    function draw() {
        if (!player) return; // Exit the function if player is null
    
        let zoomFactor = 2; // Set the zoom level, adjust this value to your preference
    
        // Calculate the desired center of the zoom (player's position)
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
    
        // Save the current state of the context
        ctx.save();
    
        // Translate to the desired center of the zoom
        ctx.translate(gameWindow.width / 2, gameWindow.height / 2);
    
        // Scale by the zoom factor
        ctx.scale(zoomFactor, zoomFactor);
    
        // Translate back by the desired center of the zoom, adjusted for scaling
        ctx.translate(-centerX, -centerY);
    
        // Draw the background, entities, platforms, and other game elements as before
        //ctx.clearRect(0, 0, canvas.width / zoomFactor, canvas.height / zoomFactor); // Clear the canvas, considering the zoom factor
        ctx.clearRect(0, 0, gameWindow.width * zoomFactor, gameWindow.height * zoomFactor);

        drawBackground();
        drawEntity(player);
        platforms.forEach(drawPlatform);
        walls.forEach(drawWall);
        
        if(player.attacking) player.abilities.slash;
        // Assuming enemies is an array:
        enemies.forEach(enemy => {
            drawEntity(enemy);
            if (enemy.attacking) drawAttackBox(enemy);
        });
    
        // Restore the context state to revert the transformation
        ctx.restore();

        drawCanvasOutline();

    }
    
    window.addEventListener('resize', () => {
        gameWindow.width = window.innerWidth;
        gameWindow.height = window.innerHeight;
        // You may need to adjust other elements or calculations based on the new canvas size
    });

    // ----------------------- GAME OBJECTS ------------------------------

    const ground = {
        y: gameWindow.height-250,  // Assuming the ground is 50px tall.
        height: 50,
        color: '#000000'
    };

    function loadPlayerJson() {
        return fetch('player.json')
            .then(response => response.json())
            .catch(error => console.error('Error loading player JSON:', error));
    }

    class Player {
        constructor(data, items) {
            Object.assign(this, data);
            this.weapon = items.getWeapon(0);
            this.armor = items.getArmor(0);
            //this.vy = 0;
            this.frameCounter = 0; // Add this line to initialize the frame counter
            this.isWalking = false;
            this.isIdle = true;
            this.abilities = {
                'slash': new Slash(this),
                'dash': new Dash(this),
                'block': new Block(this)
            };
            this.dashing = false;
            this.blocking = false;
            this.dashDistanceTravelled = 0;
            this.imageLoaded = false;

            const image = new Image();

            image.onload = () => {
                this.imageLoaded = true; // set the flag to true when image is loaded
            };

            image.src = './images/Knight_Armor.png';

            this.animations = {
                walk: new Animation(image, 96, 96, 8, 0, 12),
                attack: new Animation(image, 96, 96, 2, 1, 8),
                idle: new Animation(image, 96, 96, 4, 1, 16)
            };
            this.currentState = 'idle';
        }

        moveLeft() {
            player.setAnimation('walk');
            this.vx = -this.speed;
            this.direction = 'left';
            this.isWalking = true;
        }
    
        moveRight() {
            player.setAnimation('walk');
            this.vx = this.speed;
            this.direction = 'right';
            this.isWalking = true;
        }
    
        jump() {
            if (!this.jumping) {
                this.jumping = true;
                this.vy = this.jumpStrength;
            }
        }
    
        slam() {
            if (!this.slamming) {
                this.slamming = true;
                this.vy += this.slamStrength; // Define slamStrength as a player property to control the speed of the slam
            }
        }

        draw(ctx) {
            if (this.imageLoaded) {
                this.animations[this.currentState].draw(ctx, this.x, this.y, this.direction);
            }
        }
        
        setAnimation(state) {
            if (this.currentState !== state) {
                this.animations[this.currentState].reset();
                this.currentState = state;
            }
        }
    
        initiateAttack() {
            if (!this.attacking) {
                player.setAnimation('attack');
                this.attacking = true;
                setTimeout(() => {
                    this.attacking = false;
                }, 200);
            }
        }

        initiateAbility(abilityName) {
            if (this.abilities[abilityName]) {
                this.abilities[abilityName].use();
            }
        }

        hitWall() {
            let nextX;
            const bufferDistance = 2;  // The distance to stop before the wall
        
            if (this.direction === 'left') {
                nextX = this.x + this.vx - bufferDistance;
            } else if (this.direction === 'right') {
                nextX = this.x + this.vx + bufferDistance;
            } else {
                return null; // If the direction isn't set, no wall is hit
            }
        
            for (let wall of walls) {
                if (nextX < wall.x + wall.width && 
                    nextX + this.width > wall.x && 
                    this.y + this.height > wall.y && 
                    this.y < wall.y + wall.height) {
                    if (this.direction === 'left') {
                        this.x = wall.x + wall.width + bufferDistance;  // Set the player's x position to the right side of the wall + buffer
                    } else if (this.direction === 'right') {
                        this.x = wall.x - this.width - bufferDistance;  // Set the player's x position to the left side of the wall - buffer
                    }
                    this.vx = 0;  // Stop the player's movement in the x direction
                    return wall;
                }
            }
            return null;
        }
    
        updateInvulnerability() {
            if (this.invulnerability > 0) {
                this.invulnerability--;
                if (this.invulnerability === 0) {
                    this.color = this.originalColor; // turn back to original color
                }
            }
        }
    
        updateHealthBar() {
            let healthBarElement = document.getElementById('healthBar');
            let healthPercentage = (this.health / this.maxHealth) * 100;
            healthBarElement.style.width = healthPercentage + '%';
        }

        updateStaminaBar(){
            if(!this.dashing && !this.blocking && this.stamina != this.maxStamina){
                this.stamina += this.staminaRecoveryRate;
            }

            let staminaBarElement = document.getElementById('staminaBar');
            let staminaPercentage = (this.stamina / this.maxStamina) * 100;
            staminaBarElement.style.width = staminaPercentage + '%';
        }

        updatePosition(gameWindow, backgroundX, backgroundWidth, backgroundSpeed, CAMERA_MARGIN) {
            const playerScreenX = gameWindow.width / 2;
            const worldShift = playerScreenX - this.x;
            backgroundX += worldShift;
            this.x += this.vx;
        
            if (this.x > gameWindow.width - CAMERA_MARGIN) {
                let cameraShift = backgroundSpeed;
                if (backgroundX <= gameWindow.width - backgroundWidth) {
                    cameraShift = 0;
                }
                backgroundX -= cameraShift;
            } else if (this.x < CAMERA_MARGIN) {
                let cameraShift = backgroundSpeed;
                if (backgroundX >= 0) {
                    cameraShift = 0;
                }
                backgroundX += cameraShift;
            }
        
            backgroundX = Math.min(0, Math.max(gameWindow.width - backgroundWidth, backgroundX));
        
            return backgroundX; // Return the updated backgroundX
        }

        checkCollision(){
            this.hitWall();
            physics.checkGroundCollision(this);
        }
            
        update() {
            this.frameCounter++; // Increment the frame counter every update
            backgroundX = this.updatePosition(gameWindow, backgroundX, backgroundWidth, backgroundSpeed, CAMERA_MARGIN);
            this.checkCollision();
            this.updateInvulnerability();
            this.updateHealthBar();
            this.updateStaminaBar();
        }
    }  

    class Enemy {
        constructor(x, y, platforms, player, data, items) {
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
            this.weapon = items.getWeapon(0);
            this.armor = items.getArmor(0);
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
            this.frameCounter = 0;
            this.isWalking = false;
            
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
            this.isWalking = true;
            if (this.isPlayerInView()) {
                this.chasePlayer();
            } else if (this.inAggroMode) {
                this.returnToOriginalPosition();
            } else {
                this.pace();
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
            
            // Check if the player is within the attack range
            if (distanceToPlayer <= this.attackRange) {
                this.attackPlayer();
                return; // If in attack range, don't move, just try to attack
            }

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
        isWithinGameWindowView() {
            // Check if the enemy is within the horizontal range of the camera
            return this.x + this.width > camera.x && this.x < camera.x + gameWindow.width;
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
            const currentTime = Date.now();
            if (!this.attacking && (currentTime - this.lastAttackTime) > this.attackCooldown) {
                // Randomize the next attack time
                this.attackCooldown = Math.random() * 2000 + 1000; // Random delay between 1 to 3 seconds
    
                this.attacking = true;
                setTimeout(() => {
                    this.attacking = false;
                }, 200);
                this.lastAttackTime = currentTime;
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

    class Item {
        constructor(data) {
            this.weapons = data.weapons;
            this.armor = data.armor;
        }
    
        getWeapon(index) {
            return this.weapons[index];
        }
    
        getArmor(index) {
            return this.armor[index];
        }
    }

    class Attack {
        constructor(width, height, offset) {
            this.width = width;
            this.height = height;
            this.offset = offset;
        }
    }
    
    // ----------------------- ABILITIES ------------------------------


    class Ability {
        constructor(name, cooldown) {
            this.name = name;
            this.cooldown = cooldown; // Cooldown time in milliseconds
            this.lastUsedTime = 0;    // Time at which the ability was last used
        }
    
        canUse() {
            return Date.now() - this.lastUsedTime >= this.cooldown;
        }
    
        use() {
            if (this.canUse()) {
                this.performAbility();
                this.lastUsedTime = Date.now();
            }
        }
    
        performAbility() {
            // Default: Do nothing. This will be overridden by specific abilities.
        }
    }

    class Slash extends Ability {
        constructor(player) {
            super('slash', 1000); // 200ms cooldown for the slash ability
            this.player = player;
        }
    
        performAbility() {
            this.player.attacking = true;
            player.setAnimation('attack');
            setTimeout(() => {
                this.player.attacking = false;
                player.setAnimation('idle');
            }, this.cooldown);
        }
    }
    
    class Dash extends Ability {
        constructor(player) {
            super('dash', 500); 
            this.player = player;
            this.dashTotalDistance = 300;
            this.dashSpeed = 10;
            this.dashDamage = 10;
            this.staminaCost = 20;
        }
        
        performAbility() {
            if (this.player.stamina > this.staminaCost && !this.player.dashing) {
                this.player.stamina -= this.staminaCost;
                this.player.dashing = true;
                this.player.dashDistanceTravelled = 0;
                
                // Let the thrust happen till the distance is covered or until the cooldown, whichever is smaller.
                const dashInterval = setInterval(() => {
                    this.handleThrust();
                    if (this.player.dashDistanceTravelled >= this.dashTotalDistance) {
                        this.player.dashing = false;
                        clearInterval(dashInterval);
                    }
                }, 16);
            }
        }
        
        handleThrust() {
            const direction = this.player.direction;
    
            if (direction === 'right') {
                this.player.x += this.dashSpeed;
            } else if (direction === 'left') {
                this.player.x -= this.dashSpeed;
            }
    
            this.player.dashDistanceTravelled += this.dashSpeed;
    
            // TODO: Handle collision here. If the player collides with an entity while dashing, apply dash.
            // If a collision is detected, reduce the health of that entity by dashDamage.
        }
    }

    class Block extends Ability {
        constructor(player) {
            super('block', 500); // 500 is an arbitrary cooldown value; adjust as needed.
            this.player = player;
            this.staminaDrainRate = 5; // Amount of stamina drained per interval (e.g., every second)
            this.defenceBoost = 30;   // The boost in defence when blocking
            this.blockInterval = null; // Used to store the interval that drains stamina
            this.originalDefence = player.armor.defense; // Store the original defence value
        }
    
        performAbility() {
            console.log("Attempting to block...");
            // Only allow blocking if the player has stamina and isn't already blocking
            if (this.player.stamina > 0 && !this.player.blocking) {
                console.log("Blocking started...");
                this.player.blocking = true;
                this.player.armor.defense += this.defenceBoost; // Boost the defence
        
                // Begin draining stamina
                this.blockInterval = setInterval(() => {
                    this.player.stamina -= this.staminaDrainRate;
                    console.log("stamina: "+ this.player.stamina);
                    
                    // If stamina is exhausted, stop blocking
                    if (this.player.stamina <= 0) {
                        this.player.stamina = 0;
                        this.stopBlocking();
                    }
                }, 1000); // This drains stamina every second; adjust as needed.
            } else {
                console.log("Cannot block. Stamina:", this.player.stamina, "Is blocking:", this.player.blocking);
            }
        }        
    
        stopBlocking() {
            this.player.blocking = false;
            this.player.armor.defense = this.originalDefence; // Restore the original defence value
            clearInterval(this.blockInterval);
            this.blockInterval = null;
        }
    }  
    
    // ----------------------- ANIMATION -----------------------------

    class Animation {
        constructor(image, spriteWidth, spriteHeight, frameCount, spriteRow = 0, frameRate = 10) {
            this.image = image;
            this.spriteWidth = spriteWidth;
            this.spriteHeight = spriteHeight;
            this.frameCount = frameCount;
            this.spriteRow = spriteRow;
            this.currentFrame = 0;
            this.frameRate = frameRate; // How many calls to `updateFrame` per frame change
            this.frameCounter = 0;     // Counter to keep track of calls to `updateFrame`
        }
    
        draw(ctx, x, y, direction) {
            const sx = this.currentFrame * this.spriteWidth;
            const sy = this.spriteRow * this.spriteHeight;
    
            // Check for player direction and apply flip transformation if needed
            if (direction !== 'right') {
                ctx.save(); // Save the current state
                ctx.translate(x + this.spriteWidth, y); // Move the drawing cursor to the right edge of the image
                ctx.scale(-1, 1); // Flip the image horizontally
                ctx.drawImage(this.image, sx, sy, this.spriteWidth, this.spriteHeight, 0, 0, this.spriteWidth, this.spriteHeight); // Draw the image
                ctx.restore(); // Restore to the previous state
            } else {
                ctx.drawImage(this.image, sx, sy, this.spriteWidth, this.spriteHeight, x, y, this.spriteWidth, this.spriteHeight);
            }
    
            this.updateFrame();
        }
    
        updateFrame() {
            // Increment the frameCounter
            this.frameCounter++;
    
            // Check if frameCounter has reached the frameRate threshold
            if (this.frameCounter >= this.frameRate) {
                if (this.currentFrame < this.frameCount - 1) {
                    this.currentFrame++;
                } else {
                    this.currentFrame = 0;
                }
                // Reset frameCounter after updating currentFrame
                this.frameCounter = 0;
            }
        }
    
        reset() {
            this.currentFrame = 0;
            this.frameCounter = 0; // Also reset the frameCounter
        }
    }

    // ----------------------- CAMERA --------------------------------

    const camera = {
        x: 0,
        prevPlayerX: 0, // Add this line to keep track of the player's previous x position
        smoothness: 0.05  // Adjust this value to control the smoothing
    };
    
    // ----------------------- CONTROLS ------------------------------
    
    document.addEventListener('keydown', (event) => {   //Note if cap is on the key binding won't work
        switch (event.key) {
            case 'a':
                player.isWalking = true;
                player.moveLeft();
                break;
            case 'd':
                player.isWalking = true;
                player.moveRight();
                break;
            case 'w':
                player.jump();
                break;
            case ' ':
                if (player.inAir) player.slam();
                break;
        }

        if (event.shiftKey) {
            player.abilities.dash.use();
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (['a', 'd'].includes(event.key)) {
            player.setAnimation('idle');
            player.vx = 0;
            player.isWalking = false;
        }
    });
    
    gameWindow.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // Left mouse button
            player.abilities.slash.use();
        } else if (event.button === 2) { // Right mouse button
            player.abilities.block.use();
        }
    });

    gameWindow.addEventListener('mouseup', (event)=>{
        if (event.button === 2) { // Right mouse button
            player.abilities.block.stopBlocking();
        }
    });

    gameWindow.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });    
    
    document.addEventListener('wheel', function(e){
        if (e.ctrlKey) {
          e.preventDefault();
        }
      }, { passive: false });

    // ----------------------- GAME PHYSICS ------------------------------

    class Physics {
        constructor(gravity) {
            this.gravity = gravity;
        }
    
        applyGravity(entity) {
            entity.vy += this.gravity;
            entity.y += entity.vy;
    
            // Check collision with platforms
            let platform = this.onPlatform(entity); // Assuming onPlatform is a method in entity
            if (platform) {
                entity.y = platform.y - entity.height;
                entity.jumping = false;
                entity.slamming = false;
                entity.vy = 0;
            } else if (entity.y + entity.height > ground.y) {
                entity.y = ground.y - entity.height;
                entity.jumping = false;
                entity.slamming = false;
                entity.vy = 0;
            } 
        }

        onPlatform(entity) {
            let nextY = entity.y + entity.height + entity.vy;
    
            for (let platform of platforms) {
                if (entity.x < platform.x + platform.width &&
                    entity.x + entity.width > platform.x &&
                    nextY >= platform.y &&
                    entity.y + entity.height <= platform.y) {
                        entity.vy = 0;
                    return platform;
                }
            }
    
            return null;
        }    
        
        checkGroundCollision(entity) {
            if (entity.jumping || !this.onGround(entity)) {
                this.applyGravity(entity);
                let platform = this.onPlatform(entity);
                if (platform) {
                    entity.y = platform.y - entity.height;
                    entity.jumping = false;
                    entity.vy = 0;
                }
            } else {
                entity.vy = 0;
            }
        }
        
        onGround(entity) {
            let onTheGround = entity.y + entity.height === ground.y;
            let platform = this.onPlatform(entity);
    
            if (platform) {
                onTheGround = true;
            }
    
            return onTheGround;
        }

        checkAttacksBetween(entity1, entity2) {
            // Only calculate attackBox if entity1 is currently attacking
            if (entity1.attacking) {
                const attackBox1 = {
                    x: (entity1.direction instanceof Function ? entity1.direction() : entity1.direction) === 'right' ? entity1.x + entity1.width + entity1.attackBox.offset : entity1.x - entity1.attackBox.width - entity1.attackBox.offset,
                    y: entity1.y + (entity1.height / 2) - (entity1.attackBox.height / 2),
                    width: entity1.attackBox.width,
                    height: entity1.attackBox.height
                };
        
                const currentTime = Date.now();
        
                if (currentTime - entity1.lastAttackTime >= entity1.attackCooldown && this.rectanglesCollide(attackBox1, entity2)) {
                    const damage = this.calculateDamage(entity1, entity2);
                    entity2.health -= damage;
        
                    entity1.lastAttackTime = currentTime;
                    entity2.invulnerability = 40; 
                    entity2.color = '#FFFFFF'; 
                }
            }
        }
        
        rectanglesCollide(rect1, rect2, buffer = -10) {
            return rect1.x < rect2.x + rect2.width - buffer &&
                rect1.x + rect1.width - buffer > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y;
        }
        
        calculateDamage(attacker, defender) {
            const baseDamage = attacker.weapon ? attacker.weapon.damage : 0;
            const defense = defender.armor ? defender.armor.defense : 0;
        
            let damage = baseDamage - defense;
            return Math.max(damage, 0); // simplified way to prevent negative damage
        }
        
    }
    
    //------------------UPDATE-----------------
       
    function update() {
        if (!player) return;

        player.update();

        // Define an array to hold the indices of enemies to remove
        const enemiesToRemove = [];

        enemies.forEach((enemy, index) => {

            if(enemy.isWithinGameWindowView){
                enemy.move();
            } else {
                return;
            }

            this.frameCounter++;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const horizontalDistance = Math.abs(dx);
            const verticalDistance = Math.abs(dy);
            const totalDistance = Math.sqrt(dx * dx + dy * dy);

            // Check if the enemy's health is 0 or lower
            if (enemy.health <= 0 && !enemy.dead) {
                enemy.dead = true; // Set the enemy as deada
                enemiesToRemove.push(index); // Add the index to the array for later removal
                enemy.flash(3, () => {
                    // You can perform any additional logic you need here after flashing
                });
            }

            // Skip the rest of the logic if the enemy is dead
            if (enemy.dead) return;

        
            if (totalDistance < enemy.attackRange && verticalDistance < 10) {
                enemy.attackPlayer(); // We're just making sure to call this here as well
            }

            if (!enemy.onGroundOrPlatform()) {
                physics.checkGroundCollision(enemy);
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

            //physics.handleEntityCollision(player, enemy);
            physics.checkAttacksBetween(player, enemy);
            physics.checkAttacksBetween(enemy, player);
        });

        // Remove enemies in reverse order to prevent index shifting
        for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
            enemies.splice(enemiesToRemove[i], 1);
        }
    }
    
    // ----------------------- LEVEL DESIGN ---------------------------

    const enemies = [];    // To store enemies
    let platforms = [];  // To store platforms globally
    let walls = []; //TO store walls globally
    let TILE_SIZE = 50;
    const physics = new Physics(0.5);

    function loadLevel(levelText) {
        platforms = [];  // To reset platforms for each new level
        const spawnPromises = []; // Array to store spawn promises
        
        const rows = levelText.trim().split('\n');
        for (let y = rows.length - 1; y >= 0; y--) {  // Start from the last row
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
                            player.x = x*TILE_SIZE; // Assume TILE_SIZE is the width of a tile
                            player.y = y*TILE_SIZE; // Assume TILE_SIZE is the height of a tile
                        }
                        break;
                    case 'w':
                        walls.push(createWall(x,y));
                        break;
                }
            }
        }

        widthLevel = rows[0].length*TILE_SIZE;
        heightLevel = rows.length*TILE_SIZE;

        setWindowSize(widthLevel,heightLevel);
        
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
            x: x * TILE_SIZE,
            y: y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            color: '#4CAF50'
        };
        return platform;
    }

    function createWall(x,y){
        const wall = {
            x: x * TILE_SIZE,
            y: y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            color: '#A52A2A'
        };
        return wall;
    }

    function spawnEnemy(x, y) {
        // Return a promise that resolves with the new enemy
        return new Promise((resolve, reject) => {
            fetch('enemy.json')
                .then(response => response.json())
                .then(data => {
                    // Construct a new enemy with the fetched data
                    const newEnemy = new Enemy(x * TILE_SIZE, y * TILE_SIZE, platforms, player, data, items);
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
