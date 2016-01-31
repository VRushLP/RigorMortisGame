var FOREST_STAGE = 0;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

/*********
 * Timer *
 *********/

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}


/********************
 * GameEngine Start *
 ********************/

function GameEngine() {
    this.agents = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.cameraX = 0;
    this.cameraY = 0;
    
    this.stages = [];
    this.currentStage;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    this.loadStage(FOREST_STAGE);
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    var that = this;

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (e.which === 68) that.pressRight = true;
        if (e.which === 83) that.pressDown = true;
        if (e.which === 65) that.pressLeft = true;
        if (e.which === 87) that.pressUp = true;
        //console.log(e.which);
        e.preventDefault();
    }, false);
    
    this.ctx.canvas.addEventListener("keyup", function (e) {
        if (e.which === 68) that.pressRight = false;
        if (e.which === 83) that.pressDown = false;
        if (e.which === 65) that.pressLeft = false;
        if (e.which === 87) that.pressUp = false;
        //console.log(e.which);
        e.preventDefault();
    }, false);
}

GameEngine.prototype.addAgent = function (entity) {
    this.agents.push(entity);
}

GameEngine.prototype.addStage = function (stage) {
    this.stages.push(stage);
}

GameEngine.prototype.loadStage = function (stageNumber) {
    this.currentStage = stageNumber;
    this.agents = this.stages[this.currentStage].entityList;
}

/*********************
 * GameEngine Upkeep *
 *********************/

GameEngine.prototype.loop = function () {
    for(var i = 0; i < this.agents.length; i++) {
        
        if(this.agents[i].entity.controllable === true) {
            if(this.pressRight) this.agents[i].readInput("right");
            if(this.pressDown) this.agents[i].readInput("down");
            if(this.pressUp) this.agents[i].readInput("up");
            if(this.pressLeft) this.agents[i].readInput("left");
            
            if(!this.pressLeft && !this.pressRight && !this.pressDown && !this.pressUp) this.agents[i].readInput("none");
        }
    }
    
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (var i = 0; i < this.stages.length; i++) {
        this.stages[i].drawBackground(this.ctx, this.cameraX);
    }
    for (var i = 0; i < this.agents.length; i++) {
        this.agents[i].entity.draw(this.cameraX, this.cameraY);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    for (var i = 0; i < this.agents.length; i++) {
        this.agents[i].update();
    }
}

/**
 * Move an entity by a requested amount after checking for collision.
 * If a collision is detected, move the entity in a way that a collision does not occur.
 */
GameEngine.prototype.requestMove = function(entity, amountX, amountY) {
    if(!entity.moveable) return;
    
    //Calculate the new sides of the moving entity.
    var newLeft = entity.x + amountX;
    var newRight = newLeft + entity.width;
    var newTop = entity.y + amountY;
    var newBottom = newTop + entity.height;
    
    for (var i = 0; i < this.agents.length; i++) {
        
        var other = this.agents[i].entity;
        if(other === entity) continue; //Prevent an entity from colliding with itself.
        if(!other.collidable) continue;
        
        var xMoveValid = true;
        var yMoveValid = true;
        var adjustedX = 0;
        var adjustedY = 0;
        
        
        /*
         * For each side, check if it will be in the same plane as the other entity.
         * If so, determine how far the entity can move before it would be.
         */
        if(other.x <= newLeft && newLeft <= other.x + other.width) {
            xMoveValid = false;
            if(amountX > 0) {
                adjustedX = other.x - entity.x + other.width + 1;
            }
        }
        if(other.x <= newRight && newRight <= other.x + other.width) {
            xMoveValid = false;
            if(amountX > 0) {
                adjustedX = other.x - entity.x - entity.width - 1;
            }
        }
         if(other.y <= newTop && newTop <= other.y + other.height) {
            if(amountY > 0) {
                adjustedY = other.y - entity.y + other.height + 1;
            }
            yMoveValid = false;
        }
          if(other.y <= newBottom && newBottom <= other.y + other.height) {
            if(amountY > 0) {
                adjustedY = other.y - entity.y - entity.height - 1;
            }
            yMoveValid = false;
        }
        
        
        /*
         * If the moving entity will be in the same horizontal and vertical plane as the other,
         * then a collision will occur. If so, move the entity only as far as it can before a collision.
         * TODO: If two collisions are possible, this may only detect and adjust for one of them.
         */
        if(!xMoveValid && !yMoveValid) {
            amountX = adjustedX;
            amountY = adjustedY;
            break;
        }
    }
    
    //Move the entity.
    entity.x += amountX;
    entity.y += amountY;
    
    //Prevent unit from moving off left side of screen.
    if(entity.x < 0) entity.x = 0;
    
    if(entity.camerable) {
        //Only begin moving the camera once the player is halfway across the screen.
        if(entity.x > (this.surfaceWidth / 2) - (entity.width / 2)) {
            //Keeps the camera centered on the player.
            this.cameraX = (this.surfaceWidth / 2) - entity.x - (entity.width / 2);
        } else {
            this.cameraX = 0;
        } 
        this.cameraY = entity.y - (entity.height / 2) - (this.surfaceHeight / 2);
    }
    
    //Respawn the player if they fall off the stage.
    if(entity.respawnable && entity.y > this.surfaceHeight + 150) {
//        entity.x = this.stages[this.currentStage].spawnX;
//        entity.y = this.stages[this.currentStage].spawnY;
    }
}

/**
 * Return true if the entity is directly on top of another entity; false otherwise.
 */
GameEngine.prototype.checkBottomCollision = function(entity) {
    var onGround = false;
    
    for (var i = 0; i < this.agents.length; i++) {
        var other = this.agents[i].entity;
        if(other === entity) continue; //Prevent an entity from detecting itself.
        
        var belowEntity = false;
        //Check if the left side of this entity is within the same plane as the other.
        if (entity.x >= other.x && entity.x <= other.x + other.width) {
            belowEntity = true;
        }        
        //Check the right side.
        if (entity.x + entity.width >= other.x && entity.x + entity.width <= other.x + other.width) {
            belowEntity = true;
        }
        
        //If the entity is in the same vertical plane, check if its bottom is a pixel above the other entity.
        //If both are true, then the entity is directly on top of the other.
        if(belowEntity) {
            if (entity.y + entity.height >= other.y - 1 && entity.y + entity.height <= other.y + other.height) {
                onGround = true;
                break;
            }
        }   
    }
    return onGround;
}

/**
 * Return true if the entity is directly below another entity; false otherwise.
 */
GameEngine.prototype.checkTopCollision = function(entity) {
    var topCollision = false;
    
    for (var i = 0; i < this.agents.length; i++) {
        var other = this.agents[i].entity;
        if(other === entity) continue; //Prevent the entity from detecting itself.
        
        var aboveEntity = false;
        //Check if the top side of this entity is within the same plane as the other.
        if (entity.x >= other.x && entity.x <= other.x + other.width) {
            aboveEntity = true;
        }      
        //Check the bottom side.
        if (entity.x + entity.width >= other.x && entity.x + entity.width <= other.x + other.width) {
            aboveEntity = true;
        }
        
        //If the entity is in the same horizontal plane, check if its top is a pixel below the other entity.
        //If both are true, then the entity is directly below the other.
        if(aboveEntity) {
            if (entity.y >= other.y && entity.y <= other.y + other.height + 1) {
                topCollision = true;
                break;
            }
        }
    }
    return topCollision;
}
