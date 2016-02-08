var SKELETON_ATTR = {
    STARTING_HEALTH: 3,
    INVULNERABILITY_FRAMES: 40,
}

var SKELETON_ANIM = {
    STANDING_RIGHT: 0,
    STANDING_LEFT: 1,
}

/**
  * Create a new Normal Skeleton.
  */
function Skeleton(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 52, 60);
    
    this.health = SKELETON_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.yVelocity = 0;
    this.xVelocity = 1;
    
    var skeletonRight = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonRight.addFrame(52, 0);
    var skeletonLeft = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonLeft.addFrame(0, 0);
    
    this.entity.addAnimation(skeletonRight);
    this.entity.addAnimation(skeletonLeft);
    this.entity.setAnimation(SKELETON_ANIM.STANDING_RIGHT);
}

Skeleton.prototype = {
    
    update: function() {
        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;
        }
        if (this.health <= 0) {
            var index = this.entity.game.agents.indexOf(this);
            this.entity.game.agents.splice(index, 1);
        }
        
        
        if (this.xVelocity > 0) {
            this.entity.currentAnimation = SKELETON_ANIM.STANDING_RIGHT;
        } else {
            this.entity.currentAnimation = SKELETON_ANIM.STANDING_LEFT;
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
            }
        }
    },
    
    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}