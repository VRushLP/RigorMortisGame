var SKELETON_ATTR = {
    STARTING_HEALTH: 1, // TODO Increase and implement knockback on skeletons
    SPEED: 3,
    INVULNERABILITY_TIME: .66, // Prev: 40 frames
    ATTENTION_DISTANCE: 400,
    VERTICAL_TOLERANCE: -250,
    Y_ACCELERATION: .5,
    TERMINAL_VELOCITY: 6
}

var SKELETON_STANDARD_ATTR = {
    STARTING_HEALTH: 1,
    INVULNERABILITY_TIME: .66
}

var SKELETON_ANIM = {
    STAND_RIGHT: 0,
    STAND_LEFT: 1,
    RUN_RIGHT: 2,
    RUN_LEFT: 3,
    DYING: 4
}

var SKELETON_PHYSICS = {
    TERMINAL_X_VELOCITY : 3,
    TERMINAL_Y_VELOCITY : 0,
    KNOCKBACK_VELOCITY : 0,
    INITIAL_X_VELOCITY : 3,
    INITIAL_Y_VELOCITY : 0,
    Y_ACCELERATION : 0.5,
    X_ACCELRATION : 0,
}

/**
  * Create a new Normal Skeleton.
  */
function Skeleton(game, AM, x, y) {
    AbstractAgent.call(this, game, x, y, SKELETON_PHYSICS, SKELETON_STANDARD_ATTR);
    this.entity = new Entity(x, y, 52, 59);
    this.entity.moveable = true;
    this.game = game;
    this.input_types = game.input_types;

    this.health = SKELETON_ATTR.STARTING_HEALTH;
    this.invulnerableTime = 0;
    this.yVelocity = 0;
    this.xDestination = x;
    this.yDestination = y;
    this.confused = false;
    this.entity.addAnimationSet(new AnimationSet(ANIMATION_SET.SKELETON, AM));
    this.entity.setAnimation(SKELETON_ANIM.STAND_RIGHT);
}

Skeleton.prototype = Object.create(AbstractAgent.prototype);

Skeleton.prototype.update = function() {
    timeDiff = this.game.clockTick;

    //compute updates that are independent of player distance
    if (this.entity.collidable) {
        if (this.invulnerableTime >= 0) {
            this.invulnerableTime -= timeDiff;

            if (this.invulnerableTime < 0) {
                this.confused = false;
                this.invulnerableTime = 0;
            }
        }

        //Skeletons should always know if they're falling
        if (this.game.getBottomCollisions(this).length === 0) {
            //If there is no bottom collision, then the agent is in the air, and should accelerate downwards.
            this.yVelocity += SKELETON_ATTR.Y_ACCELERATION;
            if (this.yVelocity >= SKELETON_ATTR.TERMINAL_VELOCITY) this.yVelocity = SKELETON_ATTR.TERMINAL_VELOCITY;
        } else if (this.yVelocity > 0) {
            //If there is a bottom collision, then the agent is on the ground, and should have no downwards velocity.
            this.yVelocity = 0;
        }

        if (this.yVelocity !== 0) {
            this.game.requestMove(this, 0, this.yVelocity);
        }

        //Skeletons should only do math if they are not confused
        if (!this.confused) {
            var player = this.game.playerAgent;
            if (player.yVelocity === 0) {

                var knightPoint = player.entity.getCenter();
                var skeletonPoint = this.entity.getCenter();

                var verticalDistance = skeletonPoint.y - knightPoint.y;

                if (verticalDistance > SKELETON_ATTR.VERTICAL_TOLERANCE
                    && verticalDistance < 0
                    && Math.abs(knightPoint.x - skeletonPoint.x) <= SKELETON_ATTR.ATTENTION_DISTANCE) {
                    this.xDestination = knightPoint.x; //The skeleton noticed you
                }
            }

            if (this.entity.x !== this.xDestination) {
                //Reassign so negative values are to your left, positive values are to your right
                var distance = -(this.entity.x - this.xDestination);

                if (distance < 0) {
                    this.game.requestMove(this, Math.max(distance, -SKELETON_ATTR.SPEED), 0);
                    if (this.entity.x != this.xDestination) {
                        this.entity.currentAnimation = SKELETON_ANIM.RUN_LEFT;
                    } else {
                        this.entity.currentAnimation = SKELETON_ANIM.STAND_LEFT;
                    }
                } else { //distance >= 0
                    this.game.requestMove(this, Math.min(distance, SKELETON_ATTR.SPEED), 0);
                    if (this.entity.x != this.xDestination) {
                        this.entity.currentAnimation = SKELETON_ANIM.RUN_RIGHT;
                    } else {
                        this.entity.currentAnimation = SKELETON_ANIM.STAND_RIGHT;
                    }
                }
            }
        } else {
            if (this.entity.currentAnimation === SKELETON_ANIM.RUN_LEFT) {
                this.entity.currentAnimation = SKELETON_ANIM.STAND_LEFT;
            } else if (this.entity.currentAnimation === SKELETON_ANIM.RUN_RIGHT) {
                this.entity.currentAnimation = SKELETON_ANIM.STAND_RIGHT;
            }
        }
     } else {
         this.entity.setAnimation(SKELETON_ANIM.DYING);
        if (this.entity.animationList[SKELETON_ANIM.DYING].isDone()) {
            this.entity.removeFromWorld = true;
        }
    }
}

Skeleton.prototype.readInput = function(input, modifier) {
    if (input === this.input_types.DAMAGE) {
        if (this.invulnerableTime === 0) {
            this.invulnerableTime = SKELETON_ATTR.INVULNERABILITY_TIME;
            this.health--;
            if (this.health <= 0) {
                this.entity.x += this.entity.width / 2;
                this.entity.y += this.entity.height / 2;
                this.entity.collidable = false;
            } else {
                this.confused = true;
            }
        }
    }
    if (input === this.input_types.RESET) {
        this.entity.collidable = true;
        this.health = SKELETON_ATTR.STARTING_HEALTH;
        this.entity.currentAnimation = SKELETON_ANIM.STAND_RIGHT;
        this.yVelocity = 0;
        this.xDestination = this.entity.originX;
        this.yDestination = this.entity.originY;
        this.entity.animationList[SKELETON_ANIM.DYING].elapsedTime = 0;
    }
}

Skeleton.prototype.checkListeners = function(agent) {
    if (agent.entity.controllable) {
        this.game.requestInputSend(agent, this.input_types.DAMAGE, 1);
    }
}
