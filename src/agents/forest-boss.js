var ARM_STATE = {
    RISING: 0,
    RESTING: 1,
    FALLING: 2,
    HIDING: 3
}

var ANIM = {
    THIN: 0,
    NORMAL: 1,
    WIDE: 2,
    PLATFORM: 3
}

var PATTERN = {
    NEUTRAL: 0,
    RETREAT: 1,
    ATTACK: 2
}

var ATTR = {
    PHASE_1_HEALTH: 6,
    PHASE_2_HEALTH: 3
}

var ARM_MAX_HEIGHT = 500;


/*
 * The Forest Boss features four arms and a core.
 * The Forest Boss must be placed in a clear area of at least 850 x 500,
 * and must be placed 1 above the ground.
 * As the player strikes the core, the Forest Boss will alternate which of its patterns
 * it utilizes, and send signals to its arms accordingly.
 */
function ForestBoss(game, AM, x, y, stage) {
    this.entity = new Entity(game, x, y, 0, 0);
    this.entity.collidable = false;
    this.pattern = PATTERN.NEUTRAL;
    
    this.speed = 0;
    this.health = 9;
    this.phase = 0;
    
    //Initialize the boss' arms and core.
    this.arms = [];
    for (var i = 0; i < 4; i++) {
        this.arms.push(new ForestBossArm(game, AM, x + 100 + 250 * i, y));
        this.arms[i].setSize(ANIM.THIN);
        this.arms[i].originalPos = i;
        stage.entityList.push(this.arms[i]);
    }
    
    this.core = new ForestBossCore(game, AM, x, y, this);
    stage.entityList.push(this.core);
    //Attach the core to arm four.
    this.core.arm = this.arms[3];
    
    this.setNormalDistro();
    this.neutralPattern();
}

ForestBoss.prototype = {
    
    update: function () {       
        
        if (this.allArmsHidden()) {
            if (this.pattern === PATTERN.RETREAT) {
                if (this.health <= 0) {
                    this.selfDestruct();
                    return;
                }
                
                this.setAttackDistro();
                this.attackPattern();
            } else if (this.pattern === PATTERN.ATTACK) {
                this.setNormalDistro();
                this.neutralPattern();
            } else if (this.pattern === PATTERN.NEUTRAL) {
                this.setNormalDistro();            
                this.neutralPattern();
            }
        }
    },
    
    draw: function() {
        this.entity.draw();
    },
    
    //The neutral pattern raises all arms at the same speed.
    neutralPattern: function () {
        this.pattern = PATTERN.NEUTRAL;
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].speed = 2 + this.phase;
            this.arms[i].restTime = 125 - (this.phase * 25);
            this.arms[i].currentState = ARM_STATE.RISING;
        }
    },
    
    retreatPattern: function () {
        this.pattern = PATTERN.RETREAT;
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].speed = 8;
            this.arms[i].currentState = ARM_STATE.FALLING;
        }
    },
    
    attackPattern: function () {
        this.pattern = PATTERN.ATTACK;
        this.shuffleArms();
        
        this.arms[0].speed = 4 + this.phase;
        this.arms[1].speed = 4.5 + this.phase;
        this.arms[2].speed = 5 + this.phase;
        this.arms[3].speed = 6 + this.phase;
        
        this.unshuffleArms();
        
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].restTime = 0;
            this.arms[i].currentState = ARM_STATE.RISING;
        }
    },
    
    //Return true if the current state of all arms is hidden.
    allArmsHidden: function () {
        for (var i = 0; i < this.arms.length; i++) {
            if (this.arms[i].currentState !== ARM_STATE.HIDING) return false;
        }
        return true;
    },
    
    //Randomly assign the arm states along the normal distribution:
    //two platforms adjacent to the other, and one containing the core.
    setNormalDistro: function () {
        var corePos = Math.floor(Math.random() * 4);
        this.core.arm = this.arms[corePos];
        
        var supportPlatform;
        
        switch (corePos) {
            case 0:
                supportPlatform = 1;
                break;
            case 1: 
                if (Math.floor(Math.random()) * 2 === 0) supportPlatform = 0;
                else supportPlatform = 2;
                break;
            case 2:
                if (Math.floor(Math.random()) * 2 === 0) supportPlatform = 1;
                else supportPlatform = 3;
                break;
            case 3:
                supportPlatform = 2;
                break;
        }
        
        for (var i = 0; i < 4; i++) {
            if (i === corePos) this.arms[i].setSize(ANIM.PLATFORM);
            else if (i === supportPlatform) this.arms[i].setSize(ANIM.PLATFORM);
            else this.arms[i].setSize(ANIM.THIN);
        }
    },
    
    setAttackDistro: function () {
        this.core.arm = null;
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].setSize(ANIM.THIN);
        }
    },
    
    takeDamage: function () {
        this.health--;
        for (var i = 0; i < this.arms.length; i++) {
            this.retreatPattern();
        }
        
        if (this.health === ATTR.PHASE_1_HEALTH) this.phase = 1;
        if (this.health === ATTR.PHASE_2_HEALTH) this.phase = 2;
    },
    
    //Shuffle the arms array into a new random order.
    shuffleArms: function () {
        for (var i = this.arms.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.arms[i];
            this.arms[i] = this.arms[j];
            this.arms[j] = temp;
        }
    },
    
    //Resets the arms array to its original order.
    unshuffleArms: function () {
        //Create a copy of the arms array called newArms.
        var newArms = [];
        for (var i = 0; i < this.arms.length; i++) {
            newArms.push(this.arms[i]);
        }        
        //Re-arrange newArms into the original order.
        for (var i = 0; i < this.arms.length; i++) {
            newArms[this.arms[i].originalPos] = this.arms[i];
        }
        //Set the arms array to be the sorted newArms.
        this.arms = newArms;

    },
    
    selfDestruct: function () {
        for (var i = 0; i < this.arms.length; i++) {
            var index = this.entity.game.agents.indexOf(this.arms[i]);
            this.entity.game.agents.splice(index, 1);
        }
        
        var index = this.entity.game.agents.indexOf(this.core);
        this.entity.game.agents.splice(index, 1);
        
        index = this.entity.game.agents.indexOf(this);
        this.entity.game.agents.splice(index, 1);
    }
    
}



/*
 * A Forest Boss Arm is either a thin/normal/wide spike, or a platform.
 * Arms have four states, and independently determine what they should do
 * based on certain parameters provided by Forest Boss.
 */
function ForestBossArm(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 0, 0);
    this.entity.moveable = true;
    
    this.currentState = ARM_STATE.HIDING;
    this.originY = y;
    this.speed = 0;
    this.size = ANIM.THIN;
    this.originalPos = 0;
    
    //Determines how long the arm waits between rising to its peak and then falling.
    this.restTime = 0;
    this.currentRest = 0;
    
    var thinAnimation = new Animation(AM.getAsset("./img/enemy/forest boss spike 50px.png"), 50, 500, 1, true);
    thinAnimation.addFrame(0, 0);
    this.entity.addAnimation(thinAnimation);
    
    var normalAnimation = new Animation(AM.getAsset("./img/enemy/forest boss spike 100px.png"), 100, 500, 1, true);
    normalAnimation.addFrame(0, 0);
    this.entity.addAnimation(normalAnimation);
    
    var wideAnimation = new Animation(AM.getAsset("./img/enemy/forest boss spike 150px.png"), 150, 500, 1, true);
    wideAnimation.addFrame(0, 0);
    this.entity.addAnimation(wideAnimation);
    
    var platformAnimation = new Animation(AM.getAsset("./img/enemy/forest boss platform.png"), 150, 500, 1, true);
    platformAnimation.addFrame(0, 0);
    this.entity.addAnimation(platformAnimation);
}

ForestBossArm.prototype = {
    
    update: function () {
        
        //If the arm is hiding, its entity is practically removed from the game temporarily.
        if (this.currentState === ARM_STATE.HIDING) {
            this.entity.height = 0;
            this.entity.y = this.originY;
            //Set to be non-collidable to avoid catching the player on the invisible entity.
            this.entity.collidable = false;
        } else {
            //Arm should always be collidable when it is above ground.
            this.entity.collidable = true;
        }
        
        //If the arm is rising, increase its height by its speed.
        if (this.currentState === ARM_STATE.RISING) {
            if (ARM_MAX_HEIGHT - this.getHeight() <= this.speed) {
                //The arm would exceed its max height.
                this.entity.game.requestMove(this, 0, -1 * (ARM_MAX_HEIGHT - this.getHeight()) );
            } else {
                this.entity.game.requestMove(this, 0, -1 * this.speed);
            }
        }
        
        //If the arm is resting, it waits for a period of time before falling.
        if (this.currentState === ARM_STATE.RESTING) {
            if (this.currentRest <= 0) {
                this.currentState = ARM_STATE.FALLING;
            } else {
                this.currentRest--;
            }
        }
        
        //If the arm is falling, decrease its height by its speed, and drag any entities with it.
        if (this.currentState === ARM_STATE.FALLING) {
            //Determine which agents are on top of the platform before moving.
            var agentsToDrag = this.entity.game.getTopCollisions(this.entity);
            
            if (this.getHeight() <= this.speed) {
                //The arm would fall past its base.
                this.entity.height = 0;
                this.entity.game.requestMove(this, 0, this.getHeight());
            } else {
                this.entity.height -= this.speed;
                this.entity.game.requestMove(this, 0, this.speed);
            }            
            
            //After moving, drag any agents on top of the platform down with it.
            for (var i = 0; i < agentsToDrag.length; i++) {
                this.entity.game.requestMove(agentsToDrag[i], 0, this.speed);
            }
        }
        
        //Update the entity and animation based on the current height.
        this.entity.height = this.getHeight() - 1;
        var anim = this.entity.animationList[this.entity.currentAnimation];
        anim.frameHeight = this.getHeight();
        
        //An arm begins resting after reaching its max height while rising.
        if (this.getHeight() === ARM_MAX_HEIGHT && this.currentState === ARM_STATE.RISING) {
            this.currentState = ARM_STATE.RESTING;
            this.currentRest = this.restTime;
        }
        
        //An arm begins hiding after reaching its base while falling.
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
    
    //Setting the size sets both the entity width and the animation.
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
        if (size === ANIM.PLATFORM) {
            this.entity.width = 150;
        }
        
        this.entity.setAnimation(size);
    },
    
    checkListeners: function(agent) {
        if (agent.entity.controllable && this.entity.currentAnimation !== ANIM.PLATFORM) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
    
}
    


/*
 * The Forest Boss Core is a block that is on top of one of the Forest Boss Arms.
 * If the player strikes the core, they do damage to the Forest Boss.
 */
function ForestBossCore(game, AM, x, y, callback) {
    this.entity = new Entity(game, x, y, 0, 0);
    this.entity.moveable = true;
    this.arm;
    this.callback = callback;
    
    var normalAnimation = new Animation(AM.getAsset("./img/enemy/forest boss weak point.png"), 50, 0, 1, true);
    normalAnimation.addFrame(50, 0);
    this.entity.addAnimation(normalAnimation);
}

ForestBossCore.prototype = {
    
    update: function () {
        //The arm being set to null means that the core will not spawn.
        if (this.arm === null) return;
        
        var animation = this.entity.animationList[this.entity.currentAnimation];
        this.entity.x = this.arm.entity.x + 100;
        
        //Emerge if the arm has reached its apex.
        if (this.arm.currentState === ARM_STATE.RESTING) { 
            if (animation.frameHeight === 0) {
                this.entity.y = this.arm.entity.y - 1;
            }
            
            var moveUp = Math.min(10, 50 - animation.frameHeight);            
            animation.frameHeight += moveUp;
            this.entity.game.requestMove(this, 0, -1 * moveUp);
            this.entity.height += moveUp;
        } else {
            var moveDown = Math.min(10, animation.frameHeight);
            animation.frameHeight -= moveDown;
            this.entity.game.requestMove(this, 0, moveDown);
            this.entity.height -= moveDown;
        }
        
        if (this.entity.height > 0) this.entity.collidable = true;
        else this.entity.collidable = false;
    },
    
    draw: function() {
        this.entity.draw();
    },
    
    readInput: function(input, modifier) {
        if (input === "damage") {
            if (this.callback.pattern !== PATTERN.RETREAT) {
                this.callback.takeDamage();
            }
        }
    },
}