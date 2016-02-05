function Knight (x, y, game, level) {
    Entity.call(this, x, y, 41, 50);
    this.level = level;
    this.game = game;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.follower = [];
    this.checkPointX = this.currentX_px;
    this.checkPointY = this.currentY_px;
    
    this.health = GAME_CONSTANT.MAX_HEALTH;
    
    this.injureTime = GAME_CONSTANT.INJURE_TIME;
    
    //setting up gamestate bools
    this.removeFromWorld = false;
    this.controllable = true;
    this.moveable = true;
    this.isRight = true;
    this.isAttacking = false;
    this.isInjure = false;
    
    var KnightAttackRight = new Animation(AM.getAsset("./img/knight/knight attack draft.png"), 90, 64, 0.05, false);
    KnightAttackRight.addFrame(0, 0, 12);
    var KnightAttackLeft = new Animation(AM.getAsset("./img/knight/knight attack draft flipped.png"), 90, 64, 0.05, false);
    KnightAttackLeft.addFrame(0, 0, 12);
    
    var KnightHitRight = new Animation(AM.getAsset("./img/knight/knight hit draft.png"), 48, 50, 0.10, true);
    KnightHitRight.addFrame(0, 0);
    var KnightHitLeft = new Animation(AM.getAsset("./img/knight/knight hit draft flipped.png"), 48, 50, 0.10, true);
    KnightHitLeft.addFrame(0, 0);
    
    var KnightRestRight = new Animation(AM.getAsset("./img/knight/knight standing.png"), 41, 50, 0.10, true);
    KnightRestRight.addFrame(0, 0);
    var KnightRestLeft = new Animation(AM.getAsset("./img/knight/knight standing flipped.png"), 41, 50, 0.10, true);
    KnightRestLeft.addFrame(0, 0);
    
    var KnightWalkRight = new Animation(AM.getAsset("./img/knight/knight run draft.png"), 47, 52, 0.10, true);
    KnightWalkRight.addFrame(0, 0, 8);
    var KnightWalkLeft = new Animation(AM.getAsset("./img/knight/knight run draft flipped.png"), 47, 52, 0.10, true);
    KnightWalkLeft.addFrame(329, 0, 8, false);
    
    var KnightJumpRight = new Animation(AM.getAsset("./img/knight/knight jump draft.png"), 47, 55, 0.10, true);
    KnightJumpRight.addFrame(0, 0);
    var KnightJumpLeft = new Animation(AM.getAsset("./img/knight/knight jump draft flipped.png"), 47, 55, 0.10, true);
    KnightJumpLeft.addFrame(47, 0);
    
    var KnightFallRight = new Animation(AM.getAsset("./img/knight/knight jump draft.png"), 47, 55, 0.10, true);
    KnightFallRight.addFrame(47, 0);
    var KnightFallLeft = new Animation(AM.getAsset("./img/knight/knight jump draft flipped.png"), 47, 55, 0.10, true);
    KnightFallLeft.addFrame(0, 0);
    
    this.animationList.push(KnightRestRight);
    this.animationList.push(KnightRestLeft);
    this.animationList.push(KnightWalkRight);
    this.animationList.push(KnightWalkLeft);
    this.animationList.push(KnightJumpRight);
    this.animationList.push(KnightJumpLeft);
    this.animationList.push(KnightFallRight);
    this.animationList.push(KnightFallLeft);
    this.animationList.push(KnightAttackRight);
    this.animationList.push(KnightAttackLeft);
    this.animationList.push(KnightHitRight);
    this.animationList.push(KnightHitLeft);
}

Knight.prototype = {
    moveX : function () {
        if (this.controllable) {
            if (this.game.keyStatus["d"])  {
                this.isRight = true;
                this.xVelocity = GAME_CONSTANT.RUNNING_SPEED;
                this.currentAnimation = GAME_CONSTANT.WALKING_RIGHT_ANIMATION;
            } else if (this.game.keyStatus["a"]) {
                this.isRight = false;
                this.xVelocity = -GAME_CONSTANT.RUNNING_SPEED;
                this.currentAnimation = GAME_CONSTANT.WALKING_LEFT_ANIMATION;
            } else if (!this.game.keyStatus["d"] && !this.game.keyStatus["a"]) {
                this.xVelocity = 0;
                if (this.isRight) {
                    this.currentAnimation = GAME_CONSTANT.REST_RIGHT_ANIMATION;
                } else {
                    this.currentAnimation = GAME_CONSTANT.REST_LEFT_ANIMATION;
                }
            }
            var tempX = this.currentX_px + this.xVelocity;
            var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
            if (!obstacle) {
                this.currentX_px = tempX;
            } else if (obstacle.fieldType === "door") {
                this.level.displayHidden(this.currentX_px, this.currentY_px, obstacle);
                this.currentX_px = tempX;
            }
        }
    },
    
    moveY : function () {
        if (this.controllable) {
            if (this.yVelocity < GAME_CONSTANT.TERMINAL_VELOCITY) {
                this.yVelocity += GAME_CONSTANT.Y_ACCELERATION;
            }
            var tempY = this.currentY_px + this.yVelocity;
            var obstacle = this.level.obstacleAt(this.currentX_px, tempY, this.width, this.height);
            if (!obstacle || obstacle.fieldType === "door") {
                this.currentY_px = tempY;
            } else {
                if (this.game.keyStatus["w"] && this.yVelocity === GAME_CONSTANT.Y_ACCELERATION) {
                    this.yVelocity = -GAME_CONSTANT.JUMP_SPEED;
                } else {
                    this.yVelocity = 0;
                    if (this.currentY_px < obstacle.currentY_px) {
                        this.currentY_px = obstacle.currentY_px - this.height - 0.1; 
                    }    
                }
            }
            if (this.yVelocity !== 0) {
                if (this.yVelocity > 0) {
                    if (this.isRight) {  
                        this.currentAnimation = GAME_CONSTANT.FALLING_RIGHT_ANIMATION;
                    } else {
                        this.currentAnimation = GAME_CONSTANT.FALLING_LEFT_ANIMATION;
                    }
                } else if (this.yVelocity < 0) { 
                    if (this.isRight) {
                        this.currentAnimation = GAME_CONSTANT.JUMPING_RIGHT_ANIMATION;
                    } else {
                        this.currentAnimation = GAME_CONSTANT.JUMPING_LEFT_ANIMATION;
                    }
                }
            }
        }
    },
    
    dealWithMonster : function (monster) {
        if (monster.type === "health") {
            if (this.health < GAME_CONSTANT.MAX_HEALTH) {
                monster.removeFromWorld = true;
                this.health += monster.health;
            } 
            if (this.health >= GAME_CONSTANT.MAX_HEALTH) {
                this.health = GAME_CONSTANT.MAX_HEALTH;
            }
        } else if (monster instanceof Arrow) {
            monster.removeFromWorld = true;
            this.health -= 1;
        }else {
            if (this.isAttacking) {
                // TODO deal with the monster attacks at behind.
                monster.health -= GAME_CONSTANT.DAMAGE;
                if (monster.health < 0) {
                    monster.removeFromWorld = true;
                }
            } else {
                if (this.health > 0 && !this.isInjure) { 
                    this.health -= GAME_CONSTANT.DAMAGE;
                    this.isInjure = true;
                    // TODO make some effects when the knight touches the monster.
                }
            }
        }
    },
        
    update : function () {
            var tick = this.game.clockTick;
            this.moveX();
            this.moveY();
            if (this.game.keyStatus['j'] && this.yVelocity === 0) {
                this.controllable = false;
                this.isAttacking = true;
                if (this.isRight) {
                    this.currentAnimation = GAME_CONSTANT.ATTACKING_RIGHT_ANIMATION;
                } else {
                    this.currentAnimation = GAME_CONSTANT.ATTACKING_LEFT_ANIMATION;
                }
            }
            if (this.animationList[GAME_CONSTANT.ATTACKING_RIGHT_ANIMATION].isDone() || 
                this.animationList[GAME_CONSTANT.ATTACKING_LEFT_ANIMATION].isDone()) {
                this.animationList[GAME_CONSTANT.ATTACKING_RIGHT_ANIMATION].elapsedTime = 0;
                this.animationList[GAME_CONSTANT.ATTACKING_LEFT_ANIMATION].elapsedTime = 0;
                this.controllable = true;
                this.isAttacking = false;
            }
            var monster = this.level.enemyAt(this);
            if (monster) {
                // console.log(monster);
                this.dealWithMonster(monster);
            }
            if (this.isInjure) {
                this.injureTime -= tick;
            }
            if (this.injureTime <= 0) {
                this.injureTime = GAME_CONSTANT.INJURE_TIME;
                this.isInjure = false;
            }

            if (this.health === 0) {
                // TODO reset a map or go back to the check point
                this.currentX_px = this.checkPointX;
                this.currentY_px = this.checkPointY;
                this.health = GAME_CONSTANT.MAX_HEALTH;
            }
        Entity.prototype.update.call(this);
    },
    
    draw : function (ctx, cameraRect, tick) {
        // console.log(cameraRect.left + " " + cameraRect.top + " " + this.currentX_px + " " + this.currentY_px);
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
        var percent = this.health / GAME_CONSTANT.MAX_HEALTH;
        ctx.fillStyle = "black";
        ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10, 
                        this.width, 5);
        if (percent > 0.4) {
            ctx.fillStyle = "green";
        } else {  
            ctx.fillStyle = "red";
        }
        ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10, 
                        this.width * percent, 5);
    }
};