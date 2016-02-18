/**
 * An Entity is the physical representation of some object.
 * The entity contains the object's x and y coordinates, animations,
 * and handles drawing of animation frames.
 */
function Entity(game, x, y, width, height) {
    this.animationList = [];
    this.currentAnimation = 0;
    
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.game = game;
    this.ctx = game.ctx;
    this.controllable = false;
    this.moveable = false;
    this.fallable = false;
    this.camerable = false;
    this.respawnable = false;
    this.collidable = true;
}

Entity.prototype = {

    /*
     * Request the entity to draw the current animation frame.
     */
    draw: function (cameraX, cameraY) {
        if (this.animationList.length <= 0) {
            return;
        }
        this.animationList[this.currentAnimation]
            .drawFrame(this.game.clockTick, this.ctx, this.x + cameraX, this.y - cameraY);
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
    }

}
