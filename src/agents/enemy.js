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

var ARCHER_ATTR = {
    RANGE : 600,
    STARTING_HEALTH : 1,
    SHOOTING_TIME : 60
}

var ARCHER_ANIM = {
    STAND_RIGHT: 0,
    STAND_LEFT: 1,
    SHOOT_RIGHT: 2,
    SHOOT_LEFT: 3
}

var WISP_ATTR = {
    STARTING_HEALTH : 1,
    SPEED: 2,
    ATTENTION_DISTANCE: 500,
    TOUCH_DISTANCE : 40,
    FLEE_TIME: 45,
    FLEE_ACCELERATION: 4
    //This should be true: SPEED*FLEE_TIME*FLEE_ACCELERATION < ATTENTION_DISTANCE
}

var WISP_ANIM = {
    FLOATING_RIGHT: 0,
    FLOATING_LEFT : 1
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
    skeletonRunRight.addFrame(0, 118, 3);
    var skeletonRunLeft = new Animation(AM.getAsset("./img/enemy/chaser.png"), 52, 59, 0.1, true);
    skeletonRunLeft.addFrame(0, 59, 3);

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

        //Skeletons should only do math if they are not confused
        if (!this.confused) {
            var player = this.entity.game.playerAgent.entity;
            if (this.entity.game.playerAgent.velocity === 0) {

                var knightPoint = this.entity.game.playerAgent.centerPoint;

                var skeletonPoint = {
                    x: (this.entity.x + (this.entity.width) / 2),
                    y: (this.entity.y + (this.entity.height) / 2)
                };

                var verticalDistance = skeletonPoint.y - knightPoint.y;

                if (verticalDistance > SKELETON_ATTR.VERTICAL_TOLERANCE
                    && verticalDistance < 0
                    && Math.abs(knightPoint.x - skeletonPoint.x) <= SKELETON_ATTR.ATTENTION_DISTANCE) {
                    this.xDestination = knightPoint.x; //The skeleton noticed you
                }
            }

            if (this.entity.x !== this.xDestination) {
                var distance = -(this.entity.x - this.xDestination);                     //Reassign so negative values are to your left, positive values are to your right

                if (distance < 0) {
                    this.entity.game.requestMove(this, Math.max(distance, -SKELETON_ATTR.SPEED), 0);
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
        } else {
            if (this.entity.currentAnimation === SKELETON_ANIM.RUN_LEFT) {
                this.entity.currentAnimation = SKELETON_ANIM.STAND_LEFT;
            } else if (this.entity.currentAnimation === SKELETON_ANIM.RUN_RIGHT) {
                this.entity.currentAnimation = SKELETON_ANIM.STAND_RIGHT;
            }
        }
    },

    draw: function() {
        this.entity.draw();
    },

    readInput: function (input, modifier) {

        if (input === "damage") {
            if (this.invulnerableFrames === 0) {
                this.invulnerableFrames = SKELETON_ATTR.INVULNERABILITY_FRAMES;
                this.health--;
                if (this.health <= 0) {
                    var index = this.entity.game.agents.indexOf(this);
                    this.entity.game.agents.splice(index, 1);
                } else {
                    this.confused = true;
                }
            }
        }
    },

    checkListeners: function (agent) {

        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}

function Wisp(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 44, 50);
    this.entity.moveable = true;
    this.struckRecently = false;
    this.timeToStrikeAgain = 0;

    this.health = WISP_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;

    var wispRight = new Animation(AM.getAsset("./img/enemy/wisp.png"), 44, 50, 0.05, true);
    wispRight.addFrame(44, 0);
    var wispLeft = new Animation(AM.getAsset("./img/enemy/wisp.png"), 44, 50, 0.05, true);
    wispLeft.addFrame(0, 0);

    this.entity.addAnimation(wispRight);
    this.entity.addAnimation(wispLeft);
}

Wisp.prototype = {
    update: function () {
        if (this.timeToStrikeAgain > 0) {
            this.timeToStrikeAgain--;
        } else {
            this.struckRecently = false;
        }

        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;
        }

        var knightPoint = this.entity.game.playerAgent.centerPoint;

        var wispPoint = {
            x: (this.entity.x + (this.entity.width) / 2),
            y: (this.entity.y + (this.entity.height) / 2)
        }

        //If the knight is close enough, start chasing.
        var distanceToKnight = getDistance(wispPoint, knightPoint)
        if (distanceToKnight <= WISP_ATTR.ATTENTION_DISTANCE) {

            if (wispPoint.x - knightPoint.x !== 0) {
                var movementVector = getNormalizedSlope(wispPoint, knightPoint, distanceToKnight);

                if (this.struckRecently) {
                    //this.entity.game.requestMove(this, movementVector.x * WISP_ATTR.SPEED * 4,
                    //   movementVector.y * WISP_ATTR.SPEED * 4);
                    this.entity.x += movementVector.x * WISP_ATTR.SPEED * WISP_ATTR.FLEE_ACCELERATION;
                    this.entity.y += movementVector.y * WISP_ATTR.SPEED * WISP_ATTR.FLEE_ACCELERATION;

                    if (movementVector.x > 0) {
                        this.entity.currentAnimation = WISP_ANIM.FLOATING_RIGHT;
                    }
                    else {
                        this.entity.currentAnimation = WISP_ANIM.FLOATING_LEFT;
                    }
                } else {
                    //this.entity.game.requestMove(this, -movementVector.x * WISP_ATTR.SPEED,
                    //    -movementVector.y * WISP_ATTR.SPEED);
                    this.entity.x -= movementVector.x * WISP_ATTR.SPEED;
                    this.entity.y -= movementVector.y * WISP_ATTR.SPEED;

                    if (movementVector.x < 0) {
                        this.entity.currentAnimation = WISP_ANIM.FLOATING_RIGHT;
                    } else {
                        this.entity.currentAnimation = WISP_ANIM.FLOATING_LEFT;
                    }
                }
            }
        }

        if (distanceToKnight < WISP_ATTR.TOUCH_DISTANCE) {
            this.struckRecently = true;
            this.timeToStrikeAgain = WISP_ATTR.FLEE_TIME;
            this.entity.game.requestInputSend(this.entity.game.playerAgent, "damage", 1);
        }
    },

    readInput: function (input, modifier) {
        if (input === "damage") {
            if (this.invulnerableFrames === 0) {
                this.invulnerableFrames = WISP_ATTR.INVULNERABILITY_FRAMES;
                this.health--;
                if (this.health <= 0) {
                    this.entity.removeFromWorld = true;
                }
            }
        }
    },

    checkListeners: function (agent) {

    },

    draw: function () {
        this.entity.draw();
    }
}

function Archer (game, AM, x, y) {
    this.entity = new Entity(game, x, y, 68, 60);

    this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;

    this.health = ARCHER_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.confused = false;

    var idleRight = new Animation(AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.05, true);
    idleRight.addFrame(0, 0);
    var idleLeft = new Animation(AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.05, true);
    idleLeft.addFrame(73, 0);

    this.entity.animationList.push(idleRight);
    this.entity.animationList.push(idleLeft);
}

Archer.prototype = {

    update : function () {

        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;

            if (this.invulnerableFrames === 0) {
                this.confused = false;
            }
        }
        //Archers only know how to stand in place at the moment.

    },

    readInput: function (input, modifier) {
        if (input === "damage") {
            if (this.invulnerableFrames === 0) {
                this.invulnerableFrames = ARCHER_ATTR.INVULNERABILITY_FRAMES;
                this.health--;
                if (this.health <= 0) {
                    var index = this.entity.game.agents.indexOf(this);
                    this.entity.game.agents.splice(index, 1);
                } else {
                    this.confused = true;
                }
            }
        }
    },

    checkListeners: function (agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    },

    draw : function() {
        this.entity.draw();
    }
}

function Arrow (x, y, xVel, yVel, game) {
}

Arrow.prototype = {
    update : function () {

    },

    checkListeners: function (agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
            this.entity.game.agents.splice(this.entity.game.agents.indexOf(this), 1);
        }
    },

    draw: function () {
        this.entity.draw();
    }
}

function getDistance(myPoint, theirPoint) {
    return Math.sqrt(Math.pow((myPoint.x - theirPoint.x), 2) + Math.pow((myPoint.y - theirPoint.y), 2));
}

function getNormalizedSlope(myPoint, theirPoint, distance) {
    return {
        x: (myPoint.x - theirPoint.x) / distance,
        y: (myPoint.y - theirPoint.y) / distance
    }
}