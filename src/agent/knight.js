//TODO: Finish migration of these to abstract-agent.js
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
}

var KNIGHT_ATTR = {
    STARTING_HEALTH: 5,
    INVULNERABLITY_TIME: 0.25, //previously 30 frames
    PRESS_DOWN_SPEED : 0.5,
    PRESS_UP_SPEED : 0.17,    
}

//Physics Constants
var KNIGHT_PHYSICS = {
    TERMINAL_X_VELOCITY : 5,
    TERMINAL_Y_VELOCITY : 16,
    KNOCKBACK_VELOCITY : 12,
    INITIAL_X_VELOCITY : 2,
    INITIAL_Y_VELOCITY : 8,
    Y_ACCELERATION : 0.35,
    X_ACCELRATION : 0,
}

/**
 * Create a new Knight agent.
 * This will create a physical entity to represent it in the game engine,
 * and also attach to it all animations.
 */
function Knight(game, AM, x, y) {
    AbstractAgent.call(this, game, x, y, KNIGHT_PHYSICS);
    this.entity = new Entity(x, y, 48, 50);
    this.game = game;
    this.swordHitbox = null;

    this.yVelocity = 0;
    this.xVelocity = 0;
    this.direction = DIRECTION.RIGHT;

    this.canJump = true;
    this.attacking = false;
    this.noclip = false;

    this.invulnerableFrames = 0;
    this.health = KNIGHT_ATTR.STARTING_HEALTH;
    this.entity.addAnimationSet(new AnimationSet(ANIMATION_SET.KNIGHT, AM));
};

Knight.prototype = Object.create(AbstractAgent.prototype);

/**
 * Update the Knight agent.
 */
Knight.prototype.update = function() {
    gameDiff = this.game.clockTick

    if(this.invulnerableFrames > 0) {
        this.invulnerableFrames-= gameDiff;
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
    
    this.updateFallingState();

    if (this.game.getBottomCollisions(this).length !== 0) {
        if (this.yVelocity > 0) {
            if(this.entity.currentAnimation === KNIGHT_ANIM.JUMPING_RIGHT ||
               this.entity.currentAnimation === KNIGHT_ANIM.JUMPING_LEFT ||
               this.entity.currentAnimation === KNIGHT_ANIM.FALLING_RIGHT ||
               this.entity.currentAnimation === KNIGHT_ANIM.FALLING_LEFT) {
                   this.rest();
            }
        }
    }

    //If downwards velocity is present, set the player into a jumping or falling animation.
    if(this.yVelocity !== 0) {
        //If the knight is attacking, keep them in the attack animation.
        if (this.entity.currentAnimation !== KNIGHT_ANIM.ATTACK_LEFT &&
           this.entity.currentAnimation !== KNIGHT_ANIM.ATTACK_RIGHT) {

            if (this.yVelocity > 0) {
                if(this.direction === DIRECTION.RIGHT) {
                    this.entity.setAnimation(KNIGHT_ANIM.FALLING_RIGHT);
                } else {
                    this.entity.setAnimation(KNIGHT_ANIM.FALLING_LEFT);
                }
            } else {
                if(this.direction === DIRECTION.RIGHT) {
                    this.entity.setAnimation(KNIGHT_ANIM.JUMPING_RIGHT);
                } else {
                    this.entity.setAnimation(KNIGHT_ANIM.JUMPING_LEFT);
                }
            }
        }
    }

    //Move the player independently in both directions, otherwise it will feel off.
    this.game.requestMove(this, this.xVelocity, 0);
    this.game.requestMove(this, 0, this.yVelocity);

    //Move the sword hitbox with the player.
    if (this.attacking && this.swordHitbox !== null) {
        this.game.requestMove(this.swordHitbox, this.xVelocity, 0);
        this.game.requestMove(this.swordHitbox, 0, this.yVelocity);
    }
}

/**
 * Request the Knight agent to jump.
 */
Knight.prototype.jump = function() {
    //Allow the jump only if the agent is on the ground.
    if(this.game.getBottomCollisions(this).length > 0 && this.canJump) {
        this.adjustYVelocity(-1 * (KNIGHT_PHYSICS.INITIAL_Y_VELOCITY));
    }
    //The player must actively press up to jump, they can't just hold it.
    this.canJump = false;
}

/**
  * Request the Knight to rest.
  */
Knight.prototype.rest = function () {
    if(this.attacking) return;
    if(this.direction === DIRECTION.RIGHT) {
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
        this.adjustYVelocity(KNIGHT_ATTR.PRESS_DOWN_SPEED);
    }
    if (input === "up") {
        if(this.attacking) return;
        //Add upwards velocity if the player is holding up while jumping.
        if (this.yVelocity < 0) this.adjustYVelocity(-1 * KNIGHT_ATTR.PRESS_UP_SPEED);
        this.jump();

        //Allows no-clip debugging.
        if(this.noclip) {
            this.game.requestMove(this, 0, -10)
        }
    }
    if (input === "left") {
        if(this.attacking) return;
        this.walkLeft();
    }
    //Uses the same logic as input left.
    if(input === "right") {
        if(this.attacking) return;
        this.walkRight();
    }
    if (input === "space") {
        if(this.direction === DIRECTION.RIGHT) {
            this.entity.setAnimation(KNIGHT_ANIM.ATTACK_RIGHT);
        } else {
            this.entity.setAnimation(KNIGHT_ANIM.ATTACK_LEFT);
        }
        this.slowDown();

        //Create a new sword hitbox if the knight is not currently attacking.
        if (!this.attacking) {
            this.attacking = true;
            if(this.direction === DIRECTION.RIGHT) {
                this.swordHitbox = new SwordHitbox(this.game, this.entity.x + this.entity.width - 29, this.entity.y, this);
            } else {
                this.swordHitbox = new SwordHitbox(this.game, this.entity.x - this.entity.width + 5,
                                                this.entity.y, this);
            }

            this.game.addAgent(this.swordHitbox);
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
        if (this.invulnerableFrames <= 0) {
            this.invulnerableFrames = KNIGHT_ATTR.INVULNERABLITY_TIME;
            this.health--;

            //Knock the player back.
            //TODO: Knock player back based on direction that damage came from.
            if (this.direction === DIRECTION.LEFT) {
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

    if (input === "heal") {
        this.health = KNIGHT_ATTR.STARTING_HEALTH;
    }

    if (input === "reset") {
        this.health = KNIGHT_ATTR.STARTING_HEALTH;
        this.xVelocity = 0;
        this.yVelocity = 0;
    }

    //No-clip activation/deactivation
    if (input === 'n') {
        if(this.game.DEBUG_MODE === 1) {
            this.noclip = !this.noclip;
            this.entity.collidable = !this.entity.collidable;
        }
    }
}



/**
  * Create a new sword hitbox.
  * A sword hitbox is an invisible agent that damages enemies,
  * and self-destructs after a number of frames.
  */
function SwordHitbox(game, x, y, source) {
    this.entity = new Entity(x , y, 70, 50);
    this.entity.moveable = true;
    this.entity.intangible = true;
    this.entity.temporary = true;
    this.game = game;
    this.source = source;
}

SwordHitbox.prototype = {

    update: function() {
        if (!this.source.attacking) {
            if (this.source.swordHitbox === this) this.source.swordHitbox = null;
            this.entity.removeFromWorld = true;
        }
        //Does not move the entity, but simply checks if it is currently colliding.
        this.game.requestMove(this, 0, 0);
    },

    checkListeners: function(agent) {
        if (!agent.entity.controllable) {
            this.game.requestInputSend(agent, "damage", 1);
        }
    }
}
