//Default physics set for all agents.
var ABSTRACT_PHYSICS = {
    TERMINAL_X_VELOCITY : 0,
    TERMINAL_Y_VELOCITY : 0,
    KNOCKBACK_VELOCITY : 0,
    INITIAL_X_VELOCITY : 0,
    INITIAL_Y_VELOCITY : 0,
    Y_ACCELERATION : 0,
    X_ACCELRATION : 0
};

var ABSTRACT_ATTRIBUTES = {
    STARTING_HEALTH: 0,
    INVULNERABILITY_TIME: 0
};

var DIRECTION = {
    LEFT: 0,
    RIGHT: 1
};

//Standard set of animations for all agents.
var STANDARD_ANIM = {
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
};

/*
 * An agent is the behavioral component to an entity.
 */
function AbstractAgent(game, x, y, physicsMap, attributesMap) {
    this.game = game;
    this.invulnerable = false;
    
    this.physicsMap = ABSTRACT_PHYSICS;
    for (var attribute in physicsMap) { this.physicsMap[attribute] = physicsMap[attribute]; }
    
    this.attributesMap = ABSTRACT_ATTRIBUTES;
    for (var attribute in attributesMap) { this.attributesMap[attribute] = attributesMap[attribute]; }
    
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.invulnerableTimer = new Timer(this.game, 0, this.toggleInvulnerability, this, false);
}

AbstractAgent.prototype = {
    
    adjustXVelocity: function (amount) {
        var maxVelocity = this.physicsMap.TERMINAL_X_VELOCITY;
        var knockbackVelocity = this.physicsMap.KNOCKBACK_VELOCITY;
        this.xVelocity += amount;

        //TODO: Rework this. Determining if we should have knockback velocity based on invulnerability works but does not make sense.
        if (this.knockbackVelocity != 0) {
            if (this.invulnerableFrames > 0) maxVelocity = knockbackVelocity;
        }

        //If the agent has a max velocity, do not allow the agent to exceed it.
        if (maxVelocity != 0) {
            if (this.xVelocity > maxVelocity) {
                this.xVelocity = maxVelocity;
            }
            if (this.xVelocity < -1 * maxVelocity) {
                this.xVelocity = -1 * maxVelocity;
            }
        }
        
    },
    
    adjustYVelocity: function (amount) {
        var maxVelocity = this.physicsMap.TERMINAL_Y_VELOCITY;
        this.yVelocity += amount;
        
        if (maxVelocity != 0) {
            if (this.yVelocity > maxVelocity) {
                this.yVelocity = maxVelocity;
            }
        }
    },
    
    
    walkLeft: function () {
        this.direction = DIRECTION.LEFT;
        
        if(this.game.getBottomCollisions(this).length > 0) {
            //An agent should only walk if it is not in the air.
            this.entity.setAnimation(STANDARD_ANIM.WALKING_LEFT);
        }
        
        this.adjustXVelocity(-1 * this.physicsMap.INITIAL_X_VELOCITY);
        if (this.xVelocity < this.physicsMap.TERMINAL_X_VELOCITY * -1) {
            //Terminal Velocity is exceeding during knockback, so only slow down here.
            this.slowDown();
        }
    },
    
    walkRight: function () {
        this.direction = DIRECTION.RIGHT;
        
        if(this.game.getBottomCollisions(this).length > 0) {
            this.entity.setAnimation(STANDARD_ANIM.WALKING_RIGHT);
        }
        this.adjustXVelocity(this.physicsMap.INITIAL_X_VELOCITY);
        if (this.xVelocity > this.physicsMap.TERMINAL_X_VELOCITY) {
            this.slowDown();
        }
    },
    
    jump: function () {
        if (this.game.getBottomCollisions(this).length > 0) {
            if(this.direction === DIRECTION.RIGHT) {
                this.entity.setAnimation(STANDARD_ANIM.JUMPING_RIGHT);
            } else {
                this.entity.setAnimation(STANDARD_ANIM.JUMPING_LEFT);
            }
            
            this.adjustYVelocity(-1 * (this.physicsMap.INITIAL_Y_VELOCITY));
        }
    },
    
    attack: function () {
        if(this.direction === DIRECTION.RIGHT) {
            this.entity.setAnimation(STANDARD_ANIM.ATTACK_RIGHT);
        } else {
            this.entity.setAnimation(STANDARD_ANIM.ATTACK_LEFT);
        }
        this.slowDown();
    },
    
    slowDown: function () {
        var maxSlowdown = 1;

        if (this.xVelocity > 0) {
             this.adjustXVelocity(Math.max(maxSlowdown * -1, this.xVelocity * -1));
        } else if (this.xVelocity < 0) {
              this.adjustXVelocity(Math.min(maxSlowdown, this.xVelocity * -1));
        }
    },
    
    
    updateFallingState: function () {

        //Falling Logic.
        if (this.game.getBottomCollisions(this).length === 0) {
            //Agent is in the air and should accelerate downwards.
            this.adjustYVelocity(KNIGHT_PHYSICS.Y_ACCELERATION);
        } else if (this.yVelocity > 0) {
            //Agent is on the ground, and should have no downwards velocity.
            this.yVelocity = 0;
        }

        //Rising Logic.
        if(this.yVelocity < 0) {
            //Agent is rising.
            if (this.game.getTopCollisions(this).length > 0) {
                //Agent has hit a ceiling.
                this.yVelocity = 0;
            }
        }
        
        this.updateFallingAnimation();
    },
    
    updateFallingAnimation: function () {
        //If the agent is attacking, keep them in the attack animation.
        if (this.entity.currentAnimation !== STANDARD_ANIM.ATTACK_LEFT &&
            this.entity.currentAnimation !== STANDARD_ANIM.ATTACK_RIGHT) {
            
            if (this.yVelocity > 0) {
                if(this.direction === DIRECTION.RIGHT) {
                    this.entity.setAnimation(STANDARD_ANIM.FALLING_RIGHT);
                } else {
                    this.entity.setAnimation(STANDARD_ANIM.FALLING_LEFT);
                }
                
            } else if (this.yVelocity < 0) {
                if(this.direction === DIRECTION.RIGHT) {
                    this.entity.setAnimation(STANDARD_ANIM.JUMPING_RIGHT);
                } else {
                    this.entity.setAnimation(STANDARD_ANIM.JUMPING_LEFT);
                }
            }
        }
    },
    
    toggleInvulnerability: function (isInvulnerable) {
        this.invulnerable = isInvulnerable;
        if (this.invulnerable) {
            this.invulnerableTimer.reset(false, this.attributesMap.INVULNERABILITY_TIME);
        }
    }
};

function getDistance(myPoint, theirPoint) {
    return Math.sqrt(Math.pow((myPoint.x - theirPoint.x), 2) + Math.pow((myPoint.y - theirPoint.y), 2));
}

function getNormalizedSlope(myPoint, theirPoint, distance) {
    return {
        x: (myPoint.x - theirPoint.x) / distance,
        y: (myPoint.y - theirPoint.y) / distance
    }
}

