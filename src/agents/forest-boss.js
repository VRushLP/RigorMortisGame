var ARM_STATE = {
    RISING: 0,
    RESTING: 1,
    FALLING: 2,
    HIDING: 3
}

var ANIM = {
    THIN: 0,
    NORMAL: 1,
    WIDE: 2
}

var ARM_MAX_HEIGHT = 500;


function ForestBoss(game, AM, x, y, stage) {
    //Setting width and height to 0 may cause problems.
    this.entity = new Entity(game, x, y, 0, 0);
    this.entity.collidable = false;
    
    this.speed = 0;
    this.health = 4;
    
    this.arms = [];
    for (var i = 0; i < 4; i++) {
        this.arms.push(new ForestBossArm(game, AM, x + 100 + 250 * i, y));
        this.arms[i].setSize(ANIM.THIN);
        stage.entityList.push(this.arms[i]);
    }
    
    this.core = new ForestBossCore(game, AM, x, y);
    //stage.entityList.push(this.core);
    this.neutralPattern();
}

ForestBoss.prototype = {
    
    update: function () {
        
    },
    
    draw: function() {
        this.entity.draw();
    },
    
    neutralPattern: function () {
        this.arms[0].speed = 1;
        this.arms[0].currentState = ARM_STATE.RISING;
        
        this.arms[1].speed = 2;
        this.arms[1].currentState = ARM_STATE.RISING;
        
        this.arms[2].speed = 1;
        this.arms[2].currentState = ARM_STATE.RISING;
        
        this.arms[3].speed = 3;
        this.arms[3].restTime = 50;
        this.arms[3].currentState = ARM_STATE.RISING;
    }
    
}

function ForestBossArm(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 0, 0);
    this.entity.moveable = true;
    
    this.currentState = ARM_STATE.HIDING;
    this.originY = y;
    this.speed = 0;
    this.size = ANIM.THIN;
    
    this.restTime = 0;
    this.currentRest = 0;
    
    var thinAnimation = new Animation(AM.getAsset("./img/enemy/forest boss spike 50px.png"), 50, 500, 1, true);
    thinAnimation.addFrame(0, 0);
    this.entity.addAnimation(thinAnimation);
}

ForestBossArm.prototype = {
    
    update: function () {
        
        if (this.currentState === ARM_STATE.HIDING) {
            this.entity.height = 0;
            this.entity.y = this.originY;
            //Set to be non-collidable to avoid catching the player on the invisible entity.
            this.entity.collidable = false;
        } else {
            //Arm should always be collidable when it is above ground.
            this.entity.collidable = true;
        }
        
        if (this.currentState === ARM_STATE.RISING) {
            if (ARM_MAX_HEIGHT - this.getHeight() <= this.speed) {
                this.entity.game.requestMove(this, 0, -1 * (ARM_MAX_HEIGHT - this.getHeight()) );
            } else {
                this.entity.game.requestMove(this, 0, -1 * this.speed);
            }
        }
        
        if (this.currentState === ARM_STATE.RESTING) {
            if (this.currentRest <= 0) {
                this.currentState = ARM_STATE.FALLING;
            } else {
                this.currentRest--;
            }
        }
        
        if (this.currentState === ARM_STATE.FALLING) {
            if (this.getHeight() <= this.speed) {
                this.entity.height = 0;
                this.entity.game.requestMove(this, 0, this.getHeight());
            } else {
                this.entity.height -= this.speed;
                this.entity.game.requestMove(this, 0, this.speed);
            }
        }
        
        //Update the entity and animation based on the current height.
        this.entity.height = this.getHeight() - 1;
        var anim = this.entity.animationList[this.entity.currentAnimation];
        anim.frameHeight = this.getHeight();
        
        if (this.getHeight() === ARM_MAX_HEIGHT && this.currentState === ARM_STATE.RISING) {
            this.currentState = ARM_STATE.RESTING;
            this.currentRest = this.restTime;
        }
        
        if (this.getHeight() <= this.speed && this.currentState === ARM_STATE.FALLING) {
            this.currentState = ARM_STATE.HIDING;
        }
    },
    
    draw: function() {
        this.entity.draw();
    },
    
    rise: function () {
        this.currentState = ARM_STATE.RISING;
    },
    
    getHeight: function () {
        return this.originY - this.entity.y;
    },
    
    setSize: function (size) {
        if (size === ANIM.THIN) {
            this.entity.width = 50;
        }
        if (size === ANIM.NORMAL) {
            this.entity.width = 100;
        }
        if (size === ANIM.WIDE) {
            this.entity.width = 150;
        }
        
        this.entity.setAnimation(size);
    }
    
}
    
function ForestBossCore(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 0, 0);
}

ForestBossCore.prototype = {
    
    update: function () {
        
    },
    
    draw: function() {
        this.entity.draw();
    },
    
}