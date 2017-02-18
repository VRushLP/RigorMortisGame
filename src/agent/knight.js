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
    INVULNERABILITY_TIME: 0.5, //previously 30 frames
}

var KNIGHT_UNIQUE_ATTR = {
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
    AbstractAgent.call(this, game, x, y, KNIGHT_PHYSICS, KNIGHT_ATTR);
    this.entity = new Entity(x, y, 48, 50);
    this.input_types = this.game.input_types;
    this.swordHitbox = null;
    this.direction = DIRECTION.RIGHT;

    this.canJump = true;
    this.noclip = false;

    this.entity.addAnimationSet(new AnimationSet(ANIMATION_SET.KNIGHT, AM));
};

Knight.prototype = Object.create(AbstractAgent.prototype);

/**
 * Update the Knight agent.
 */
Knight.prototype.update = function() {
    this.genericUpdate();
    
    if (this.attackTimer !== undefined) {
            this.attackTimer.update();
    }
    if (this.attacking) this.slowDown();
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
    
    this.genericPostUpdate();

    //Move the sword hitbox with the player.
    if (this.attacking && this.swordHitbox !== null) {
        this.game.requestMove(this.swordHitbox, this.xVelocity, 0);
        this.game.requestMove(this.swordHitbox, 0, this.yVelocity);
    }
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

Knight.prototype.setAttacking = function (isAttacking) {
    if (this.attacking && !isAttacking) {
        this.attacking = false;
        this.rest();
    } else {
        this.attacking = isAttacking;
    }
}

/**
 * Request the agent to process an input.
 */
Knight.prototype.readInput = function(input, modifier) {
    if (input === this.input_types.DOWN) {
        if(this.attacking) return;
        this.adjustYVelocity(KNIGHT_UNIQUE_ATTR.PRESS_DOWN_SPEED);
    }
    if (input === this.input_types.UP) {
        if (this.attacking) return;
        //Add upwards velocity if the player is holding up while jumping.
        if (this.yVelocity < 0) this.adjustYVelocity(-1 * KNIGHT_UNIQUE_ATTR.PRESS_UP_SPEED);
        
        if (this.canJump) {
            this.genericJump();
            this.canJump = false;
        }

        //Allows no-clip debugging.
        if(this.noclip) {
            this.game.requestMove(this, 0, -10)
        }
    }
    if (input === this.input_types.LEFT) {
        if (this.attacking) return;
        this.genericWalkLeft();
    }
    //Uses the same logic as input left.
    if(input === this.input_types.RIGHT) {
        if (this.attacking) return;
        this.genericWalkRight();
    }
    if (input === this.input_types.SPACE) {
        //Create a new sword hitbox if the knight is not currently attacking.
        if (this.attacking) return;
        this.genericAttack();
        if(this.direction === DIRECTION.RIGHT) {
            this.swordHitbox = new SwordHitbox(this.game, this.entity.x + this.entity.width - 29, this.entity.y, this);
        } else {
            this.swordHitbox = new SwordHitbox(this.game, this.entity.x - this.entity.width + 5,
                                            this.entity.y, this);
        }

        this.game.addAgent(this.swordHitbox);
    }
    if (input === this.input_types.NONE) {
        this.rest();
    }

    //Knight can only jump upon pressing jump, so reset the ability to jump
    //whenever the jump key is released.
    if (input === this.input_types.UP_RELEASED) {
        this.canJump = true;
    }

    //If right or left aren't being pressed, but the knight is currently running, then reset
    //the knight's animation.
    if(input === this.input_types.RIGHT_RELEASED && this.entity.currentAnimation === KNIGHT_ANIM.WALKING_RIGHT) {
        this.rest();
    }
    if (input === this.input_types.LEFT_RELEASED && this.entity.currentAnimation === KNIGHT_ANIM.WALKING_LEFT) {
        this.rest();
    }

    if (input === this.input_types.LEFT_AND_RIGHT_RELEASED) {
        this.slowDown();
    }

    if (input === this.input_types.DAMAGE) {
        if (!this.invulnerable) {
            this.toggleInvulnerability(true);
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

    if (input === this.input_types.HEAL) {
        this.health = KNIGHT_ATTR.STARTING_HEALTH;
    }

    if (input === this.input_types.RESET) {
        this.health = KNIGHT_ATTR.STARTING_HEALTH;
        this.xVelocity = 0;
        this.yVelocity = 0;
    }

    //No-clip activation/deactivation
    if (input === this.input_types.NOCLIP) {
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
