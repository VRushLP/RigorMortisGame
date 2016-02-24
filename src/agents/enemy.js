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
    IDLE_LEFT : 0,
    IDLE_RIGHT : 1,
    ATK_STRAIGHT_LEFT : 2,
    ATK_STRAIGHT_RIGHT : 3,
    ATK_DOWN_LEFT : 4,
    ATK_DOWN_RIGHT : 5,
    ATK_UP_LEFT : 6,
    ATK_UP_RIGHT : 7,

    VISION_RADIUS : 550,
    STARTING_HEALTH : 4,
    SHOOTING_TIME : 2,
    INVULNERABILITY_FRAMES: 40,

    ARROW_SPEED : 7
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

    draw: function(cameraX, cameraY) {
        this.entity.draw(cameraX, cameraY);
    },

    readInput: function(input, modifier) {
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

    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}


function Archer (game, x, y, level) {
    this.entity = new Entity(game, x, y, 73, 64);
    this.entity.y -= 14;
    // this.entity.moveable = false;

    this.level = level;
    this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;

    this.health = ARCHER_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.vision = ARCHER_ATTR.VISION_RADIUS;

    var archerImg = AM.getAsset("./img/enemy/archer.png");
    var archerRight = new Animation(archerImg, 73, 64, 0.05, true);
    var archerLeft = new Animation(archerImg, 73, 64, 0.05, true);
    var archerLeftShooting = new Animation(archerImg, 73, 64, 0.2, false);
    var archerRightShooting = new Animation(archerImg, 73, 64, 0.2, false);
    var archerLeftShootingDown = new Animation(archerImg, 73, 64, 0.2, false);
    var archerRightShootingDown = new Animation(archerImg, 73, 64, 0.2, false);
    var archerLeftShootingUp = new Animation(archerImg, 73, 64, 0.2, false);
    var archerRightShootingUp = new Animation(archerImg, 73, 64, 0.2, false);
    archerRight.addFrame(73, 0);
    archerLeft.addFrame(0, 0);
    archerLeftShooting.addFrame(0, 64, 3);
    archerRightShooting.addFrame(0, 128, 3);
    archerLeftShootingDown.addFrame(0, 192, 3);
    archerRightShootingDown.addFrame(0, 256, 3);
    archerLeftShootingUp.addFrame(0, 320, 3);
    archerRightShootingUp.addFrame(0, 384, 3);

    this.entity.animationList.push(archerLeft);
    this.entity.animationList.push(archerRight);
    this.entity.animationList.push(archerLeftShooting);
    this.entity.animationList.push(archerRightShooting);
    this.entity.animationList.push(archerLeftShootingDown);
    this.entity.animationList.push(archerRightShootingDown);
    this.entity.animationList.push(archerLeftShootingUp);
    this.entity.animationList.push(archerRightShootingUp);

    this.removeFromWorld = false;
}

Archer.prototype = {
    setAnimationFromAngle : function (angle) {
        if (angle >= Math.PI / (-6) && angle <= Math.PI / 6) {   // [-30, 30] degree
            this.entity.currentAnimation = ARCHER_ATTR.ATK_STRAIGHT_RIGHT;
        } else if (angle > Math.PI / 6 && angle <= Math.PI / 2) {   // (30, 90] degree
            this.entity.currentAnimation = ARCHER_ATTR.ATK_UP_RIGHT;
        } else if (angle > Math.PI / 2 && angle < 5 * Math.PI / 6) {   // (90, 150) degree
            this.entity.currentAnimation = ARCHER_ATTR.ATK_UP_LEFT;
        } else if (angle >= 5 * Math.PI / 6 || angle <= (-5) * Math.PI / 6) {
            this.entity.currentAnimation = ARCHER_ATTR.ATK_STRAIGHT_LEFT;
        } else if (angle > (-5) * Math.PI / 6 && angle <= Math.PI / (-2)) {    // (-150, -90] degree
            this.entity.currentAnimation = ARCHER_ATTR.ATK_DOWN_LEFT;
        } else {
            this.entity.currentAnimation = ARCHER_ATTR.ATK_DOWN_RIGHT;
        }
    },

    update: function (tick, posX, posY, width, height) {

        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;
        }
        var playerCenter = {
            x : posX + Math.floor(width / 2),
            y : posY + Math.floor(height / 2)
        };

        var archerCenter = {
            x : this.entity.x + Math.floor(this.entity.width / 2),
            y : this.entity.y + Math.floor(this.entity.height / 2)
        };

        var distanceX = playerCenter.x - archerCenter.x;
        var distanceY = playerCenter.y - archerCenter.y;
        var angle = Math.atan2(-distanceY, distanceX);
        var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        // check if the knight is in the vision radius (450 px), count down the shooting time.
        if (distance < this.vision) {
            if (this.timeDurationNextArrow === ARCHER_ATTR.SHOOTING_TIME) {
                this.setAnimationFromAngle(angle);
            }
            this.timeDurationNextArrow -= tick;
            if (this.timeDurationNextArrow <= 0) {
                this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;
            }
        }
        if (this.entity.currentAnimation !== ARCHER_ATTR.IDLE_LEFT && this.entity.currentAnimation !== ARCHER_ATTR.IDLE_RIGHT) {
            if (this.entity.animationList[this.entity.currentAnimation].isFinalFrame()) {
                this.entity.animationList[this.entity.currentAnimation].elapsedTime = 0;
                var arrow = new Arrow(this, archerCenter.x, archerCenter.y, distanceX, distanceY, angle, this.level, this.entity.game);
                this.level.enemies.push(arrow);
                this.entity.game.addAgent(arrow);
                if (posX > this.entity.x) {
                    this.entity.currentAnimation = ARCHER_ATTR.IDLE_RIGHT;
                } else {
                    this.entity.currentAnimation = ARCHER_ATTR.IDLE_LEFT;
                }
            }
        }
    },

    draw : function (cameraX, cameraY) {
        this.entity.draw(cameraX, cameraY);
    },

    readInput : function(input, modifier) {
        if (input === "damage") {
            if (this.invulnerableFrames === 0) {
                this.invulnerableFrames = ARCHER_ATTR.INVULNERABILITY_FRAMES;
                this.health--;
                if (this.health <= 0) {
                    var index = this.entity.game.agents.indexOf(this);
                    this.entity.game.agents.splice(index, 1);
                }
            }
        }
    },

    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}

function Arrow (source, x, y, distanceX, distanceY, angle, level, game) {
    this.source = source;
    this.entity = new Entity(game, x, y, 25, 5);
    this.entity.x = x - Math.ceil(25 / 2);
    this.entity.y = y - Math.ceil(5 / 2);
    this.centerX = x;
    this.centerY = y;
    this.level = level;
    this.maxVel = ARCHER_ATTR.ARROW_SPEED;
    var scale = this.maxVel / Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    this.xVel = distanceX * scale;
    this.yVel = distanceY * scale;
    this.angle = angle;
    var arrowRight = new Animation(AM.getAsset("./img/enemy/archer.png"), this.entity.width, this.entity.height, 0.2, true);
    arrowRight.addFrame(146, 5);

    this.entity.animationList.push(arrowRight);
}

Arrow.prototype = {
    obstacleAt : function (x, y) {
        for (var i = 0; i < this.entity.game.agents.length; i += 1) {
            var obstacle = this.entity.game.agents[i];
            if (this !== obstacle && this.source !== obstacle) {
                if (x + this.entity.width > obstacle.entity.x &&
                    x < obstacle.entity.x + obstacle.entity.width &&
                    y + this.entity.height > obstacle.entity.y &&
                    y < obstacle.entity.y + obstacle.entity.height) {
                        return obstacle;
                    }
            }
        }
    },

    update : function () {
        var tempX = this.centerX + this.xVel;
        var tempY = this.centerY + this.yVel;
        var obstacle = this.obstacleAt(tempX, tempY);
        if (!obstacle) {
            this.centerX = tempX;
            this.centerY = tempY;
        } else {
            // if (obstacle instanceof Knight) {
            //     obstacle.health--;
            // }
            var i = this.level.enemies.indexOf(this);
            this.level.enemies.splice(i, 1);
            i = this.entity.game.agents.indexOf(this);
            this.entity.game.agents.splice(i, 1);
        }
        this.entity.x = this.centerX - Math.ceil(25 / 2);
        this.entity.y = this.centerY - Math.ceil(25 / 2);
    },

    draw : function (cameraX, cameraY) {
        this.entity.ctx.save();
        this.entity.ctx.translate(this.entity.x + cameraX, this.entity.y - cameraY + 10);
        this.entity.ctx.rotate(-this.angle);
        this.entity.animationList[this.entity.currentAnimation].drawFrame(this.entity.game.clockTick,
                            this.entity.ctx, 0, 0);
        this.entity.ctx.restore();
    },

    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}
