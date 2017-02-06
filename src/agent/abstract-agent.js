var ABSTRACT_PHYSICS = {
    TERMINAL_X_VELOCITY : 0,
    TERMINAL_Y_VELOCITY : 0,
    KNOCKBACK_VELOCITY : 0,
    INITIAL_X_VELOCITY : 0,
    INITIAL_Y_VELOCITY : 0,
    Y_ACCELERATION : 0,
    X_ACCELRATION : 0
};

/*
 * An agent is the behavioral component to an entity.
 */
function AbstractAgent(game, x, y, physicsMap) {
    this.game = game;
    
    this.physicsMap = ABSTRACT_PHYSICS;
    for (var attribute in physicsMap) { this.physicsMap[attribute] = physicsMap[attribute]; }
    
    this.xVelocity = 0;
    this.yVelocity = 0;
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
        if (this.maxVelocity != 0) {
            if (this.xVelocity > maxVelocity) {
                this.xVelocity = maxVelocity;
            }
            if (this.xVelocity < -1 * maxVelocity) {
                this.xVelocity = -1 * maxVelocity;
            }
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

