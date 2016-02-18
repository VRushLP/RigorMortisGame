var SKELETON_ATTR = {
    STARTING_HEALTH: 3,
    SPEED : 3,
    INVULNERABILITY_FRAMES: 40,
    ATTENTION_DISTANCE : 400,
    VERTICAL_TOLERANCE : -250,
    Y_ACCELERATION : .5,
    TERMINAL_VELOCITY : 6
}

var SKELETON_ANIM = {
    STAND_RIGHT: 0,
    STAND_LEFT: 1,
    RUN_RIGHT: 2,
    RUN_LEFT: 3
}

/**
  * Create a new Normal Skeleton.
  */
function Skeleton(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 52, 59);
    this.entity.moveable = true;
    
    this.health = SKELETON_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.yVelocity = 0;
    this.xDestination = x;
    this.yDestination = y;
    this.confused = false;
    
    var skeletonIdleRight = new Animation(AM.getAsset("./img/enemy/chaser.png"), 31, 59, 0.05, true);
    skeletonIdleRight.addFrame(31, 0);
    var skeletonIdleLeft = new Animation(AM.getAsset("./img/enemy/chaser.png"), 31, 59, 0.05, true);
    skeletonIdleLeft.addFrame(0, 0);
    var skeletonRunRight = new Animation(AM.getAsset("./img/enemy/chaser.png"), 52, 59, 0.1, true);
    skeletonRunRight.addFrameBatch(0, 118, 3);
    var skeletonRunLeft = new Animation(AM.getAsset("./img/enemy/chaser.png"), 52, 59, 0.1, true);
    skeletonRunLeft.addFrameBatch(0, 59, 3);
    
    this.entity.addAnimation(skeletonIdleRight);
    this.entity.addAnimation(skeletonIdleLeft);
    this.entity.addAnimation(skeletonRunRight);
    this.entity.addAnimation(skeletonRunLeft);
    this.entity.setAnimation(SKELETON_ANIM.STAND_RIGHT);
}

Skeleton.prototype = {
    
    update: function () {
        //compute updates that are independent of player distance
        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;

            if (this.invulnerableFrames === 0) {
                this.confused = false;
            }
        }
        if (this.health <= 0) {
            var index = this.entity.game.agents.indexOf(this);
            this.entity.game.agents.splice(index, 1);
            return;
        }

        //Skeletons should always know if they're falling
        if (this.entity.game.getBottomCollisions(this.entity).length === 0) {
            //If there is no bottom collision, then the agent is in the air, and should accelerate downwards.
            this.yVelocity += SKELETON_ATTR.Y_ACCELERATION;
            if (this.yVelocity >= SKELETON_ATTR.TERMINAL_VELOCITY) this.yVelocity = SKELETON_ATTR.TERMINAL_VELOCITY;
        } else if (this.yVelocity > 0) {
            //If there is a bottom collision, then the agent is on the ground, and should have no downwards velocity.
            this.yVelocity = 0;
        }
        if (this.yVelocity !== 0) {
            this.entity.game.requestMove(this, 0, this.yVelocity);
        }

        var player = this.entity.game.playerAgent.entity;

        //Skeletons should only do math if they are not confused
        if (!this.confused) {
            if (this.entity.game.playerAgent.hasOwnProperty('velocity') && this.entity.game.playerAgent.velocity === 0) {

                //We probably want to do this calculation once within Knight.
                //At the moment it looks like all enemies will want to know this point.
                var knightPoint = {
                    x: (player.x + (player.width) / 2),
                    y: (player.y + (player.height) / 2)
                };

                var skeletonPoint = {
                    x: (this.entity.x + (this.entity.width) / 2),
                    y: (this.entity.y + (this.entity.height) / 2)
                };

                var verticalDistance = skeletonPoint.y - knightPoint.y;

                if (Math.abs(knightPoint.x - skeletonPoint.x) <= SKELETON_ATTR.ATTENTION_DISTANCE
                    && verticalDistance > SKELETON_ATTR.VERTICAL_TOLERANCE
                    && verticalDistance < 0) {
                    this.xDestination = knightPoint.x; //The skeleton noticed you
                }
            }
            //else Don't update your destinations.

            if (this.entity.x !== this.xDestination) {
                var distance = this.entity.x - this.xDestination;
                distance = -1 * distance; //Reassign so negative values are to your left, positive values are to your right

                if (distance < 0) {
                    this.entity.game.requestMove(this, Math.max(distance, -SKELETON_ATTR.SPEED), 0);
                    console.log(this.entity.x, this.xDestination);
                    if (this.entity.x != this.xDestination) {
                        this.entity.currentAnimation = SKELETON_ANIM.RUN_LEFT;
                    } else {
                        this.entity.currentAnimation = SKELETON_ANIM.STAND_LEFT;
                    }
                } else { //distance >= 0
                    this.entity.game.requestMove(this, Math.min(distance, SKELETON_ATTR.SPEED), 0);
                    if (this.entity.x != this.xDestination) {
                        this.entity.currentAnimation = SKELETON_ANIM.RUN_RIGHT;
                    } else {
                        this.entity.currentAnimation = SKELETON_ANIM.STAND_RIGHT;
                    }
                }
            }
        }        
    },
    
    draw: function() {
        this.entity.draw();
    },
    
    readInput: function(input, modifier) {
        if (input === "damage") {
            if (this.invulnerableFrames === 0) {
                this.invulnerableFrames = SKELETON_ATTR.INVULNERABILITY_FRAMES;
                this.health--;
                this.confused = true;
            }
        }
    },
    
    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}