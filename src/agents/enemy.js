var SKELETON_ATTR = {
    STARTING_HEALTH: 3,
    SPEED : 3,
    INVULNERABILITY_FRAMES: 40,
    ATTENTION_DISTANCE : 400,
    VERTICAL_TOLERANCE : 250,
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
    this.entity.moveable = true;
    
    this.health = SKELETON_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.yVelocity = 0;
    this.xVelocity = 1;
    this.xDestination = x;
    this.yDestination = y;
    this.confused = false;
    
    var skeletonRight = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonRight.addFrame(52, 0);
    var skeletonLeft = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonLeft.addFrame(0, 0);
    
    this.entity.addAnimation(skeletonRight);
    this.entity.addAnimation(skeletonLeft);
    this.entity.setAnimation(SKELETON_ANIM.STANDING_RIGHT);
}

Skeleton.prototype = {
    
    update: function () {
        var player = this.entity.game.playerAgent.entity;

        if (this.entity.game.playerAgent.hasOwnProperty('velocity') && this.entity.game.playerAgent.velocity === 0) {
            var xCheck = player.x + (player.width) / 2;

            if (xCheck > this.entity.x - SKELETON_ATTR.ATTENTION_DISTANCE || xCheck < this.entity + SKELETON_ATTR.ATTENTION_DISTANCE) {
                console.log("Close enough!");
                this.xDestination = player.x;
            }
        }
        //else Don't update your x destinations.

        if (!this.confused && this.entity.x !== this.xDestination) {
            var distance = this.entity.x - this.xDestination;
            distance = -1 * distance; //Reassign so negative values are to your left, positive values are to your right

            if (distance < 0) {
                this.entity.currentAnimation = SKELETON_ANIM.STANDING_LEFT;
                this.entity.game.requestMove(this, Math.max(distance, -SKELETON_ATTR.SPEED), 0);
            } else {
                this.entity.currentAnimation = SKELETON_ANIM.STANDING_RIGHT;
                this.entity.game.requestMove(this, Math.min(distance, SKELETON_ATTR.SPEED), 0);
            }
        }

        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;
            if(this.invulnerableFrames === 0)
            {
                this.confused = false;
            }

        }
        if (this.health <= 0) {
            var index = this.entity.game.agents.indexOf(this);
            this.entity.game.agents.splice(index, 1);
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
                this.confused = true;
            }
        }
    },
    
    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}