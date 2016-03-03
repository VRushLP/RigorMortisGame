/**
 * An Entity is the physical representation of some object.
 * The entity contains the object's x and y coordinates, animations,
 * and handles drawing of animation frames.
 */
function Entity(x, y, width, height) {
    this.animationList = [];
    this.currentAnimation = 0;
    //Used for respawning the entity.
    this.originX = x;
    this.originY = y;
    
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.controllable = false;
    this.moveable = false;
    this.camerable = false;
    this.respawnable = false;
    this.collidable = true;
    this.pushesOnly = false;
    this.temporary = false;
    
    this.removeFromWorld = false;
    this.removeUponReset = false;
}

Entity.prototype = {

    /*
     * Request the entity to draw the current animation frame.
     */
    draw: function (game, cameraX, cameraY) {
        if (this.animationList.length <= 0) {
            return;
        }
        if (typeof(this.animationList[this.currentAnimation]) === 'undefined') {
            console.log(this);
        }
        this.animationList[this.currentAnimation]
            .drawFrame(game.clockTick, game.ctx, this.x + cameraX, this.y - cameraY);
    },

    /*
     * Add a new animation to the entity's list of animations.
     */
    addAnimation: function (newAnimation) {
        this.animationList.push(newAnimation);
    },

    /*
     * Set the current animation that the entity will draw.
     */
    setAnimation: function (animation) {
        if (this.currentAnimation !== animation) {
            this.animationList[this.currentAnimation].elapsedTime = 0;
        }
        this.currentAnimation = animation;
    },
    
    getCenter: function () {
        return {
            x: (this.x + (this.width) / 2),
            y: (this.y + (this.height) / 2)
        }
    }
}
