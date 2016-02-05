var GAME_CONSTANT = {
    BLOCK_SIZE : 50,
    
    DAMAGE : 2,
    MAX_HEALTH : 20,
    INJURE_TIME : 2,
    
    ARCHER_HEALTH : 4,
    SHOOTING_TIME : 2,
    SKELETON_HEALTH : 6,
    
    //Animation Constants
    REST_RIGHT_ANIMATION : 0,
    REST_LEFT_ANIMATION : 1,
    WALKING_RIGHT_ANIMATION : 2,
    WALKING_LEFT_ANIMATION : 3,
    JUMPING_RIGHT_ANIMATION : 4,
    JUMPING_LEFT_ANIMATION : 5,
    FALLING_RIGHT_ANIMATION : 6,
    FALLING_LEFT_ANIMATION : 7,
    ATTACKING_RIGHT_ANIMATION : 8,
    ATTACKING_LEFT_ANIMATION : 9,
    HIT_RIGHT_ANIMATION : 10,
    HIT_LEFT_ANIMATION : 11,

    //Physics Constants
    TERMINAL_VELOCITY : 16,
    //Initial jump velocity for tapping jump.
    JUMP_SPEED : 12,
    //Gravity's downward acceleration
    Y_ACCELERATION : 0.35,
    RUNNING_SPEED : 5,
    //Extra velocity added for holding down while falling.
    PRESS_DOWN_SPEED : 2,
    //Gravity reduction for holding up while rising.
    PRESS_UP_SPEED : 0.17
}

/**
 * An Entity is the physical object representation of player, monsters, boss.
 * The entity contains the object's x and y coordinates, animations,
 * and handles drawing of animation frames.
 */
function Entity(x, y, width, height) {
    this.animationList = [];
    this.currentAnimation = 0;
    
    this.currentX_px = x * GAME_CONSTANT.BLOCK_SIZE;
    this.currentY_px = y * GAME_CONSTANT.BLOCK_SIZE;
    this.width = width;
    this.height = height;
    
    // Every entity represents as an rectangle. 
    this.rect = new Rectangle(this.currentX_px, this.currentY_px, this.width, this.height);
}

Entity.prototype = {
    update : function () {
        this.rect.set(this.currentX_px, this.currentY_px);
    },
    /*
     * Request the entity to draw the current animation frame.
     */
    draw : function (ctx, cameraRect, tick) {   
        if (this.rect.overlap(cameraRect) || this.rect.within(cameraRect)) { 
            if (this.animationList.length > 0) {
                this.animationList[this.currentAnimation].drawFrame(tick, 
                                    ctx, this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top);
            }
        } 
    }
}