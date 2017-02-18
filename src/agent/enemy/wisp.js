var WISP_ATTR = {
    STARTING_HEALTH: 1,
    SPEED: 2,
    ATTENTION_DISTANCE: 500,
    TOUCH_DISTANCE: 50,
    FLEE_TIME: .75, //Previously 45 frames
    FLEE_ACCELERATION: 4,
    INVULNERABILITY_TIME: .66
    //This should be true: SPEED*FLEE_TIME*FLEE_ACCELERATION < ATTENTION_DISTANCE
}

var WISP_ANIM = {
    FLOATING_RIGHT: 0,
    FLOATING_LEFT: 1,
    DYING: 2
}

function Wisp(game, AM, x, y) {
    this.entity = new Entity(x, y, 44, 50);
    this.entity.moveable = true;
    this.alive = true;
    this.game = game;
    this.input_types = game.input_types;
    this.struckRecently = false;
    this.timeToStrikeAgain = 0;
    this.health = WISP_ATTR.STARTING_HEALTH;
    this.invulnerableTime = 0;
    this.entity.addAnimationSet(new AnimationSet(ANIMATION_SET.WISP, AM));
}

Wisp.prototype = {

    update: function () {
      timeDiff = this.game.clockTick;

        if (this.alive) {
            if (this.timeToStrikeAgain > 0) {
                this.timeToStrikeAgain-= timeDiff;
            } else {
                this.struckRecently = false;
                this.entity.collidable = true;
            }

            if (this.invulnerableTime > 0) {
                this.invulnerableTime-= timeDiff;
                if (this.invulnerableTime <= 0) {
                    this.invulnerableTime = 0;
                }
            }

            var knightPoint = this.game.playerAgent.entity.getCenter();
            var wispPoint = this.entity.getCenter();

            //If the knight is close enough, start chasing.
            var distanceToKnight = getDistance(wispPoint, knightPoint)
            if (distanceToKnight <= WISP_ATTR.ATTENTION_DISTANCE) {

                if (wispPoint.x - knightPoint.x !== 0) {
                    var movementVector = getNormalizedSlope(wispPoint, knightPoint, distanceToKnight);

                    if (this.struckRecently) {
                        this.entity.x += movementVector.x * WISP_ATTR.SPEED * WISP_ATTR.FLEE_ACCELERATION;
                        this.entity.y += movementVector.y * WISP_ATTR.SPEED * WISP_ATTR.FLEE_ACCELERATION;

                        if (movementVector.x > 0) {
                            this.entity.currentAnimation = WISP_ANIM.FLOATING_RIGHT;
                        }
                        else {
                            this.entity.currentAnimation = WISP_ANIM.FLOATING_LEFT;
                        }
                    } else {
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
                this.entity.collidable = false;
                this.game.requestInputSend(this.game.playerAgent, this.input_types.DAMAGE, 1);
            }
        } else {
            this.entity.setAnimation(WISP_ANIM.DYING);
            if (this.entity.animationList[WISP_ANIM.DYING].isDone()) {
                this.entity.removeFromWorld = true;
            }
        }
    },

    readInput: function (input, modifier) {
        if (input === this.input_types.DAMAGE) {
            if (this.invulnerableTime <= 0) {
                this.invulnerableTime = WISP_ATTR.INVULNERABILITY_TIME;
                this.health--;
                if (this.health <= 0) {
                    this.entity.x += this.entity.width / 2;
                    this.entity.y += this.entity.height / 2;
                    // this.entity.removeFromWorld = true;
                    this.entity.collidable = false;
                    this.alive = false;
                }
            }
        }
        if (input === this.input_types.RESET) {
            this.alive = true;
            this.entity.collidable = true;
            this.health = WISP_ATTR.STARTING_HEALTH;
            this.invulnerableTime = 0;
            this.entity.animationList[WISP_ANIM.DYING].elapsedTime = 0;
        }
    },
}
