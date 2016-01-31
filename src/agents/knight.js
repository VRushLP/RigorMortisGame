//Animation Constants
var REST_RIGHT_ANIMATION = 0;
var REST_LEFT_ANIMATION = 1;
var WALKING_RIGHT_ANIMATION = 2;
var WALKING_LEFT_ANIMATION = 3;
var JUMPING_RIGHT_ANIMATION = 4;
var JUMPING_LEFT_ANIMATION = 5;
var FALLING_RIGHT_ANIMATION = 6;
var FALLING_LEFT_ANIMATION = 7;

//Direction Constants
var LEFT = 0;
var RIGHT = 1;

//Physics Constants
var TERMINAL_VELOCITY = 16;
var JUMP_VELOCITY = 10;
var Y_ACCELERATION = 0.3
var RUNNING_SPEED = 5;
var PRESS_DOWN_SPEED = 2;

/**
 * Create a new Knight agent.
 * This will create a physical entity to represent it in the game engine,
 * and also attach to it all animations.
 */
function Knight(game, AM, x, y) {
    this.entity = new Entity(game, x , y, 48, 54);
    this.velocity = 0;
    this.direction = RIGHT;

    var KnightRestRight = new Animation(AM.getAsset("./img/knight/knight standing.png"), 48, 54, 0.10, true);
    KnightRestRight.addFrame(0, 0);
    var KnightRestLeft = new Animation(AM.getAsset("./img/knight/knight standing flipped.png"), 48, 54, 0.10, true);
    KnightRestLeft.addFrame(0, 0);
    
    var KnightWalkRight = new Animation(AM.getAsset("./img/knight/knight run.png"), 54, 54, 0.10, true);
    KnightWalkRight.addFrameBatch(0, 0, 3);
    var KnightWalkLeft = new Animation(AM.getAsset("./img/knight/knight run flipped.png"), 54, 54, 0.10, true);
    KnightWalkLeft.addFrameBatch(0, 0, 3);
    
    var KnightJumpRight = new Animation(AM.getAsset("./img/knight/knight jump.png"), 52, 61, 0.10, true);
    KnightJumpRight.addFrame(0, 0);
    var KnightJumpLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"), 52, 61, 0.10, true);
    KnightJumpLeft.addFrame(53, 0);
    
    var KnightFallRight = new Animation(AM.getAsset("./img/knight/knight jump.png"), 52, 61, 0.10, true);
    KnightFallRight.addFrame(53, 0);
    var KnightFallLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"), 52, 61, 0.10, true);
    KnightFallLeft.addFrame(0, 0);
    
    this.entity.addAnimation(KnightRestRight);
    this.entity.addAnimation(KnightRestLeft);
    this.entity.addAnimation(KnightWalkRight);
    this.entity.addAnimation(KnightWalkLeft);
    this.entity.addAnimation(KnightJumpRight);
    this.entity.addAnimation(KnightJumpLeft);
    this.entity.addAnimation(KnightFallRight);
    this.entity.addAnimation(KnightFallLeft);
}

Knight.prototype.draw = function () {
    this.entity.draw();
}

/**
 * Update the Knight agent.
 * As of right now, this only includes accounting for velocity and movement
 * from falling and jumping.
 */
Knight.prototype.update = function() {
    if(!this.entity.fallable) return;
    
    if (!this.entity.game.checkBottomCollision(this.entity)) {
        //If there is no bottom collision, then the agent is in the air, and should accelerate downwards.
        this.velocity += Y_ACCELERATION;
        if(this.velocity >= TERMINAL_VELOCITY) this.velocity = TERMINAL_VELOCITY;
    } else if (this.velocity > 0) {
        //If there is a bottom collision, then the agent is on the ground, and should have no downwards velocity.
        this.velocity = 0;
    }
    
    //If the agent is moving upwards, then it is jumping.
    //However, currently using jump animation whenever knight is in air.
    if(this.velocity < 0) {
        if (this.entity.game.checkTopCollision(this.entity)) {
            //If a top collision is detected, then the agent has hit a ceiling and must stop rising.
            this.velocity = 0;
        }
    }
    
    //If downwards velocity is present, request to move the agent with it.
    if(this.velocity !== 0) {
        this.entity.game.requestMove(this.entity, 0, this.velocity);
        if(this.velocity > 0) {
            if(this.direction === RIGHT) {
                this.entity.setAnimation(FALLING_RIGHT_ANIMATION);
            } else {
                this.entity.setAnimation(FALLING_LEFT_ANIMATION);
            }
        } else {
            if(this.direction === RIGHT) {
                this.entity.setAnimation(JUMPING_RIGHT_ANIMATION);
            } else {
                this.entity.setAnimation(JUMPING_LEFT_ANIMATION);
            }
        }  
    }
}

/**
 * Request the Knight agent to jump.
 */
Knight.prototype.jump = function() {
    //Allow the jump only if the agent is on the ground.
    if(this.entity.game.checkBottomCollision(this.entity)) {
        this.velocity = -(JUMP_VELOCITY);
    }
}

/**
 * Request the agent to process an input.
 */
Knight.prototype.readInput = function(input) {
    if (input === "down") {
        this.entity.game.requestMove(this.entity, 0, PRESS_DOWN_SPEED);
    } 
    if (input === "up") {
        this.jump();
    } 
    if (input === "left") {
        this.direction = LEFT;
        if(this.entity.game.checkBottomCollision(this.entity)) {
            //An agent should only walk if it is not in the air.
            this.entity.setAnimation(WALKING_LEFT_ANIMATION);
        }
        this.entity.game.requestMove(this.entity, -RUNNING_SPEED, 0);
    }
    if(input === "right") {
        this.direction = RIGHT;
        if(this.entity.game.checkBottomCollision(this.entity)) {
            //An agent should only walk if it is not in the air.
            this.entity.setAnimation(WALKING_RIGHT_ANIMATION);
        }
        this.entity.game.requestMove(this.entity, RUNNING_SPEED, 0);
    }
    if (input === "none") {
        if(this.direction === RIGHT) {
            this.entity.setAnimation(REST_RIGHT_ANIMATION);
        } else {
            this.entity.setAnimation(REST_LEFT_ANIMATION);
        }
    }
}