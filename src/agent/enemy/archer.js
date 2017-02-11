var ARCHER_ATTR = {
    VISION_RADIUS: 4000,
    STARTING_HEALTH: 1,
    SHOOTING_TIME: 2, //Previously 120 frames
    INVULNERABILITY_TIME: .66, //Prev: 40 frames
    ARROW_SPEED: 8,
}

var ARCHER_ANIM = {
    IDLE_RIGHT: 0,
    IDLE_LEFT: 1,
    ATK_STRAIGHT_LEFT: 2,
    ATK_STRAIGHT_RIGHT: 3,
    ATK_DOWN_LEFT: 4,
    ATK_DOWN_RIGHT: 5,
    ATK_UP_LEFT: 6,
    ATK_UP_RIGHT: 7,
    DYING: 8,
}

var ARCHER_PHYSICS = {
    TERMINAL_X_VELOCITY : 0,
    TERMINAL_Y_VELOCITY : 0,
    KNOCKBACK_VELOCITY : 0,
    INITIAL_X_VELOCITY : 0,
    INITIAL_Y_VELOCITY : 0,
    Y_ACCELERATION : 0,
    X_ACCELRATION : 0,
}

function Archer (game, AM, x, y) {
    AbstractAgent.call(this, game, x, y, ARCHER_PHYSICS);
    this.entity = new Entity(x, y, 68, 60);
    this.game = game;

    this.timeUntilNextArrow = ARCHER_ATTR.SHOOTING_TIME;
    this.health = ARCHER_ATTR.STARTING_HEALTH;
    this.vision = ARCHER_ATTR.VISION_RADIUS;
    this.invulnerableTime = 0;
    this.center = this.entity.getCenter()
    this.entity.addAnimationSet(new AnimationSet(ANIMATION_SET.ARCHER, AM));
    
    // For passing to arrows
    this.arrowImg = AM.getAsset("./img/enemy/arrow.png");
}

Archer.prototype = Object.create(AbstractAgent.prototype);

Archer.prototype.update = function() {
    timeDiff = this.game.clockTick;

    if (this.entity.collidable) {
        var knightPoint = this.game.playerAgent.entity.getCenter();

        var distanceX = knightPoint.x - this.center.x;
        var distanceY = knightPoint.y - this.center.y;

        var angle = Math.atan2(-distanceY, distanceX);
        var distance = getDistance(this.center, knightPoint);

        if (distance < this.vision) {
            if (this.timeUntilNextArrow >= ARCHER_ATTR.SHOOTING_TIME) {
                this.setAnimationFromAngle(angle);
            }
            this.timeUntilNextArrow -= timeDiff;
            if (this.timeUntilNextArrow <= 0) {
                this.timeUntilNextArrow = ARCHER_ATTR.SHOOTING_TIME;
            }
        }

        if (this.entity.currentAnimation !== ARCHER_ANIM.IDLE_LEFT &&
            this.entity.currentAnimation !== ARCHER_ANIM.IDLE_RIGHT) {

            if (this.entity.animationList[this.entity.currentAnimation].isFinalFrame()) {
                this.entity.animationList[this.entity.currentAnimation].elapsedTime = 0;

                var arrow = new Arrow(this, distanceX, distanceY, angle);
                this.game.addAgent(arrow);

                if (knightPoint.x > this.entity.x) {
                    this.entity.currentAnimation = ARCHER_ANIM.IDLE_RIGHT;
                } else {
                    this.entity.currentAnimation = ARCHER_ANIM.IDLE_LEFT;
                }
            }
        }
    } else {
        this.entity.setAnimation(ARCHER_ANIM.DYING);
        if (this.entity.animationList[ARCHER_ANIM.DYING].isDone()) {
            this.entity.removeFromWorld = true;
        }
    }
}

Archer.prototype.readInput = function(input) {
    if (input === "damage") {
        this.health--;
        if (this.health <= 0) {
            this.entity.x += this.entity.width / 2;
            this.entity.y += this.entity.height / 2;
            this.entity.collidable = false;
        }
    }
    if (input === "reset") {
        this.entity.collidable = true;
        this.health = ARCHER_ATTR.STARTING_HEALTH;
        this.entity.animationList[ARCHER_ANIM.DYING].elapsedTime = 0;
    }
}

Archer.prototype.setAnimationFromAngle = function(angle) {
    if (angle >= Math.PI / (-6) && angle <= Math.PI / 6) {   // [-30, 30] degree
        this.entity.currentAnimation = ARCHER_ANIM.ATK_STRAIGHT_RIGHT;
    } else if (angle > Math.PI / 6 && angle <= Math.PI / 2) {   // (30, 90] degree
        this.entity.currentAnimation = ARCHER_ANIM.ATK_UP_RIGHT;
    } else if (angle > Math.PI / 2 && angle < 5 * Math.PI / 6) {   // (90, 150) degree
        this.entity.currentAnimation = ARCHER_ANIM.ATK_UP_LEFT;
    } else if (angle >= 5 * Math.PI / 6 || angle <= (-5) * Math.PI / 6) {
        this.entity.currentAnimation = ARCHER_ANIM.ATK_STRAIGHT_LEFT;
    } else if (angle > (-5) * Math.PI / 6 && angle <= Math.PI / (-2)) {    // (-150, -90] degree
        this.entity.currentAnimation = ARCHER_ANIM.ATK_DOWN_LEFT;
    } else {
        this.entity.currentAnimation = ARCHER_ANIM.ATK_DOWN_RIGHT;
    }
}

Archer.prototype.checkListeners = function(agent) {
    if (agent.entity.controllable) {
        this.game.requestInputSend(agent, "damage", 1);
    }
}

function Arrow(archer, distanceX, distanceY, angle) {
    this.game = archer.game;
    this.entity = new Entity(archer.center.x, archer.center.y, 25, 5);
    this.entity.temporary = true;
    this.entity.moveable = true;
    this.entity.nonColliders = [archer.entity];

    var actualSpeed = ARCHER_ATTR.ARROW_SPEED / Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    this.xVel = distanceX * actualSpeed;
    this.yVel = distanceY * actualSpeed;
    this.angle = angle;

    var arrowAnimation = new Animation(this.rotateAndCache(archer.arrowImg), this.entity.width, this.entity.width, 0.2, true);
    arrowAnimation.addFrame(0, 0);
    this.entity.animationList.push(arrowAnimation);
}

Arrow.prototype = {

    update: function () {
        this.game.requestMove(this, this.xVel, this.yVel);
    },

    checkListeners: function (agent) {
        if (agent.entity.controllable) {
            this.game.requestInputSend(agent, "damage", 1);
            this.entity.removeFromWorld = true;
        }

        //If the entity collides, remove it from the world.
        if (!agent.entity.intangible) {
            this.entity.removeFromWorld = true;
        }
    },

    rotateAndCache: function (image) {
        var size = this.entity.width;
        var offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;
        var offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.translate(size / 2, size / 2);
        offscreenCtx.rotate(-this.angle);
        offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
        return offscreenCanvas;
    }
}