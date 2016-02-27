//The behavioral states of the forest boss.
var FB_ARM_STATE = {
    RISING: 0,
    RESTING: 1,
    FALLING: 2,
    HIDING: 3
}

//Thin, Normal, and Wide are all damaging spikes of various sizes.
//Platform is a safe arm for the player to land on, and may contain the core.
var FB_ANIM = {
    THIN: 0, //50px
    NORMAL: 1, //100px
    WIDE: 2, //150px
    PLATFORM: 3 //150px
}

//The behavioral patterns of the forest boss.
var FB_PATTERN = {
    NEUTRAL: 0,
    RETREAT: 1,
    ATTACK: 2
}

var FB_ATTR = {
    //The amount of room reserved to the left of the forest boss.
    LEFT_SIDE_BUFFER: 100,
    //The distance between each arm.
    ARM_STRIDE: 250,
    //The absolute maximum height that an arm should ever reach.
    ARM_MAX_HEIGHT: 500,
    
    //The forest boss transitions between phases based on its health.
    //Phases increase speed and width of spikes.
    MAX_HEALTH: 9,
    PHASE_1_HEALTH: 6,
    PHASE_2_HEALTH: 3,

    CORE_BUFFER : 50,
    
    CORE_BUFFER : 50,
    
    //Phase Number: Added Speed
    PHASE_SPEED_BUFF: {
        0: 0,
        1: 1,
        2: 2
    },
    
    //Phase Number: Rest Time
    PHASE_REST_TIME: {
        0: 125,
        1: 100,
        2: 75
    },
    
    NEUTRAL_BASE_SPEED: 2,
    RETREAT_BASE_SPEED: 8,
    //Each arm has a different attack speed.
    ATTACK_BASE_SPEED: {
        0: 4,
        1: 4.5,
        2: 5,
        3: 6
    },
    
    SPAWN_TIME: 150,
    HELPER_PLATFORM_HEIGHT: 350,
}

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
    this.exitAgents = [];
    
    //Set the default states of the forest boss.
    this.speed = 0;
    this.phase = 0;
    this.spawnTimeRemaining = FB_ATTR.SPAWN_TIME;
    this.health = FB_ATTR.MAX_HEALTH;
    this.pattern = FB_PATTERN.NEUTRAL;    
    this.currentAttackAnim = FB_ANIM.THIN;
    
    //Initialize the forest boss arms and core.
    this.arms = [];
    for (var i = 0; i < 4; i++) {
        this.arms.push(new ForestBossArm(game, AM,  x + FB_ATTR.LEFT_SIDE_BUFFER + i * FB_ATTR.ARM_STRIDE,  y));
        this.arms[i].setSize(this.currentAttackAnim);
        //Arms are shuffled and unshuffled, so they need to keep track of their original position.
        this.arms[i].originalPos = i;
        stage.entityList.push(this.arms[i]);
    }
    
    this.core = new ForestBossCore(game, AM, x, y, this);
    stage.entityList.push(this.core);
    
    this.setNormalDistro();
    this.neutralPattern();
}

ForestBoss.prototype = {
    
    //The Forest Boss waits for all of its arms to return to the hidden state
    //before determining which distribution and pattern they should assume next.
    update: function () {    
        
        //If the Forest Boss has not spawned yet, do not do anything.
        if (this.spawnTimeRemaining > 0) {
            this.spawnTimeRemaining--;
            return;
        }
        
        if (this.allArmsHidden()) {

            if (this.pattern === FB_PATTERN.RETREAT) {
                //Check for death.
                if (this.health <= 0) {
                    this.selfDestruct();
                    return;
                }                
                this.setAttackDistro();
                this.attackPattern();

            } else if (this.pattern === FB_PATTERN.ATTACK) {
                this.setNormalDistro();
                this.neutralPattern();
                
            } else if (this.pattern === FB_PATTERN.NEUTRAL) {
                this.setNormalDistro();            
                this.neutralPattern();
            }
        }
    },
    
    
    /************
     * Patterns *
     ************/
    
    //The neutral pattern raises all arms at the same speed.
    neutralPattern: function () {
        this.pattern = FB_PATTERN.NEUTRAL;
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].speed = FB_ATTR.NEUTRAL_BASE_SPEED + FB_ATTR.PHASE_SPEED_BUFF[this.phase];
            this.arms[i].restTime = FB_ATTR.PHASE_REST_TIME[this.phase];
            this.arms[i].currentState = FB_ARM_STATE.RISING;
        }
    },
    
    //The retreat pattern immediately lowers all arms at a fast speed.
    retreatPattern: function () {
        this.pattern = FB_PATTERN.RETREAT;
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].speed = FB_ATTR.RETREAT_BASE_SPEED;
            this.arms[i].currentState = FB_ARM_STATE.FALLING;
        }
    },
    
    //The attack pattern shuffles the arms and raises them at varying speeds.
    attackPattern: function () {
        this.pattern = FB_PATTERN.ATTACK;
        
        this.shuffleArms();        
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].speed = FB_ATTR.ATTACK_BASE_SPEED[i] + FB_ATTR.PHASE_SPEED_BUFF[this.phase];
            this.arms[i].restTime = 0;
            this.arms[i].currentState = FB_ARM_STATE.RISING;
        }        
        this.unshuffleArms();
    },
    
    
    /*****************
     * Distributions *
     *****************/
    
    //The normal distribution randomly assigns two adjacent platforms, one containing
    //the core, and two damaging spikes.
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
            //Reset platform height
            this.arms[i].maxHeight = FB_ATTR.ARM_MAX_HEIGHT;
            
            if (i === corePos) this.arms[i].setSize(FB_ANIM.PLATFORM);
            else if (i === supportPlatform) {
                this.arms[i].setSize(FB_ANIM.PLATFORM);
                this.arms[i].maxHeight = FB_ATTR.HELPER_PLATFORM_HEIGHT;
            } 
            else this.arms[i].setSize(this.currentAttackAnim);
        }
    },
    
    //The Attack Distribution sets all arms to damaging spikes.
    setAttackDistro: function () {
        this.core.arm = null;
        for (var i = 0; i < this.arms.length; i++) {
            //Reset platform height
            this.arms[i].maxHeight = FB_ATTR.ARM_MAX_HEIGHT;
            
            this.arms[i].setSize(this.currentAttackAnim);
        }
    },
    
    
    
    /***********
     * Utility *
     ***********/
    
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
    
    //Lower health and preemptively go into a retreat pattern.
    //Check here if current health should cause a phase change.
    takeDamage: function () {
        this.health--;
        for (var i = 0; i < this.arms.length; i++) {
            this.retreatPattern();
        }
        
        if (this.health === FB_ATTR.PHASE_1_HEALTH) this.phase = 1;
        if (this.health === FB_ATTR.PHASE_2_HEALTH) this.phase = 2;

        if (this.phase === 1) this.currentAttackAnim = FB_ANIM.NORMAL;
        if (this.phase === 2) this.currentAttackAnim = FB_ANIM.WIDE;
    },
    
    //Remove the Forest Boss arms, core, and the controller from world and switch the music back..
    selfDestruct: function () {
        var gameEngine = this.entity.game;
        for (var i = 0; i < this.arms.length; i++) {
            this.arms[i].entity.removeFromWorld = true;
        }
        this.core.entity.removeFromWorld = true;
        this.entity.removeFromWorld = true;
        
        var originalBGM = this.entity.game.stages[this.entity.game.currentStage].stageMusic;
        this.entity.game.switchMusic(originalBGM);
        this.openExit();
        
        gameEngine.camera.frozen = true;
        gameEngine.camera.mode = CAMERA_MODE.PAN_THEN_INSTANT;
        gameEngine.camera.speedX = 3;
        gameEngine.camera.speedY = 3;
        gameEngine.cameraAgent = gameEngine.playerAgent;
        gameEngine.camera.frozen = false;
    },
    
    //Return true if the current state of all arms is hidden.
    allArmsHidden: function () {
        for (var i = 0; i < this.arms.length; i++) {
            if (this.arms[i].currentState !== FB_ARM_STATE.HIDING) return false;
        }
        return true;
    },
    
    readInput: function(input, modifier) {
        if (input === "reset") {
            this.health = FB_ATTR.MAX_HEALTH;
            this.phase = 0;
            this.currentAttackAnim = FB_ANIM.THIN;
        }
    },
    
    openExit: function () {
        for (var i = 0; i < this.exitAgents.length; i++) {
            this.exitAgents[i].entity.removeFromWorld = true;   
        }
    }
}



/*
 * A Forest Boss Arm is either a thin/normal/wide spike, or a platform.
 * Arms have four states, and independently determine what they should do
 * based on certain parameters provided by Forest Boss.
 */
function ForestBossArm(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 50, 0);
    this.entity.moveable = true;
    
    this.currentState = FB_ARM_STATE.HIDING;
    //OriginY is the base of the arm, and is used for calculating its height/return points.
    this.originY = y;
    this.speed = 0;
    this.size = FB_ANIM.THIN;
    //Original Position is relative to the arms, and is used when unshuffling them.
    this.originalPos = 0;
    this.maxHeight = FB_ATTR.ARM_MAX_HEIGHT;
    
    //Determines how long the arm waits between rising to its peak and then falling.
    this.restTime = 0;
    this.currentRest = 0;
    
    var thinAnimation = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss spike 50px.png"), 50, 500, 1, true);
    thinAnimation.addFrame(0, 0);
    this.entity.addAnimation(thinAnimation);
    
    var normalAnimation = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss spike 100px.png"), 100, 500, 1, true);
    normalAnimation.addFrame(0, 0);
    this.entity.addAnimation(normalAnimation);
    
    var wideAnimation = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss spike 150px.png"), 150, 500, 1, true);
    wideAnimation.addFrame(0, 0);
    this.entity.addAnimation(wideAnimation);
    
    var platformAnimation = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss platform.png"), 150, 500, 1, true);
    platformAnimation.addFrame(0, 0);
    this.entity.addAnimation(platformAnimation);
}

ForestBossArm.prototype = {
    
    //On each update, check the current state and act accordingly.
    update: function () {        
        //If the arm is hiding, its entity is practically removed from the game temporarily.
        if (this.currentState === FB_ARM_STATE.HIDING) {
            this.entity.height = 0;
            this.entity.y = this.originY;
            //Set to be non-collidable to avoid catching the player on the invisible entity.
            this.entity.collidable = false;
        } else {
            //Arm should always be collidable when it is above ground.
            this.entity.collidable = true;
        }
        
        //If the arm is rising, increase its height by its speed.
        if (this.currentState === FB_ARM_STATE.RISING) {
            if (this.maxHeight - this.getHeight() <= this.speed) {
                //The arm would exceed its max height.
                this.entity.game.requestMove(this, 0, -1 * (this.maxHeight - this.getHeight()) );
            } else {
                this.entity.game.requestMove(this, 0, -1 * this.speed);
            }
        }
        
        //If the arm is resting, it waits for a period of time before falling.
        if (this.currentState === FB_ARM_STATE.RESTING) {
            if (this.currentRest <= 0) {
                this.currentState = FB_ARM_STATE.FALLING;
            } else {
                this.currentRest--;
            }
        }
        
        //If the arm is falling, decrease its height by its speed, and drag any entities with it.
        if (this.currentState === FB_ARM_STATE.FALLING) {
            //Determine which agents are on top of the platform before moving.
            var agentsToDrag = this.entity.game.getTopCollisions(this);
            
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
        
        
        
        //Update the entity and animation based on the updated height.
        this.entity.height = this.getHeight() - 1;
        var anim = this.entity.animationList[this.entity.currentAnimation];
        anim.frameHeight = this.getHeight();
        
        //An arm begins resting after reaching its max height while rising.
        if (this.getHeight() === this.maxHeight && this.currentState === FB_ARM_STATE.RISING) {
            this.currentState = FB_ARM_STATE.RESTING;
            this.currentRest = this.restTime;
        }
        
        //An arm begins hiding after reaching its base while falling.
        if (this.getHeight() <= this.speed && this.currentState === FB_ARM_STATE.FALLING) {
            this.currentState = FB_ARM_STATE.HIDING;
        }
    },
    
    
    //Set the size by updating both the entity width and the animation.
    setSize: function (size) {
        this.entity.setAnimation(size);
        this.entity.width = this.entity.animationList[size].frameWidth;
    },
    
    //Request for the arm to begin rising.
    rise: function () {
        this.currentState = FB_ARM_STATE.RISING;
    },
    
    //Calculate the difference between the current top of the arm and its origin base.
    getHeight: function () {
        return this.originY - this.entity.y;
    },
    
    checkListeners: function(agent) {
        if (agent.entity.controllable && this.entity.currentAnimation !== FB_ANIM.PLATFORM) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
    
}
    


/*
 * The Forest Boss Core is a block that is on top of one of the Forest Boss Arms.
 * If the player strikes the core, they do damage to the Forest Boss.
 * callback: The forest boss controller to preemptively request state changes to.
 */
function ForestBossCore(game, AM, x, y, callback) {
    this.entity = new Entity(game, x, y, 0, 0);
    this.entity.moveable = true;
    this.entity.intangible = true;
    this.arm;
    this.callback = callback;
    
    //The core is hidden by default, so set its initial height to zero.
    var normalAnimation = new Animation(AM.getAsset("./img/enemy/forest boss/forest boss weak point.png"), 50, 0, 1, true);
    normalAnimation.addFrame(50, 0);
    this.entity.addAnimation(normalAnimation);
}

ForestBossCore.prototype = {
    
    update: function () {
        //The arm being set to null means that the core will not spawn.
        if (this.arm === null) return;
        
        var animation = this.entity.animationList[this.entity.currentAnimation];
        //Spawn the core on the right side of the platform.
        this.entity.x = this.arm.entity.x + FB_ATTR.CORE_BUFFER;
        
        //Emerge if the arm has reached its apex.
        if (this.arm.currentState === FB_ARM_STATE.RESTING) { 
            
            //Quick fix to avoid collision bugs.
            if (animation.frameHeight === 0) {
                this.entity.y = this.arm.entity.y - 1;
            }
            
            //Determine how much to reveal the core, and change both the animation height
            //and entity height accordingly, and then move that entity upwards.
            var moveUp = Math.min(10, 50 - animation.frameHeight);             
            animation.frameHeight += moveUp;
            this.entity.game.requestMove(this, 0, -1 * moveUp);
            this.entity.height += moveUp;
        } else {
            //Repeat a similar process as moving up.
            var moveDown = Math.min(10, animation.frameHeight);
            animation.frameHeight -= moveDown;
            this.entity.game.requestMove(this, 0, moveDown);
            this.entity.height -= moveDown;
        }
        
        //If the core has emerged, make it collidable.
        if (this.entity.height > 0) this.entity.collidable = true;
        else this.entity.collidable = false;
    },
    
    readInput: function(input, modifier) {
        if (input === "damage") {
            if (this.callback.pattern !== FB_PATTERN.RETREAT) {
                this.callback.takeDamage();
            }
        }
    }
}