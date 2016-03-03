//Size constants
var KNIGHT_SIZE = {
    STAND_WIDTH: 41,
    STAND_HEIGHT: 50,
    WALK_WIDTH: 49,
    WALK_HEIGHT: 52,
    JUMP_WIDTH: 47,
    JUMP_HEIGHT: 55,
    ATTACK_OFFSET_Y: -19,
    ATTACK_LEFT_OFFSET_X: -40,
}

//Animation Constants
var KNIGHT_ANIM = {
    STAND_RIGHT: 0,
    STAND_LEFT: 1,
    WALKING_RIGHT: 2,
    WALKING_LEFT: 3,
    JUMPING_RIGHT: 4,
    JUMPING_LEFT: 5,
    FALLING_RIGHT: 6,
    FALLING_LEFT: 7,
    ATTACK_RIGHT: 8,
    ATTACK_LEFT: 9,
    FRAME_DURATION: .1,
    FRAME_RUN_DURATION: .085,
}

//Direction Constants
var KNIGHT_DIR = {
    LEFT: 0,
    RIGHT: 1,
}

var KNIGHT_ATTR = {
    STARTING_HEALTH: 5,
    INVULNERABILITY_FRAMES: 30,
}

//Physics Constants
var KNIGHT_PHYSICS = {
    TERMINAL_Y_VELOCITY : 16,
    TERMINAL_X_VELOCITY : 5,
    KNOCKBACK_VELOCITY : 12,
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
    this.entity = new Entity(game, x, y, 48, 50);
    this.swordHitbox = null;

    this.yVelocity = 0;
    this.xVelocity = 0;
    this.direction = KNIGHT_DIR.RIGHT;
    
    this.canJump = true;
    this.attacking = false;
    this.noclip = false;

    this.invulnerableFrames = 0;
    this.health = KNIGHT_ATTR.STARTING_HEALTH;

    var KnightStandRight = new Animation(AM.getAsset("./img/knight/knight standing.png"),
        KNIGHT_SIZE.STAND_WIDTH, KNIGHT_SIZE.STAND_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightStandRight.addFrame(0, 0);
    var KnightStandLeft = new Animation(AM.getAsset("./img/knight/knight standing flipped.png"),
        KNIGHT_SIZE.STAND_WIDTH, KNIGHT_SIZE.STAND_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightStandLeft.addFrame(0, 0);

    var KnightWalkRight = new Animation(AM.getAsset("./img/knight/knight run.png"),
        KNIGHT_SIZE.WALK_WIDTH, KNIGHT_SIZE.WALK_HEIGHT, KNIGHT_ANIM.FRAME_RUN_DURATION, true);
    KnightWalkRight.addFrame(0, 0, 8);
    var KnightWalkLeft = new Animation(AM.getAsset("./img/knight/knight run flipped.png"),
        KNIGHT_SIZE.WALK_WIDTH, KNIGHT_SIZE.WALK_HEIGHT, KNIGHT_ANIM.FRAME_RUN_DURATION, true);
    KnightWalkLeft.addFrame(0, 0, 8);

    var KnightJumpRight = new Animation(AM.getAsset("./img/knight/knight jump.png"),
        KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightJumpRight.addFrame(0, 0);
    var KnightJumpLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"),
        KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightJumpLeft.addFrame(0, 0);

    var KnightFallRight = new Animation(AM.getAsset("./img/knight/knight jump.png"),
        KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightFallRight.addFrame(KNIGHT_SIZE.JUMP_WIDTH, 0);
    var KnightFallLeft = new Animation(AM.getAsset("./img/knight/knight jump flipped.png"),
        KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
    KnightFallLeft.addFrame(KNIGHT_SIZE.JUMP_WIDTH, 0);

    var KnightAttackRight = new Animation(AM.getAsset("./img/knight/knight attack.png"), 90, 70, 0.085, false, 0, KNIGHT_SIZE.ATTACK_OFFSET_Y);
    KnightAttackRight.addFrame(0, 0, 8);
    var KnightAttackLeft = new Animation(AM.getAsset("./img/knight/knight attack flipped.png"), 90, 70, 0.085, false,
                                         KNIGHT_SIZE.ATTACK_LEFT_OFFSET_X, KNIGHT_SIZE.ATTACK_OFFSET_Y);
    KnightAttackLeft.addFrame(0, 0, 8);

    this.entity.addAnimation(KnightStandRight);
    this.entity.addAnimation(KnightStandLeft);
    this.entity.addAnimation(KnightWalkRight);
    this.entity.addAnimation(KnightWalkLeft);
    this.entity.addAnimation(KnightJumpRight);
    this.entity.addAnimation(KnightJumpLeft);
    this.entity.addAnimation(KnightFallRight);
    this.entity.addAnimation(KnightFallLeft);
    this.entity.addAnimation(KnightAttackRight);
    this.entity.addAnimation(KnightAttackLeft);
};

Knight.prototype.draw = function (cameraX, cameraY) {
    this.entity.draw(cameraX, cameraY);
};

/**
 * Update the Knight agent.
 */
Knight.prototype.update = function() {
    
    if(this.invulnerableFrames > 0) {
        this.invulnerableFrames--;
    }

    //Update the knight's attack state.
    var currentAnimation = this.entity.currentAnimation;   
    if (currentAnimation === KNIGHT_ANIM.ATTACK_RIGHT ||
        currentAnimation === KNIGHT_ANIM.ATTACK_LEFT) {
        if (!this.entity.animationList[currentAnimation].isFinalFrame()) {
            this.attacking = true;
        } else {
            this.attacking = false;
            this.rest();
        }
    }

    //Update the Knight's falling state.
    if (this.entity.game.getBottomCollisions(this).length === 0) {
        //If there is no bottom collision, then the agent is in the air, and should accelerate downwards.
        this.yVelocity += KNIGHT_PHYSICS.Y_ACCELERATION;
        if (this.yVelocity >= KNIGHT_PHYSICS.TERMINAL_Y_VELOCITY) this.yVelocity = KNIGHT_PHYSICS.TERMINAL_Y_VELOCITY;
    } else if (this.yVelocity > 0) {
        //If there is a bottom collision, then the agent is on the ground, and should have no downwards velocity.
        this.yVelocity = 0;

        //If the knight previously had a jumping/falling animation, request the knight to go into a rest state.
        if(this.entity.currentAnimation === KNIGHT_ANIM.JUMPING_RIGHT ||
               this.entity.currentAnimation === KNIGHT_ANIM.JUMPING_LEFT ||
               this.entity.currentAnimation === KNIGHT_ANIM.FALLING_RIGHT ||
               this.entity.currentAnimation === KNIGHT_ANIM.FALLING_LEFT) {
                   this.rest();
            }
    }

    //If the agent is jumping, check for top collisions.
    if(this.yVelocity < 0) {
        if (this.entity.game.getTopCollisions(this).length > 0) {
            this.yVelocity = 0;
        }
    }

    //If downwards velocity is present, set the player into a jumping or falling animation.
    if(this.yVelocity !== 0) {
        //If the knight is attacking, keep them in the attack animation.
        if (this.entity.currentAnimation !== KNIGHT_ANIM.ATTACK_LEFT &&
           this.entity.currentAnimation !== KNIGHT_ANIM.ATTACK_RIGHT) {
            
            if (this.yVelocity > 0) {
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
    
    //Move the player independently in both directions, otherwise it will feel off.
    this.entity.game.requestMove(this, this.xVelocity, 0);
    this.entity.game.requestMove(this, 0, this.yVelocity);
    
    //Move the sword hitbox with the player.
    if (this.attacking && this.swordHitbox !== null) {
        this.entity.game.requestMove(this.swordHitbox, this.xVelocity, 0);
        this.entity.game.requestMove(this.swordHitbox, 0, this.yVelocity);
    }
}

/**
 * Request the Knight agent to jump.
 */
Knight.prototype.jump = function() {
    //Allow the jump only if the agent is on the ground.
    if(this.entity.game.getBottomCollisions(this).length > 0 && this.canJump) {
        this.yVelocity = -(KNIGHT_PHYSICS.JUMP_VELOCITY);
    }
    //The player must actively press up to jump, they can't just hold it.
    this.canJump = false;
}

/**
  * Request the Knight to rest.
  */
Knight.prototype.rest = function () {
    if(this.attacking) return;
    if(this.direction === KNIGHT_DIR.RIGHT) {
        this.entity.setAnimation(KNIGHT_ANIM.STAND_RIGHT);
    } else {
        this.entity.setAnimation(KNIGHT_ANIM.STAND_LEFT);
    }
    this.slowDown();
}

/**
 * Request the agent to process an input.
 */
Knight.prototype.readInput = function(input, modifier) {
    if (input === "down") {
        if(this.attacking) return;
        this.entity.game.requestMove(this, 0, KNIGHT_PHYSICS.PRESS_DOWN_SPEED);
    }
    if (input === "up") {
        if(this.attacking) return;
        //Add upwards velocity if the player is holding up while jumping.
        if (this.yVelocity < 0) this.yVelocity -= KNIGHT_PHYSICS.PRESS_UP_SPEED;
        this.jump();

        //Allows no-clip debugging.
        if(this.noclip) {
            this.entity.game.requestMove(this, 0, -10)
        }
    }
    if (input === "left") {
        if(this.attacking) return;
        this.direction = KNIGHT_DIR.LEFT;
        if(this.entity.game.getBottomCollisions(this).length > 0) {
            //An agent should only walk if it is not in the air.
            this.entity.setAnimation(KNIGHT_ANIM.WALKING_LEFT);
        }
        if (this.xVelocity >= KNIGHT_PHYSICS.TERMINAL_X_VELOCITY * -1) {
            this.adjustXVelocity(-2);
        } else {
            //Terminal Velocity is exceeding during knockback, so only slow down here.
            this.slowDown();
        }
    }
    //Uses the same logic as input left.
    if(input === "right") {
        if(this.attacking) return;
        this.direction = KNIGHT_DIR.RIGHT;
        if(this.entity.game.getBottomCollisions(this).length > 0) {
            this.entity.setAnimation(KNIGHT_ANIM.WALKING_RIGHT);
        }
        if (this.xVelocity <= KNIGHT_PHYSICS.TERMINAL_X_VELOCITY) {
            this.adjustXVelocity(2);
        } else {
            this.slowDown();
        }
    }
    if (input === "space") {
        if(this.direction === KNIGHT_DIR.RIGHT) {
            this.entity.setAnimation(KNIGHT_ANIM.ATTACK_RIGHT);
        } else {
            this.entity.setAnimation(KNIGHT_ANIM.ATTACK_LEFT);
        }
        this.slowDown();

        //Create a new sword hitbox if the knight is not currently attacking.
        if (!this.attacking) {
            this.attacking = true;
            if(this.direction === KNIGHT_DIR.RIGHT) {
                this.swordHitbox = new SwordHitbox(this.entity.game, this.entity.x + this.entity.width - 29, this.entity.y, this);
            } else {
                this.swordHitbox = new SwordHitbox(this.entity.game, this.entity.x - this.entity.width + 5,
                                                this.entity.y, this);
            }

            this.entity.game.addAgent(this.swordHitbox);
        }
    }
    if (input === "none") {
        this.rest();
    }

    //Knight can only jump upon pressing jump, so reset the ability to jump
    //whenever the jump key is released.
    if (input === "up_released") {
        this.canJump = true;
    }

    //If right or left aren't being pressed, but the knight is currently running, then reset
    //the knight's animation.
    if(input === "right_released" && this.entity.currentAnimation === KNIGHT_ANIM.WALKING_RIGHT) {
        this.rest();
    }
    if (input === "left_released" && this.entity.currentAnimation === KNIGHT_ANIM.WALKING_LEFT) {
        this.rest();
    }
    
    if (input === "left_and_right_released") {
        this.slowDown();
    }

    if (input === "damage") {
        if (this.invulnerableFrames === 0) {
            this.invulnerableFrames = KNIGHT_ATTR.INVULNERABILITY_FRAMES;
            this.health--;

            //Knock the player back.
            //TODO: Knock player back based on direction that damage came from.
            if (this.direction === KNIGHT_DIR.LEFT) {
                this.xVelocity = KNIGHT_PHYSICS.KNOCKBACK_VELOCITY;
                this.yVelocity = -6;
            } else {
                this.xVelocity = -1 * KNIGHT_PHYSICS.KNOCKBACK_VELOCITY;
                this.yVelocity = -6;
            }
        }
        
        if (this.health <= 0) {
            this.entity.removeFromWorld = true;
        }
    }
    
    if (input === "reset") {
        this.health = KNIGHT_ATTR.STARTING_HEALTH;
        this.xVelocity = 0;
        this.yVelocity = 0;
    }

    //No-clip activation/deactivation
    if (input === 'n') {
        if(this.entity.game.DEBUG_MODE === 1) {
            this.noclip = !this.noclip;
            this.entity.collidable = !this.entity.collidable;
        }
    }
}

Knight.prototype.adjustXVelocity = function (amount) {
    var maxVelocity = KNIGHT_PHYSICS.TERMINAL_X_VELOCITY;
    this.xVelocity += amount;
    
    if (this.invulnerableFrames > 0) maxVelocity = KNIGHT_PHYSICS.KNOCKBACK_VELOCITY;
    
    if (this.xVelocity > maxVelocity) {
        this.xVelocity = maxVelocity;
    }
    if (this.xVelocity < -1 * maxVelocity) {
        this.xVelocity = -1 * maxVelocity;
    }
}

Knight.prototype.slowDown = function () {
    var maxSlowdown = 1;
    if (this.invulnerableFrames > 0) maxSlowdown = .45; 
        
    if (this.xVelocity > 0) {
         this.adjustXVelocity(Math.max(maxSlowdown * -1, this.xVelocity * -1)); 
    } else if (this.xVelocity < 0) {
          this.adjustXVelocity(Math.min(maxSlowdown, this.xVelocity * -1));
    } 
}

/**
  * Create a new sword hitbox.
  * A sword hitbox is an invisible agent that damages enemies,
  * and self-destructs after a number of frames.
  */
function SwordHitbox(game, x, y, source) {
    this.entity = new Entity(game, x , y, 70, 50);
    this.entity.moveable = true;
    this.entity.intangible = true;
    this.entity.temporary = true;
    this.source = source;
}

SwordHitbox.prototype = {

    update: function() {
        if (!this.source.attacking) {
            if (this.source.swordHitbox === this) this.source.swordHitbox = null;
            this.entity.removeFromWorld = true;
        }
        //Does not move the entity, but simply checks if it is currently colliding.
        this.entity.game.requestMove(this, 0, 0);
    },

    draw: function() {
        this.entity.draw();
    },

    checkListeners: function(agent) {
        if (!agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}