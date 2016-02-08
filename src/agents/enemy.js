function Skeleton(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 52, 60);
    
    this.health = 3;
    this.invulnerableFrames = 0;
    this.yVelocity = 0;
    this.xVelocity = 1;
    
    var skeletonRight = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonRight.addFrame(52, 0);
    var skeletonLeft = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonLeft.addFrame(0, 0);
    
    this.entity.addAnimation(skeletonRight);
    this.entity.addAnimation(skeletonLeft);
    this.entity.setAnimation(0);
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
            this.entity.currentAnimation = 0;
        } else {
            this.entity.currentAnimation = 1;
        }
    },
    
    draw: function() {
        this.entity.draw();
    },
    
    readInput: function(input, modifier) {
        if (input === "damage") {
            if (this.invulnerableFrames === 0) {
                this.invulnerableFrames = 30;
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