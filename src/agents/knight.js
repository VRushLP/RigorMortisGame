//Size constants
var KNIGHT_SIZE = {
    REST_WIDTH: 48,
    REST_HEIGHT: 54,
    WALK_WIDTH: 54,
    WALK_HEIGHT: 54,
    JUMP_WIDTH: 52,
    JUMP_HEIGHT: 61,
}

//Animation Constants
var KNIGHT_ANIM = {
    REST_RIGHT: 0,
    REST_LEFT: 1,
    WALKING_RIGHT: 2,
    WALKING_LEFT: 3,
    JUMPING_RIGHT: 4,
    JUMPING_LEFT: 5,
    FALLING_RIGHT: 6,
    FALLING_LEFT: 7,
    FRAME_DURATION : .1
}

//Direction Constants
var KNIGHT_DIR = {
    LEFT: 0,
    RIGHT: 1,
}

//Physics Constants
var KNIGHT_PHYSICS = {
    TERMINAL_VELOCITY : 16,
    //Initial jump velocity for tapping jump.
    JUMP_VELOCITY : 8,
    //Gravity's downward acceleration
    Y_ACCELERATION : 0.35,
    RUNNING_SPEED : 5,
    //Extra velocity added for holding down while falling.
    PRESS_DOWN_SPEED : 2,
    //Gravity reduction for holding up while rising.
    PRESS_UP_SPEED : 0.17,
}

/**
 * Create a new Knight agent.
 * This will create a physical entity to represent it in the game engine,
 * and also attach to it all animations.
 */
function Knight(game, AM, x, y) {
    this.entity = new Entity(game, x , y, 48, 54);
    this.velocity = 0;
    this.direction = KNIGHT_DIR.RIGHT;
    this.canJump = true;

    var KnightRestRight = new Animation(AM.getAsset("./img/knight/knight standing.png"), KNIGHT_SIZE.REST_WIDTH, KNIGHT_SIZE.REST_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightRestRight.addFrame(0, 0);
    var KnightRestLeft = new Animation(AM.getAsset("./img/knight/knight standing flipped.png"), KNIGHT_SIZE.REST_WIDTH, KNIGHT_SIZE.REST_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightRestLeft.addFrame(0, 0);
    
    var KnightWalkRight = new Animation(AM.getAsset("./img/knight/knight run.png"), KNIGHT_SIZE.WALK_WIDTH, KNIGHT_SIZE.WALK_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightWalkRight.addFrameBatch(0, 0, 3);
    var KnightWalkLeft = new Animation(AM.getAsset("./img/knight/knight run flipped.png"), KNIGHT_SIZE.WALK_WIDTH, KNIGHT_SIZE.WALK_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightWalkLeft.addFrameBatch(0, 0, 3);
    
    var KnightJumpRight = new Animation(AM.getAsset("./img/knight/knight jump.png"), KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightJumpRight.addFrame(0, 0);
    var KnightJumpLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"), KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightJumpLeft.addFrame(53, 0);
    
    var KnightFallRight = new Animation(AM.getAsset("./img/knight/knight jump.png"), KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightFallRight.addFrame(53, 0);
    var KnightFallLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"), KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
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
        this.velocity += KNIGHT_PHYSICS.Y_ACCELERATION;
        if (this.velocity >= KNIGHT_PHYSICS.TERMINAL_VELOCITY) this.velocity = KNIGHT_PHYSICS.TERMINAL_VELOCITY;
    } else if (this.velocity > 0) {
        //If there is a bottom collision, then the agent is on the ground, and should have no downwards velocity.
        this.velocity = 0;
        
        //If the knight previously had a jumping/falling animation, request the knight to go into a rest state.
        if(this.entity.currentAnimation === KNIGHT_ANIM.JUMPING_RIGHT ||
               this.entity.currentAnimation === KNIGHT_ANIM.JUMPING_LEFT ||
               this.entity.currentAnimation === KNIGHT_ANIM.FALLING_RIGHT ||
               this.entity.currentAnimation === KNIGHT_ANIM.FALLING_LEFT) {
                   this.readInput("none");    
            }
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
            if(this.direction === KNIGHT_DIR.RIGHT) {
                this.entity.setAnimation(KNIGHT_ANIM.FALLING_RIGHT);
            } else {
                this.entity.setAnimation(KNIGHT_ANIM.FALLING_LEFT);
            }
        } else {
            if(this.direction === KNIGHT_DIR.RIGHT) {
                this.entity.setAnimation(KNIGHT_ANIM.JUMPING_RIGHT);
            } else {
                this.entity.setAnimation(KNIGHT_ANIM.JUMPING_LEFT);
            }
        }  
    }
}

/**
 * Request the Knight agent to jump.
 */
Knight.prototype.jump = function() {
    //Allow the jump only if the agent is on the ground.
    if(this.entity.game.checkBottomCollision(this.entity) && this.canJump) {
        this.velocity = -(KNIGHT_PHYSICS.JUMP_VELOCITY);
    }
    //The player must actively press up to jump, they can't just hold it.
    this.canJump = false;
}

/**
 * Request the agent to process an input.
 */
Knight.prototype.readInput = function(input) {
    if (input === "down") {
        this.entity.game.requestMove(this.entity, 0, KNIGHT_PHYSICS.PRESS_DOWN_SPEED);
    } 
    if (input === "up") {
        //Add upwards velocity if the player is holding up while jumping.
        if (this.velocity < 0) this.velocity -= KNIGHT_PHYSICS.PRESS_UP_SPEED;
        this.jump();
        
        //Allows no-clip debugging.
        if(!this.entity.fallable) {
            this.entity.game.requestMove(this.entity, 0, -10)
        }
    } 
    if (input === "left") {
        this.direction = KNIGHT_DIR.LEFT;
        if(this.entity.game.checkBottomCollision(this.entity)) {
            //An agent should only walk if it is not in the air.
            this.entity.setAnimation(KNIGHT_ANIM.WALKING_LEFT);
        }
        this.entity.game.requestMove(this.entity, -KNIGHT_PHYSICS.RUNNING_SPEED, 0);
    }
    if(input === "right") {
        this.direction = KNIGHT_DIR.RIGHT;
        if(this.entity.game.checkBottomCollision(this.entity)) {
            //An agent should only walk if it is not in the air.
            this.entity.setAnimation(KNIGHT_ANIM.WALKING_RIGHT);
        }
        this.entity.game.requestMove(this.entity, KNIGHT_PHYSICS.RUNNING_SPEED, 0);
    }
    if (input === "none") {
        if(this.direction === KNIGHT_DIR.RIGHT) {
            this.entity.setAnimation(KNIGHT_ANIM.REST_RIGHT);
        } else {
            this.entity.setAnimation(KNIGHT_ANIM.REST_LEFT);
        }
    }
    
    //Knight can only jump upon pressing jump, so reset the ability to jump
    //whenever the jump key is released.
    if (input === "up_released") {
        this.canJump = true;
    }
    
    //If right or left aren't being pressed, but the knight is currently running, then reset
    //the knight's animation.
    if(input === "right_released" && this.entity.currentAnimation === KNIGHT_ANIM.WALKING_RIGHT) {
        this.readInput("none");
    }
    if (input === "left_released" && this.entity.currentAnimation === KNIGHT_ANIM.WALKING_LEFT) {
        this.readInput("none");
    }
    
    //No-clip activation/deactivation
    if (input === 'n') {
        if(this.entity.game.DEBUG_MODE === 1) {
            this.entity.fallable = !this.entity.fallable;
            this.entity.collidable = !this.entity.collidable;
        }
    }
}